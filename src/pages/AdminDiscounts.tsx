// src/pages/AdminDiscounts.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Truck, Search, Home, Building2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface DeliveryPrice {
  id: string;
  wilaya: string;
  price_domicile: number;
  price_stopdesk: number;
}

const METHODS = [
  { key: "price_domicile", label: "Domicile", labelAr: "التوصيل للمنزل", icon: Home },
  { key: "price_stopdesk", label: "Bureau de wilaya", labelAr: "مكتب الولاية", icon: Building2 },
] as const;

type MethodKey = typeof METHODS[number]["key"];

const AdminDiscounts = () => {
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrice[]>([]);
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
      (data || []).forEach((dp: any) => {
        map[dp.wilaya] = {
          price_domicile: (dp.price_domicile ?? 0).toString(),
          price_stopdesk: (dp.price_stopdesk ?? 0).toString(),
        };
      });
      setEditedPrices(map);
    } catch (error) {
      console.error("Error fetching delivery prices:", error);
      toast.error("Erreur lors du chargement des prix");
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
        // Keep legacy price column = domicile price for backward compat
        price: parseFloat(editedPrices[dp.wilaya]?.price_domicile || "0") || 0,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("delivery_prices")
        .upsert(updates, { onConflict: "wilaya" });

      if (error) throw error;
      toast.success("Prix de livraison enregistrés !");
      fetchDeliveryPrices();
    } catch (error) {
      console.error("Error saving delivery prices:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleSetAllSamePrice = (price: string, method: MethodKey) => {
    const newPrices = { ...editedPrices };
    deliveryPrices.forEach((dp) => {
      newPrices[dp.wilaya] = {
        ...(newPrices[dp.wilaya] || { price_domicile: "0", price_stopdesk: "0" }),
        [method]: price,
      };
    });
    setEditedPrices(newPrices);
  };

  const setPrice = (wilaya: string, method: MethodKey, value: string) => {
    setEditedPrices((prev) => ({
      ...prev,
      [wilaya]: {
        ...(prev[wilaya] || { price_domicile: "0", price_stopdesk: "0" }),
        [method]: value,
      },
    }));
  };

  const filteredPrices = deliveryPrices.filter((dp) =>
    dp.wilaya.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMethodInfo = METHODS.find((m) => m.key === activeMethod)!;
  const ActiveIcon = activeMethodInfo.icon;

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
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Prix de livraison</h1>
          <p className="text-gray-500 mt-1 text-sm">أسعار التوصيل حسب الولاية</p>
        </div>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-accent flex-shrink-0" />
            <h2 className="text-base lg:text-lg font-bold">Prix par wilaya et par méthode</h2>
          </div>
          <p className="text-sm text-gray-400 mb-5">
            Chaque méthode de livraison a un tarif indépendant par wilaya. Sélectionnez une méthode puis modifiez les prix.
          </p>

          {/* Method tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveMethod(m.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeMethod === m.key
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-gray-600 border-gray-200 hover:border-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {m.label}
                  <span className={`text-xs ${activeMethod === m.key ? "text-white/70" : "text-gray-400"}`}>
                    {m.labelAr}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick bulk tool for active method */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5 p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <Label className="text-sm flex items-center gap-1.5">
                <ActiveIcon className="h-3.5 w-3.5 text-accent" />
                Appliquer le même prix — <span className="text-accent">{activeMethodInfo.label}</span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Ex: 500"
                  id="bulk-price"
                  className="flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => {
                    const val = (document.getElementById("bulk-price") as HTMLInputElement)?.value;
                    if (val) handleSetAllSamePrice(val, activeMethod);
                  }}
                >
                  Appliquer
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Label className="text-sm">Rechercher une wilaya</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nom de la wilaya..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Wilaya Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {filteredPrices.map((dp) => {
              const OtherMethod = METHODS.find((m) => m.key !== activeMethod)!;
              return (
                <div
                  key={dp.wilaya}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{dp.wilaya}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <OtherMethod.icon className="h-3 w-3" />
                      {OtherMethod.label}: {editedPrices[dp.wilaya]?.[OtherMethod.key] || "0"} DA
                    </p>
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
              );
            })}
          </div>

          {/* Summary table when searching */}
          {filteredPrices.length > 0 && searchQuery && (
            <div className="mb-5 p-4 bg-blue-50 rounded-xl overflow-x-auto">
              <p className="text-sm font-medium text-blue-800 mb-3">
                Comparaison des prix — {searchQuery}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-blue-100">
                    <th className="pb-2 pr-4">Wilaya</th>
                    {METHODS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <th key={m.key} className="pb-2 px-3">
                          <span className="flex items-center gap-1">
                            <Icon className="h-3.5 w-3.5" />
                            {m.label}
                          </span>
                        </th>
                      );
                    })}
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
          )}

          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-white gap-2 w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer tous les prix"}
          </Button>
        </Card>

        <Card className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold mb-2">Remises sur les produits</h2>
          <p className="text-sm text-gray-500">
            Les remises sur les produits s'ajoutent directement lors de l'ajout ou la modification d'un produit
            (champ "Remise %") dans la page <strong>Produits</strong>.
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDiscounts;