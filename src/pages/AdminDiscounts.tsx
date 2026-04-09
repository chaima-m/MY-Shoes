// src/pages/AdminDiscounts.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Truck, Search, Home, Package, Zap } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface DeliveryPrice {
  id: string;
  wilaya: string;
  price_domicile: number;
  price_stopdesk: number;
  price_yalidine: number;
}

const METHODS = [
  { key: "price_domicile", label: "🏠 التوصيل للمنزل", labelFr: "Domicile" },
  { key: "price_stopdesk", label: "📦 Stop Desk", labelFr: "Stop Desk" },
  { key: "price_yalidine", label: "🚚 Yalidine", labelFr: "Yalidine" },
] as const;

type MethodKey = typeof METHODS[number]["key"];

const AdminDiscounts = () => {
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrice[]>([]);
  // editedPrices["Alger"]["price_domicile"] = "500"
  const [editedPrices, setEditedPrices] = useState<Record<string, Record<MethodKey, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMethod, setActiveMethod] = useState<MethodKey>("price_domicile");

  useEffect(() => { fetchDeliveryPrices(); }, []);

  const fetchDeliveryPrices = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_prices")
        .select("*")
        .order("wilaya", { ascending: true });

      if (error) throw error;
      setDeliveryPrices(data || []);

      const map: Record<string, Record<MethodKey, string>> = {};
      (data || []).forEach((dp: DeliveryPrice) => {
        map[dp.wilaya] = {
          price_domicile: (dp.price_domicile ?? 0).toString(),
          price_stopdesk: (dp.price_stopdesk ?? 0).toString(),
          price_yalidine: (dp.price_yalidine ?? 0).toString(),
        };
      });
      setEditedPrices(map);
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
        price_domicile: parseFloat(editedPrices[dp.wilaya]?.price_domicile || "0") || 0,
        price_stopdesk: parseFloat(editedPrices[dp.wilaya]?.price_stopdesk || "0") || 0,
        price_yalidine: parseFloat(editedPrices[dp.wilaya]?.price_yalidine || "0") || 0,
        // Keep legacy price column = domicile price for backward compat
        price: parseFloat(editedPrices[dp.wilaya]?.price_domicile || "0") || 0,
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

  const handleSetAllSamePrice = (price: string, method: MethodKey) => {
    const newPrices = { ...editedPrices };
    deliveryPrices.forEach((dp) => {
      newPrices[dp.wilaya] = { ...(newPrices[dp.wilaya] || { price_domicile: "0", price_stopdesk: "0", price_yalidine: "0" }), [method]: price };
    });
    setEditedPrices(newPrices);
  };

  const setPrice = (wilaya: string, method: MethodKey, value: string) => {
    setEditedPrices((prev) => ({
      ...prev,
      [wilaya]: { ...(prev[wilaya] || { price_domicile: "0", price_stopdesk: "0", price_yalidine: "0" }), [method]: value },
    }));
  };

  const filteredPrices = deliveryPrices.filter((dp) =>
    dp.wilaya.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMethodInfo = METHODS.find((m) => m.key === activeMethod)!;

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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">أسعار التوصيل</h1>
          <p className="text-gray-500 mt-1">Prix de livraison par wilaya et par méthode</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">أسعار التوصيل لكل ولاية</h2>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            كل طريقة توصيل لها سعر مستقل لكل ولاية. اختر طريقة التوصيل ثم عدّل الأسعار.
          </p>

          {/* Method tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {METHODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMethod(m.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeMethod === m.key
                    ? "bg-accent text-white border-accent"
                    : "bg-white text-gray-600 border-gray-200 hover:border-accent/50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Quick bulk tool for active method */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <Label className="text-sm">
                تعيين نفس السعر لجميع الولايات — <span className="text-accent">{activeMethodInfo.label}</span>
              </Label>
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
                    if (val) handleSetAllSamePrice(val, activeMethod);
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

          {/* Wilaya Grid — shows only active method column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {filteredPrices.map((dp) => (
              <div
                key={dp.wilaya}
                className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{dp.wilaya}</p>
                  {/* Mini preview of other methods */}
                  <div className="flex gap-2 mt-0.5">
                    {METHODS.filter((m) => m.key !== activeMethod).map((m) => (
                      <span key={m.key} className="text-[10px] text-gray-400">
                        {m.labelFr}: {editedPrices[dp.wilaya]?.[m.key] || "0"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Input
                    type="number"
                    min="0"
                    value={editedPrices[dp.wilaya]?.[activeMethod] ?? "0"}
                    onChange={(e) => setPrice(dp.wilaya, activeMethod, e.target.value)}
                    className="w-20 h-8 text-sm text-center"
                  />
                  <span className="text-xs text-gray-400 w-6">DA</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary table preview */}
          {filteredPrices.length > 0 && searchQuery && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-800 mb-3">مقارنة الأسعار — {searchQuery}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-blue-100">
                      <th className="pb-2 pr-4">الولاية</th>
                      {METHODS.map((m) => <th key={m.key} className="pb-2 px-3">{m.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.map((dp) => (
                      <tr key={dp.wilaya} className="border-b border-blue-50 last:border-0">
                        <td className="py-2 pr-4 font-medium">{dp.wilaya}</td>
                        {METHODS.map((m) => (
                          <td key={m.key} className="py-2 px-3 text-accent font-semibold">
                            {editedPrices[dp.wilaya]?.[m.key] || "0"} DA
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ جميع الأسعار"}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-2">ملاحظة حول التخفيضات</h2>
          <p className="text-sm text-gray-500">
            التخفيضات على المنتجات تُضاف مباشرة عند إضافة أو تعديل منتج (حقل "Remise %") في صفحة{" "}
            <strong>المنتجات</strong>.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDiscounts;