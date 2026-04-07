// src/pages/AdminDiscounts.tsx — NEW FILE, create it in src/pages/

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Truck, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface DeliveryPrice {
  id: string;
  wilaya: string;
  price: number;
}

const AdminDiscounts = () => {
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrice[]>([]);
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDeliveryPrices();
  }, []);

  const fetchDeliveryPrices = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_prices")
        .select("*")
        .order("wilaya", { ascending: true });

      if (error) throw error;
      setDeliveryPrices(data || []);

      // Initialize editedPrices map
      const pricesMap: Record<string, string> = {};
      (data || []).forEach((dp: DeliveryPrice) => {
        pricesMap[dp.wilaya] = dp.price.toString();
      });
      setEditedPrices(pricesMap);
    } catch (error) {
      console.error("Error fetching delivery prices:", error);
      toast.error("خطأ في تحميل أسعار التوصيل");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = deliveryPrices.map((dp) => ({
        id: dp.id,
        wilaya: dp.wilaya,
        price: parseFloat(editedPrices[dp.wilaya] || "0") || 0,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("delivery_prices")
        .upsert(updates, { onConflict: "wilaya" });

      if (error) throw error;
      toast.success("تم حفظ أسعار التوصيل بنجاح!");
      fetchDeliveryPrices();
    } catch (error) {
      console.error("Error saving delivery prices:", error);
      toast.error("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleSetAllSamePrice = (price: string) => {
    const newPrices: Record<string, string> = {};
    deliveryPrices.forEach((dp) => {
      newPrices[dp.wilaya] = price;
    });
    setEditedPrices(newPrices);
  };

  const filteredPrices = deliveryPrices.filter((dp) =>
    dp.wilaya.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            أسعار التوصيل والتخفيضات
          </h1>
          <p className="text-gray-500 mt-1">Remises & Prix de livraison par wilaya</p>
        </div>

        {/* Delivery Prices */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">أسعار التوصيل لكل ولاية</h2>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            ضع سعر التوصيل لكل ولاية. سيظهر هذا السعر تلقائياً للعميل عند اختيار ولايته في الطلب.
          </p>

          {/* Quick Tools */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <Label className="text-sm">تعيين نفس السعر لجميع الولايات</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="مثال: 500"
                  id="bulk-price"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const val = (document.getElementById("bulk-price") as HTMLInputElement)?.value;
                    if (val) handleSetAllSamePrice(val);
                  }}
                >
                  تطبيق
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Label className="text-sm">بحث عن ولاية</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="اكتب اسم الولاية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Wilaya Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {filteredPrices.map((dp) => (
              <div
                key={dp.wilaya}
                className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{dp.wilaya}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Input
                    type="number"
                    min="0"
                    value={editedPrices[dp.wilaya] ?? dp.price.toString()}
                    onChange={(e) =>
                      setEditedPrices({ ...editedPrices, [dp.wilaya]: e.target.value })
                    }
                    className="w-20 h-8 text-sm text-center"
                  />
                  <span className="text-xs text-gray-400 w-6">DA</span>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ جميع الأسعار"}
          </Button>
        </Card>

        {/* Note about discounts */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-2">ملاحظة حول التخفيضات</h2>
          <p className="text-sm text-gray-500">
            التخفيضات على المنتجات تُضاف مباشرة عند إضافة أو تعديل منتج (حقل "Remise %") في صفحة{" "}
            <strong>المنتجات</strong>. يمكنك تعيين نسبة تخفيض لكل منتج بشكل منفصل.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDiscounts;