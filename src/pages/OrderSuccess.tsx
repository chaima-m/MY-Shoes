// import { Button } from "@/components/ui/button";
// import { CheckCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const OrderSuccess = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center px-4">
//       <div className="text-center max-w-md animate-fade-in">
//         <CheckCircle className="h-20 w-20 text-success mx-auto mb-6" />
//         <h1 className="text-3xl font-bold mb-4">Commande confirmée!</h1>
//         <p className="text-muted-foreground mb-8">
//           Merci pour votre commande. Nous vous contacterons bientôt sur WhatsApp pour confirmer les détails de livraison.
//         </p>
//         <div className="space-y-3">
//           <Button
//             className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
//             onClick={() => navigate("/")}
//           >
//             Continuer mes achats
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderSuccess;

// src/pages/OrderSuccess.tsx — Replace your existing file

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">تم تأكيد طلبك! 🎉</h1>
        <p className="text-gray-400 mb-2">Commande confirmée !</p>
        <p className="text-muted-foreground mb-8">
          شكراً لثقتك بنا. سنتواصل معك قريباً عبر WhatsApp لتأكيد تفاصيل التوصيل.
          <br />
          <span className="text-sm text-gray-400 mt-1 block">
            Merci ! Nous vous contacterons bientôt sur WhatsApp.
          </span>
        </p>
        <div className="space-y-3">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => navigate("/")}
          >
            متابعة التسوق
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;