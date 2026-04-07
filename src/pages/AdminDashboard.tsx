// src/pages/AdminDashboard.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Package, TrendingUp, AlertTriangle,
  Clock, CheckCircle, ArrowRight,
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
        // Get variants with stock < 5, joined with product info
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

  const statusBadge = (status: string) => {
    if (status === "pending") return <Badge className="bg-yellow-100 text-yellow-800 border-0">⏳ قيد الانتظار</Badge>;
    if (status === "delivered") return <Badge className="bg-green-100 text-green-800 border-0">✅ تم التسليم</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-0">❌ ملغى</Badge>;
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">Tableau de bord — نظرة عامة على متجرك</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                <p className="text-3xl font-bold mt-1">{totalOrders}</p>
                <p className="text-xs text-gray-400">Total commandes</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg"><ShoppingBag className="h-6 w-6 text-blue-500" /></div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">قيد الانتظار</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingOrders}</p>
                <p className="text-xs text-gray-400">En attente</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg"><Clock className="h-6 w-6 text-yellow-500" /></div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">تم التسليم</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{deliveredOrders}</p>
                <p className="text-xs text-gray-400">Livrés</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="h-6 w-6 text-green-500" /></div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">الإيرادات</p>
                <p className="text-2xl font-bold mt-1 text-accent">{revenue.toFixed(0)} DA</p>
                <p className="text-xs text-gray-400">Revenus (livrés)</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg"><TrendingUp className="h-6 w-6 text-purple-500" /></div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold">آخر الطلبات</h2>
                  <p className="text-sm text-gray-400">Commandes récentes</p>
                </div>
                <Link to="/admin/orders">
                  <Button variant="ghost" size="sm" className="gap-1 text-accent">
                    عرض الكل <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-center text-gray-400 py-8">لا توجد طلبات بعد</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 6).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{order.full_name}</p>
                        <p className="text-xs text-gray-400">
                          {order.products?.name} · مقاس {order.shoe_size} · {order.shoe_color}
                        </p>
                        <p className="text-xs text-gray-400">{order.wilaya}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        {statusBadge(order.status)}
                        <p className="text-xs text-gray-400 hidden sm:block">
                          {new Date(order.created_at).toLocaleDateString("fr-DZ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Low Stock Alert — now per variant */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <h2 className="text-lg font-bold">تنبيه المخزون</h2>
                  <p className="text-sm text-gray-400">Stock faible (par variante)</p>
                </div>
              </div>

              {lowStockVariants.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">المخزون بخير!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockVariants.slice(0, 8).map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={v.product_image}
                        alt={v.product_name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.product_name}</p>
                        <p className="text-xs text-gray-400">
                          {v.color} · مقاس {v.size}
                        </p>
                      </div>
                      <Badge className={
                        v.stock === 0
                          ? "bg-red-100 text-red-700 border-0"
                          : "bg-orange-100 text-orange-700 border-0"
                      }>
                        {v.stock === 0 ? "نفد" : `${v.stock} متبقي`}
                      </Badge>
                    </div>
                  ))}
                  {lowStockVariants.length > 8 && (
                    <p className="text-xs text-gray-400 text-center">
                      و {lowStockVariants.length - 8} متغيرات أخرى...
                    </p>
                  )}
                  <Link to="/admin/products">
                    <Button variant="outline" size="sm" className="w-full mt-2 gap-1">
                      إدارة المنتجات <ArrowRight className="h-3 w-3" />
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