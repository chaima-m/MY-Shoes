// src/pages/AdminDashboard.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Package, TrendingUp, AlertTriangle,
  Clock, CheckCircle, ArrowRight, XCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Order {
  id: string;
  full_name: string;
  wilaya: string;
  phone: string;
  status: string;
  created_at: string;
  quantity: number;
  delivery_price: number | null;
  shoe_size: number;
  shoe_color: string;
  products: { name: string; price: number };
}

interface LowStockVariant {
  product_id: string;
  size: number;
  color: string;
  stock: number;
  product_name: string;
  product_image: string;
  product_price: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "pending")
    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 gap-1 font-medium">
        <Clock className="h-3 w-3" />
        En attente
      </Badge>
    );
  if (status === "delivered")
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 font-medium">
        <CheckCircle className="h-3 w-3" />
        Livré
      </Badge>
    );
  return (
    <Badge className="bg-red-50 text-red-700 border border-red-200 gap-1 font-medium">
      <XCircle className="h-3 w-3" />
      Annulé
    </Badge>
  );
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockVariants, setLowStockVariants] = useState<LowStockVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, variantsRes] = await Promise.all([
        supabase
          .from("orders")
          .select(`*, products(name, price)`)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("product_variants")
          .select(`stock, size, color, product_id, products(name, images, price)`)
          .lt("stock", 5)
          .order("stock", { ascending: true })
          .limit(20),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);

      if (variantsRes.data) {
        const mapped: LowStockVariant[] = (variantsRes.data as any[]).map((v) => ({
          product_id: v.product_id,
          size: v.size,
          color: v.color,
          stock: v.stock,
          product_name: v.products?.name || "",
          product_image: v.products?.images?.[0] || "/placeholder.svg",
          product_price: v.products?.price || 0,
        }));
        setLowStockVariants(mapped);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const revenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => {
      const productTotal = (o.products?.price || 0) * o.quantity;
      const delivery = o.delivery_price || 0;
      return sum + productTotal + delivery;
    }, 0);

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
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1 text-sm">Vue d'ensemble de votre boutique</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="p-4 lg:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500">Total commandes</p>
                <p className="text-2xl lg:text-3xl font-bold mt-1">{totalOrders}</p>
                <p className="text-xs text-gray-400 hidden sm:block">Toutes les commandes</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <ShoppingBag className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500">En attente</p>
                <p className="text-2xl lg:text-3xl font-bold mt-1 text-amber-600">{pendingOrders}</p>
                <p className="text-xs text-gray-400 hidden sm:block">À traiter</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-amber-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500">Livrés</p>
                <p className="text-2xl lg:text-3xl font-bold mt-1 text-emerald-600">{deliveredOrders}</p>
                <p className="text-xs text-gray-400 hidden sm:block">Commandes livrées</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-500">Revenus</p>
                <p className="text-xl lg:text-2xl font-bold mt-1 text-accent">{revenue.toFixed(0)} DA</p>
                <p className="text-xs text-gray-400 hidden sm:block">Commandes livrées</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-5">
                <div>
                  <h2 className="text-base lg:text-lg font-bold">Dernières commandes</h2>
                  <p className="text-xs text-gray-400">Commandes récentes</p>
                </div>
                <Link to="/admin/orders">
                  <Button variant="ghost" size="sm" className="gap-1 text-accent text-xs lg:text-sm">
                    Tout voir <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Aucune commande pour l'instant</p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {orders.slice(0, 6).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2.5 lg:py-3 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{order.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {order.products?.name} · Taille {order.shoe_size} · {order.shoe_color}
                        </p>
                        <p className="text-xs text-gray-400">{order.wilaya}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <StatusBadge status={order.status} />
                        <p className="text-xs text-gray-400 hidden md:block">
                          {new Date(order.created_at).toLocaleDateString("fr-DZ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Low Stock Alert */}
          <div>
            <Card className="p-4 lg:p-6">
              <div className="flex items-center gap-2 mb-4 lg:mb-5">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div>
                  <h2 className="text-base lg:text-lg font-bold">Alerte stock</h2>
                  <p className="text-xs text-gray-400">Stock faible (par variante)</p>
                </div>
              </div>

              {lowStockVariants.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Stock en bonne forme !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockVariants.slice(0, 8).map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={v.product_image}
                        alt={v.product_name}
                        className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs lg:text-sm font-medium truncate">{v.product_name}</p>
                        <p className="text-xs text-gray-400">
                          {v.color} · T.{v.size}
                        </p>
                      </div>
                      <Badge className={
                        v.stock === 0
                          ? "bg-red-50 text-red-700 border border-red-200 text-xs flex-shrink-0"
                          : "bg-orange-50 text-orange-700 border border-orange-200 text-xs flex-shrink-0"
                      }>
                        {v.stock === 0 ? "Épuisé" : `${v.stock} restant`}
                      </Badge>
                    </div>
                  ))}
                  {lowStockVariants.length > 8 && (
                    <p className="text-xs text-gray-400 text-center">
                      et {lowStockVariants.length - 8} autres variantes...
                    </p>
                  )}
                  <Link to="/admin/products">
                    <Button variant="outline" size="sm" className="w-full mt-2 gap-1 text-xs">
                      Gérer les produits <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;