// src/pages/ProductDetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  stock: number;
  images: string[];
  category: string;
  sizes: number[];
  colors: string[];
  description?: string;
}

interface Variant {
  size: number;
  color: string;
  stock: number;
}

// variant lookup map: "color__size" -> stock
type VariantMap = Record<string, number>;

const variantKey = (color: string, size: number) => `${color}__${size}`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<VariantMap>({});
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const [productRes, variantsRes] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("product_variants").select("size, color, stock").eq("product_id", id),
      ]);

      if (productRes.error) throw productRes.error;
      setProduct(productRes.data);

      // Build variant map
      const map: VariantMap = {};
      (variantsRes.data || []).forEach((v: Variant) => {
        map[variantKey(v.color, v.size)] = v.stock;
      });
      setVariants(map);

      // Auto-select first available color
      if (productRes.data.colors.length > 0) {
        setSelectedColor(productRes.data.colors[0]);
      }
    } catch {
      toast.error("Produit introuvable");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Stock for a given color+size combination
  const getVariantStock = (color: string, size: number): number => {
    const key = variantKey(color, size);
    // If variant table has data for this product, use it
    if (Object.keys(variants).length > 0) {
      return variants[key] ?? 0;
    }
    // Fallback: no variant data yet, use product-level stock
    return product?.stock ?? 0;
  };

  // Is the currently selected combo available?
  const selectedStock =
    selectedColor && selectedSize
      ? getVariantStock(selectedColor, selectedSize)
      : null;

  // Does a color have ANY available size?
  const colorHasStock = (color: string): boolean => {
    if (!product) return false;
    if (Object.keys(variants).length === 0) return true; // no variant data yet
    return product.sizes.some((s) => getVariantStock(color, s) > 0);
  };

  // Does a size have stock for the currently selected color?
  const sizeHasStockForColor = (size: number): boolean => {
    if (!selectedColor) return true;
    return getVariantStock(selectedColor, size) > 0;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) { toast.error("الرجاء اختيار المقاس"); return; }
    if (!selectedColor) { toast.error("الرجاء اختيار اللون"); return; }

    const stock = getVariantStock(selectedColor, selectedSize);
    if (stock === 0) {
      toast.error("هذا اللون والمقاس غير متوفر حالياً");
      return;
    }

    const finalPrice = product.discount
      ? product.price * (1 - product.discount / 100)
      : product.price;

    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0] || "/placeholder.svg",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const hasVariantData = Object.keys(variants).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={() => navigate("/produits")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au catalogue
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4 animate-fade-in">
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
              <img src={product.images[selectedImage] || "/placeholder.svg"} alt={product.name}
                className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
                    }`}>
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-fade-in">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.description && <p className="text-muted-foreground">{product.description}</p>}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              {product.discount ? (
                <>
                  <span className="text-3xl font-bold text-accent">{finalPrice.toFixed(2)} DA</span>
                  <span className="text-xl text-muted-foreground line-through">{product.price.toFixed(2)} DA</span>
                  <Badge className="bg-accent text-accent-foreground">-{product.discount}%</Badge>
                </>
              ) : (
                <span className="text-3xl font-bold">{product.price.toFixed(2)} DA</span>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold mb-3">
                اللون: {selectedColor && <span className="text-accent">{selectedColor}</span>}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => {
                  const hasStock = colorHasStock(color);
                  return (
                    <button key={color}
                      onClick={() => { if (hasStock) { setSelectedColor(color); setSelectedSize(null); } }}
                      disabled={!hasStock}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedColor === color
                          ? "border-accent bg-accent text-white"
                          : hasStock
                          ? "border-gray-200 hover:border-accent text-gray-700"
                          : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                      }`}>
                      {color}
                      {!hasStock && hasVariantData && (
                        <span className="ml-1 text-xs">✕</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">
                المقاس: {selectedSize && <span className="text-accent">{selectedSize}</span>}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const stockForThis = selectedColor ? getVariantStock(selectedColor, size) : null;
                  const outOfStock = hasVariantData && selectedColor && stockForThis === 0;

                  return (
                    <button key={size}
                      onClick={() => { if (!outOfStock) setSelectedSize(size); }}
                      disabled={!!outOfStock}
                      title={outOfStock ? "نفد المخزون" : stockForThis !== null ? `${stockForThis} متبقي` : ""}
                      className={`py-2 rounded-lg border-2 text-sm font-semibold transition-all relative ${
                        selectedSize === size
                          ? "border-accent bg-accent text-white"
                          : outOfStock
                          ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-accent text-gray-700"
                      }`}>
                      {size}
                      {outOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="absolute w-full h-px bg-gray-300 rotate-45 top-1/2" />
                        </span>
                      )}
                      {!outOfStock && hasVariantData && selectedColor && stockForThis !== null && stockForThis <= 3 && stockForThis > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {stockForThis}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedColor && selectedSize && hasVariantData && (
                <p className={`text-sm mt-2 ${
                  selectedStock === 0 ? "text-red-500" :
                  (selectedStock ?? 0) <= 3 ? "text-orange-500" : "text-green-600"
                }`}>
                  {selectedStock === 0
                    ? "⚠ نفد هذا اللون والمقاس"
                    : selectedStock !== null && selectedStock <= 3
                    ? `⚡ ${selectedStock} قطع متبقية فقط!`
                    : `✓ متوفر`}
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <Button size="lg"
              className={`w-full text-accent-foreground ${
                selectedStock === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-accent hover:bg-accent/90"
              }`}
              onClick={handleAddToCart}
              disabled={selectedStock === 0}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedStock === 0 ? "غير متوفر" : "أضف إلى السلة"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;