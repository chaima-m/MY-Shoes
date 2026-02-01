import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <CheckCircle className="h-20 w-20 text-success mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Commande confirmée!</h1>
        <p className="text-muted-foreground mb-8">
          Merci pour votre commande. Nous vous contacterons bientôt sur WhatsApp pour confirmer les détails de livraison.
        </p>
        <div className="space-y-3">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => navigate("/")}
          >
            Continuer mes achats
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
