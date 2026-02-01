import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj",
  "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane"
];

const orderSchema = z.object({
  fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  wilaya: z.string().min(1, "Veuillez sélectionner une wilaya"),
  commune: z.string().min(2, "La commune est requise"),
  address: z.string().min(10, "L'adresse doit être détaillée"),
  phone: z.string().regex(/^(0|\+213)[5-7][0-9]{8}$/, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  deliveryMethod: z.string().min(1, "Veuillez sélectionner une méthode de livraison"),
});

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    wilaya: "",
    commune: "",
    address: "",
    phone: "",
    email: "",
    deliveryMethod: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form
      orderSchema.parse(formData);

      if (items.length === 0) {
        toast.error("Votre panier est vide");
        return;
      }

      setLoading(true);

      // Create orders for each item
      const orderPromises = items.map((item) =>
        supabase.from("orders").insert({
          full_name: formData.fullName,
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address,
          phone: formData.phone,
          email: formData.email || null,
          shoe_size: item.size,
          shoe_color: item.color,
          payment_method: "Cash on Delivery",
          delivery_method: formData.deliveryMethod,
          product_id: item.productId,
          quantity: item.quantity,
        })
      );

      await Promise.all(orderPromises);

      toast.success("Commande passée avec succès!");
      clearCart();
      navigate("/order-success");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Veuillez corriger les erreurs du formulaire");
      } else {
        console.error("Error placing order:", error);
        toast.error("Erreur lors de la commande");
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">Finaliser la commande</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Informations de livraison</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">اللقب و الاسم (Nom complet)</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wilaya">Wilaya</Label>
                      <Select
                        value={formData.wilaya}
                        onValueChange={(value) => setFormData({ ...formData, wilaya: value })}
                      >
                        <SelectTrigger className={errors.wilaya ? "border-destructive" : ""}>
                          <SelectValue placeholder="Sélectionnez une wilaya" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya} value={wilaya}>
                              {wilaya}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.wilaya && (
                        <p className="text-sm text-destructive mt-1">{errors.wilaya}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="commune">البلدية (Commune)</Label>
                      <Input
                        id="commune"
                        value={formData.commune}
                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                        className={errors.commune ? "border-destructive" : ""}
                      />
                      {errors.commune && (
                        <p className="text-sm text-destructive mt-1">{errors.commune}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Adresse détaillée</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rue, bâtiment, appartement..."
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Téléphone (WhatsApp)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0555123456"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email (optionnel)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deliveryMethod">Méthode de livraison</Label>
                    <Select
                      value={formData.deliveryMethod}
                      onValueChange={(value) => setFormData({ ...formData, deliveryMethod: value })}
                    >
                      <SelectTrigger className={errors.deliveryMethod ? "border-destructive" : ""}>
                        <SelectValue placeholder="Sélectionnez une méthode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domicile">Livraison à domicile</SelectItem>
                        <SelectItem value="stopdesk">Stop Desk</SelectItem>
                        <SelectItem value="yalidine">Yalidine</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.deliveryMethod && (
                      <p className="text-sm text-destructive mt-1">{errors.deliveryMethod}</p>
                    )}
                  </div>

                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-semibold mb-2">Mode de paiement:</p>
                    <p className="text-sm">الدفع عند الاستلام (Cash on Delivery)</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                      <span>{(item.price * item.quantity).toFixed(2)} DA</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">{getTotalPrice().toFixed(2)} DA</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Traitement..." : "Confirmer la commande"}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
