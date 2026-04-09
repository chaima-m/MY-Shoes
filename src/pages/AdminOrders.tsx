// src/pages/AdminOrders.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search, Eye, Phone, MapPin, Package, Trash2,
  Clock, CheckCircle, XCircle, Home, Building2,
} from "lucide-react";
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

const DELIVERY_METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  domicile: { label: "Domicile", icon: <Home className="h-3.5 w-3.5" /> },
  stopdesk: { label: "Bureau de wilaya", icon: <Building2 className="h-3.5 w-3.5" /> },
  // legacy fallback
  yalidine: { label: "Yalidine", icon: <Building2 className="h-3.5 w-3.5" /> },
};

const statusOptions = [
  { value: "all", label: "Toutes", labelAr: "كل الطلبات" },
  { value: "pending", label: "En attente", labelAr: "قيد الانتظار" },
  { value: "delivered", label: "Livré", labelAr: "تم التسليم" },
  { value: "cancelled", label: "Annulé", labelAr: "ملغى" },
];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "pending")
    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 gap-1 font-medium whitespace-nowrap">
        <Clock className="h-5 w-5" />
        <span>En attente</span>
      </Badge>
    );
  if (status === "delivered")
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 font-medium whitespace-nowrap">
        <CheckCircle className="h-5 w-5" />
        <span>Livré</span>
      </Badge>
    );
  return (
    <Badge className="bg-red-50 text-red-700 border border-red-200 gap-1 font-medium whitespace-nowrap">
      <XCircle className="h-5 w-5" />
      <span>Annulé</span>
    </Badge>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { filterOrders(); }, [orders, searchQuery, statusFilter]);

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
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    if (statusFilter !== "all") filtered = filtered.filter((o) => o.status === statusFilter);
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
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;
      toast.success("Statut mis à jour");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("orders").delete().eq("id", deleteOrderId);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== deleteOrderId));
      toast.success("Commande supprimée");
      setDeleteOrderId(null);
      if (selectedOrder?.id === deleteOrderId) {
        setDetailOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
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
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Gestion des commandes</h1>
          <p className="text-gray-500 mt-1 text-sm">إدارة الطلبات</p>
        </div>

        {/* Filters */}
        <Card className="p-3 lg:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, téléphone, wilaya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats row */}
        <div className="flex gap-2 flex-wrap">
          {statusOptions.slice(1).map((opt) => {
            const count = orders.filter((o) => o.status === opt.value).length;
            const colors: Record<string, string> = {
              pending: "bg-amber-50 border-amber-200 text-amber-700",
              delivered: "bg-emerald-50 border-emerald-200 text-emerald-700",
              cancelled: "bg-red-50 border-red-200 text-red-700",
            };
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(statusFilter === opt.value ? "all" : opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  statusFilter === opt.value
                    ? colors[opt.value]
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {opt.label} · {count}
              </button>
            );
          })}
          <span className="px-3 py-1.5 text-xs text-gray-400 flex items-center">
            Total: {filteredOrders.length}
          </span>
        </div>

        {/* Mobile: card list */}
        <div className="lg:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-400 text-sm">Aucune commande trouvée</p>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{order.full_name}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-medium text-gray-700 truncate">{order.products?.name}</p>
                  <p>Taille {order.shoe_size} · {order.shoe_color} · ×{order.quantity}</p>
                  <p>{order.commune}, {order.wilaya}</p>
                  <p className="text-gray-400">{new Date(order.created_at).toLocaleDateString("fr-DZ")}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" />En attente</span>
                      </SelectItem>
                      <SelectItem value="delivered">
                        <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" />Livré</span>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <span className="flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-red-500" />Annulé</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteOrderId(order.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <Card className="hidden lg:block overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200">
                  <TableHead className="font-semibold text-gray-700">Client</TableHead>
                  <TableHead className="font-semibold text-gray-700">Produit</TableHead>
                  <TableHead className="font-semibold text-gray-700">Wilaya</TableHead>
                  <TableHead className="font-semibold text-gray-700">Téléphone</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Statut</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-sm">{order.full_name}</TableCell>
                      <TableCell className="text-sm">
                        {order.products?.name}
                        <span className="block text-xs text-gray-600">
                          ×{order.quantity} - {order.shoe_size} - {order.shoe_color}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{order.wilaya}</TableCell>
                      <TableCell className="text-sm">{order.phone}</TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("fr-DZ")}
                      </TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <span className="flex items-center gap-1.5"><Clock className="h-5 w-5 text-amber-500" />En attente</span>
                              </SelectItem>
                              <SelectItem value="delivered">
                                <span className="flex items-center gap-1.5"><CheckCircle className="h-5 w-5 text-emerald-500" />Livré</span>
                              </SelectItem>
                              <SelectItem value="cancelled">
                                <span className="flex items-center gap-1.5"><XCircle className="h-5 w-5 text-red-500" />Annulé</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-10 w-10"
                            onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteOrderId(order.id)}>
                            <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 lg:space-y-5">
              {/* Product */}
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={selectedOrder.products?.images?.[0] || "/placeholder.svg"}
                  alt=""
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{selectedOrder.products?.name}</p>
                  <p className="text-xs text-gray-500">
                    Taille: {selectedOrder.shoe_size} · Couleur: {selectedOrder.shoe_color}
                  </p>
                  <p className="text-xs text-gray-500">Quantité: {selectedOrder.quantity}</p>
                  <p className="text-sm font-medium text-accent mt-1">
                    {selectedOrder.products?.price} DA × {selectedOrder.quantity} ={" "}
                    {(selectedOrder.products?.price || 0) * selectedOrder.quantity} DA
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{selectedOrder.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{selectedOrder.phone}</span>
                  {selectedOrder.email && <span className="text-gray-400 text-xs truncate">· {selectedOrder.email}</span>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{selectedOrder.commune}, {selectedOrder.wilaya}</span>
                </div>
              </div>

              {/* Delivery & Payment */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Méthode de livraison</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    {DELIVERY_METHOD_LABELS[selectedOrder.delivery_method]?.icon}
                    {DELIVERY_METHOD_LABELS[selectedOrder.delivery_method]?.label || selectedOrder.delivery_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais de livraison</span>
                  <span>{selectedOrder.delivery_price || 0} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paiement</span>
                  <span>{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-accent">
                    {(selectedOrder.products?.price || 0) * selectedOrder.quantity +
                      (selectedOrder.delivery_price || 0)}{" "}
                    DA
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-sm font-medium mb-2">Mettre à jour le statut :</p>
                <div className="flex gap-2">
                  <Button size="sm"
                    variant={selectedOrder.status === "pending" ? "default" : "outline"}
                    className={`flex-1 text-xs gap-1 ${selectedOrder.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                    onClick={() => updateOrderStatus(selectedOrder.id, "pending")}>
                    <Clock className="h-3.5 w-3.5" />En attente
                  </Button>
                  <Button size="sm"
                    variant={selectedOrder.status === "delivered" ? "default" : "outline"}
                    className={`flex-1 text-xs gap-1 ${selectedOrder.status === "delivered" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    onClick={() => updateOrderStatus(selectedOrder.id, "delivered")}>
                    <CheckCircle className="h-3.5 w-3.5" />Livré
                  </Button>
                  <Button size="sm"
                    variant={selectedOrder.status === "cancelled" ? "destructive" : "outline"}
                    className="flex-1 text-xs gap-1"
                    onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}>
                    <XCircle className="h-3.5 w-3.5" />Annulé
                  </Button>
                </div>
              </div>

              {/* Delete */}
              <Button variant="destructive" size="sm" className="w-full gap-2"
                onClick={() => { setDeleteOrderId(selectedOrder.id); setDetailOpen(false); }}>
                <Trash2 className="h-4 w-4" />
                Supprimer cette commande
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => { if (!open) setDeleteOrderId(null); }}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminOrders;