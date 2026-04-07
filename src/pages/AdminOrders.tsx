// src/pages/AdminOrders.tsx — NEW FILE, create it in src/pages/

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Eye, Phone, MapPin, Package } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Order {
  id: string;
  full_name: string;
  wilaya: string;
  commune: string;
  phone: string;
  email: string | null;
  status: string;
  created_at: string;
  quantity: number;
  shoe_size: number;
  shoe_color: string;
  delivery_method: string;
  delivery_price: number | null;
  payment_method: string;
  products: { name: string; price: number; images: string[] };
}

const statusOptions = [
  { value: "all", label: "كل الطلبات", labelFr: "Tous" },
  { value: "pending", label: "قيد الانتظار", labelFr: "En attente" },
  { value: "delivered", label: "تم التسليم", labelFr: "Livré" },
  { value: "cancelled", label: "ملغى", labelFr: "Annulé" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, products(name, price, images)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("خطأ في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.full_name.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.wilaya.toLowerCase().includes(q) ||
          o.products?.name?.toLowerCase().includes(q)
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("تم تحديث حالة الطلب");
      fetchOrders();
      // Update selected order if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("خطأ في تحديث الطلب");
    }
  };

  const statusBadge = (status: string) => {
    if (status === "pending")
      return <Badge className="bg-yellow-100 text-yellow-800 border-0">⏳ قيد الانتظار</Badge>;
    if (status === "delivered")
      return <Badge className="bg-green-100 text-green-800 border-0">✅ تم التسليم</Badge>;
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-500 mt-1">Gestion des commandes</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث بالاسم، الهاتف، الولاية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label} — {opt.labelFr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats row */}
        <div className="flex gap-3 flex-wrap">
          {statusOptions.slice(1).map((opt) => {
            const count = orders.filter((o) => o.status === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === opt.value
                    ? "bg-accent text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>العميل</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead className="hidden md:table-cell">الولاية</TableHead>
                  <TableHead className="hidden sm:table-cell">الهاتف</TableHead>
                  <TableHead className="hidden lg:table-cell">التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                      لا توجد طلبات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{order.full_name}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {order.products?.name}
                        <span className="block text-xs text-gray-400">
                          ×{order.quantity} · مقاس {order.shoe_size}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{order.wilaya}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{order.phone}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("fr-DZ")}
                      </TableCell>
                      <TableCell>{statusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-24 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">⏳ انتظار</SelectItem>
                              <SelectItem value="delivered">✅ تسليم</SelectItem>
                              <SelectItem value="cancelled">❌ إلغاء</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5">
              {/* Product */}
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={selectedOrder.products?.images?.[0] || "/placeholder.svg"}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold">{selectedOrder.products?.name}</p>
                  <p className="text-sm text-gray-500">
                    مقاس: {selectedOrder.shoe_size} · لون: {selectedOrder.shoe_color}
                  </p>
                  <p className="text-sm text-gray-500">الكمية: {selectedOrder.quantity}</p>
                  <p className="text-sm font-medium text-accent">
                    {selectedOrder.products?.price} DA × {selectedOrder.quantity} ={" "}
                    {(selectedOrder.products?.price || 0) * selectedOrder.quantity} DA
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{selectedOrder.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{selectedOrder.phone}</span>
                  {selectedOrder.email && (
                    <span className="text-gray-400">· {selectedOrder.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {selectedOrder.commune}, {selectedOrder.wilaya}
                  </span>
                </div>
              </div>

              {/* Delivery & Payment */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">طريقة التوصيل</span>
                  <span>{selectedOrder.delivery_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">رسوم التوصيل</span>
                  <span>{selectedOrder.delivery_price || 0} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">طريقة الدفع</span>
                  <span>{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>المجموع الكلي</span>
                  <span className="text-accent">
                    {(selectedOrder.products?.price || 0) * selectedOrder.quantity +
                      (selectedOrder.delivery_price || 0)}{" "}
                    DA
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-sm font-medium mb-2">تحديث الحالة:</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "pending" ? "default" : "outline"}
                    className="flex-1 text-xs"
                    onClick={() => updateOrderStatus(selectedOrder.id, "pending")}
                  >
                    ⏳ انتظار
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "delivered" ? "default" : "outline"}
                    className={`flex-1 text-xs ${selectedOrder.status === "delivered" ? "bg-green-600 hover:bg-green-700" : ""}`}
                    onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}
                  >
                    ✅ تسليم
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === "cancelled" ? "destructive" : "outline"}
                    className="flex-1 text-xs"
                    onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                  >
                    ❌ إلغاء
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;