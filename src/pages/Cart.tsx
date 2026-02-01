import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-6">
            Commencez vos achats dès maintenant
          </p>
          <Button onClick={() => navigate("/")} className="bg-accent text-accent-foreground">
            Voir le catalogue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">Mon Panier</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4 animate-scale-in">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Taille: {item.size} | Couleur: {item.color}
                    </p>
                    <p className="font-bold text-accent">
                      {item.price.toFixed(2)} DA
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{getTotalPrice().toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span className="text-success">Calculé au checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">{getTotalPrice().toFixed(2)} DA</span>
                </div>
              </div>

              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Procéder au paiement
              </Button>

              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => navigate("/")}
              >
                Continuer mes achats
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
