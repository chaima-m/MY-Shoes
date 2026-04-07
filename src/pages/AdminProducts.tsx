// src/pages/AdminProducts.tsx

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Upload, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";

const categories = ["Femmes", "Homme", "Sportif", "Talons", "Claquettes", "Basket"];
const availableSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const availableColors = [
  "Noir", "Blanc", "Rouge", "Bleu", "Vert", "Jaune", "Rose",
  "Gris", "Marron", "Beige", "Orange", "Violet",
];

// stock map: "color__size" -> quantity string
type VariantStockMap = Record<string, string>;

interface Variant {
  id?: string;
  product_id?: string;
  size: number;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discount: number;
  stock: number; // kept for backward compat / dashboard low-stock
  sizes: number[];
  colors: string[];
  images: string[];
  description?: string;
}

const variantKey = (color: string, size: number) => `${color}__${size}`;

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  // ── form state ────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    discount: "0",
    sizes: [] as number[],
    colors: [] as string[],
    images: [] as string[],
    description: "",
  });

  // variant stock grid: key = "color__size", value = qty string
  const [variantStock, setVariantStock] = useState<VariantStockMap>({});

  // ── fetch ─────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch {
      toast.error("خطأ في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── helpers ───────────────────────────────────────────────
  const toggleSize = (size: number) => {
    const next = formData.sizes.includes(size)
      ? formData.sizes.filter((s) => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: next });
  };

  const toggleColor = (color: string) => {
    const next = formData.colors.includes(color)
      ? formData.colors.filter((c) => c !== color)
      : [...formData.colors, color];
    setFormData({ ...formData, colors: next });
  };

  const setStock = (color: string, size: number, val: string) => {
    setVariantStock((prev) => ({ ...prev, [variantKey(color, size)]: val }));
  };

  const getStock = (color: string, size: number): string =>
    variantStock[variantKey(color, size)] ?? "0";

  // total stock = sum of all variant stocks
  const computeTotalStock = (): number =>
    Object.values(variantStock).reduce((s, v) => s + (parseInt(v) || 0), 0);

  // ── image upload ──────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        urls.push(publicUrl);
      }
      setFormData((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.success(`تم رفع ${urls.length} صورة`);
    } catch {
      toast.error("خطأ في رفع الصور");
    } finally {
      setUploading(false);
    }
  };

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (formData.sizes.length === 0 || formData.colors.length === 0) {
      toast.error("يرجى اختيار المقاسات والألوان");
      return;
    }

    const totalStock = computeTotalStock();

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount) || 0,
      stock: totalStock,
      sizes: formData.sizes,
      colors: formData.colors,
      images: formData.images,
      description: formData.description,
    };

    try {
      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Upsert variants
      const variantRows: Omit<Variant, "id">[] = [];
      for (const color of formData.colors) {
        for (const size of formData.sizes) {
          variantRows.push({
            product_id: productId!,
            size,
            color,
            stock: parseInt(getStock(color, size)) || 0,
          });
        }
      }

      if (variantRows.length > 0) {
        const { error: varErr } = await supabase
          .from("product_variants")
          .upsert(variantRows, { onConflict: "product_id,size,color" });
        if (varErr) throw varErr;
      }

      // If editing: delete variants for removed colors/sizes
      if (editingProduct) {
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", editingProduct.id)
          .not("color", "in", `(${formData.colors.map((c) => `"${c}"`).join(",")})`)
          ;
        // simpler: just delete all and re-insert
        // Already handled by upsert above; orphan cleanup:
        for (const color of availableColors.filter((c) => !formData.colors.includes(c))) {
          await supabase
            .from("product_variants")
            .delete()
            .eq("product_id", editingProduct.id)
            .eq("color", color);
        }
        for (const size of availableSizes.filter((s) => !formData.sizes.includes(s))) {
          await supabase
            .from("product_variants")
            .delete()
            .eq("product_id", editingProduct.id)
            .eq("size", size);
        }
      }

      toast.success(editingProduct ? "تم تحديث المنتج" : "تم إضافة المنتج");
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("خطأ في حفظ المنتج");
    }
  };

  // ── edit ──────────────────────────────────────────────────
  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      discount: product.discount?.toString() || "0",
      sizes: product.sizes,
      colors: product.colors,
      images: product.images,
      description: product.description || "",
    });

    // Load existing variants
    const { data: variants } = await supabase
      .from("product_variants")
      .select("size, color, stock")
      .eq("product_id", product.id);

    const map: VariantStockMap = {};
    (variants || []).forEach((v: Variant) => {
      map[variantKey(v.color, v.size)] = v.stock.toString();
    });
    setVariantStock(map);
    setDialogOpen(true);
  };

  // ── delete ────────────────────────────────────────────────
  const handleDelete = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      toast.success("تم حذف المنتج");
      fetchProducts();
    } catch {
      toast.error("خطأ في حذف المنتج");
    }
  };

  // ── reset ─────────────────────────────────────────────────
  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "", category: "", price: "", discount: "0",
      sizes: [], colors: [], images: [], description: "",
    });
    setVariantStock({});
  };

  // ── stock grid summary for card ───────────────────────────
  const getTotalVariantStock = async (productId: string): Promise<number> => {
    const { data } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("product_id", productId);
    return (data || []).reduce((s: number, v: { stock: number }) => s + v.stock, 0);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">إدارة المنتجات</h1>
            <p className="text-gray-500 mt-1">Gestion des produits</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white gap-2">
                <PlusCircle className="h-4 w-4" />
                إضافة منتج
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                {/* Name */}
                <div>
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: حذاء رياضي نايك" required className="mt-1" />
                </div>

                {/* Category */}
                <div>
                  <Label>الفئة *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price + Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر (DA) *</Label>
                    <Input id="price" type="number" step="0.01" min="0" value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="discount">التخفيض (%)</Label>
                    <Input id="discount" type="number" min="0" max="100" value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })} className="mt-1" />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <Label>المقاسات المتاحة *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSizes.map((size) => (
                      <Button key={size} type="button" size="sm"
                        variant={formData.sizes.includes(size) ? "default" : "outline"}
                        onClick={() => toggleSize(size)}
                        className={formData.sizes.includes(size) ? "bg-accent text-white" : ""}>
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <Label>الألوان المتاحة *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableColors.map((color) => (
                      <Button key={color} type="button" size="sm"
                        variant={formData.colors.includes(color) ? "default" : "outline"}
                        onClick={() => toggleColor(color)}
                        className={formData.colors.includes(color) ? "bg-accent text-white" : ""}>
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* ── STOCK GRID ───────────────────────────────────────── */}
                {formData.sizes.length > 0 && formData.colors.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-accent" />
                      المخزون حسب اللون والمقاس
                    </Label>
                    <p className="text-xs text-gray-400 mb-3 mt-1">
                      أدخل عدد القطع المتوفرة لكل مجموعة (لون × مقاس)
                    </p>

                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-right px-3 py-2 font-medium text-gray-500 border-b border-r border-gray-100">
                              اللون \ المقاس
                            </th>
                            {formData.sizes.map((size) => (
                              <th key={size} className="px-3 py-2 font-semibold text-center text-gray-700 border-b border-gray-100 min-w-[64px]">
                                {size}
                              </th>
                            ))}
                            <th className="px-3 py-2 font-medium text-gray-400 border-b border-gray-100 text-center">
                              المجموع
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.colors.map((color, ci) => {
                            const rowTotal = formData.sizes.reduce(
                              (s, size) => s + (parseInt(getStock(color, size)) || 0), 0
                            );
                            return (
                              <tr key={color} className={ci % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                <td className="px-3 py-2 font-medium text-gray-700 border-r border-gray-100 whitespace-nowrap">
                                  {color}
                                </td>
                                {formData.sizes.map((size) => (
                                  <td key={size} className="px-2 py-1.5 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={getStock(color, size)}
                                      onChange={(e) => setStock(color, size, e.target.value)}
                                      className="w-14 text-center border border-gray-200 rounded-lg py-1 px-1 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                                    />
                                  </td>
                                ))}
                                <td className="px-3 py-2 text-center">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    rowTotal === 0 ? "bg-red-100 text-red-600" :
                                    rowTotal < 5 ? "bg-orange-100 text-orange-600" :
                                    "bg-green-100 text-green-700"
                                  }`}>
                                    {rowTotal}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 border-t border-gray-100">
                            <td className="px-3 py-2 font-medium text-gray-500 border-r border-gray-100">
                              مجموع المقاس
                            </td>
                            {formData.sizes.map((size) => {
                              const colTotal = formData.colors.reduce(
                                (s, color) => s + (parseInt(getStock(color, size)) || 0), 0
                              );
                              return (
                                <td key={size} className="px-3 py-2 text-center">
                                  <span className="text-xs font-semibold text-gray-600">{colTotal}</span>
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center">
                              <span className="text-xs font-bold text-accent">{computeTotalStock()}</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      المخزون الإجمالي: <strong className="text-accent">{computeTotalStock()}</strong> قطعة
                    </p>
                  </div>
                )}

                {/* Images */}
                <div>
                  <Label>صور المنتج</Label>
                  <div className="mt-2">
                    <label className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-accent transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">{uploading ? "جاري الرفع..." : "اضغط لرفع الصور"}</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
                      </div>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload}
                        className="hidden" disabled={uploading} />
                    </label>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square">
                            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                            <button type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}>
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Textarea id="description" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3} className="mt-1" placeholder="وصف المنتج..." />
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                  {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-50 relative">
                  <img src={product.images[0] || "/placeholder.svg"} alt={product.name}
                    className="w-full h-full object-cover" />
                  {product.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{product.discount}%
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold bg-red-600 px-3 py-1 rounded">نفد المخزون</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-accent">{product.price} DA</span>
                      {product.discount > 0 && (
                        <span className="text-xs text-gray-400 ml-1">
                          → {(product.price * (1 - product.discount / 100)).toFixed(0)} DA
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      product.stock === 0 ? "text-red-500" :
                      product.stock < 10 ? "text-orange-500" : "text-green-600"
                    }`}>
                      {product.stock} قطعة
                    </span>
                  </div>

                  {/* Sizes preview */}
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.map((s) => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(product)}>
                      <Edit className="h-3 w-3 mr-1" />تعديل
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;