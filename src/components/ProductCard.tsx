// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useNavigate } from "react-router-dom";

// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   discount?: number;
//   stock: number;
//   images: string[];
//   category: string;
// }

// interface ProductCardProps {
//   product: Product;
// }

// const ProductCard = ({ product }: ProductCardProps) => {
//   const navigate = useNavigate();
//   const finalPrice = product.discount
//     ? product.price * (1 - product.discount / 100)
//     : product.price;

//   return (
//     <div
//       className="group cursor-pointer animate-scale-in"
//       onClick={() => navigate(`/product/${product.id}`)}
//     >
//       {/* Square Image Card */}
//       <Card className="aspect-square overflow-hidden border-0 hover:shadow-elevated transition-all duration-300 mb-3 relative">
//         <img
//           src={product.images[0] || "/placeholder.svg"}
//           alt={product.name}
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//         />
//         {product.discount && (
//           <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-3 text-xs font-bold shadow-lg">
//             <span className="block" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
//               -{product.discount}%
//             </span>
//           </div>
//         )}
//       </Card>

//       {/* Product Info - Outside Card, on page background */}
//       <div className="space-y-2">
//         <div className="flex items-start justify-between gap-2">
//           <h3 className="font-semibold text-sm line-clamp-2 flex-1">
//             {product.name}
//           </h3>
//           {product.stock === 0 && (
//             <Badge variant="destructive" className="text-xs">
//               Épuisé
//             </Badge>
//           )}
//           {product.stock > 0 && product.stock < 10 && (
//             <Badge variant="secondary" className="text-xs">
//               Stock bas
//             </Badge>
//           )}
//         </div>

//         <p className="text-xs text-muted-foreground">{product.category}</p>

//         <div className="flex items-center gap-2 flex-wrap">
//           {product.discount ? (
//             <>
//               <span className="text-lg font-bold text-accent">
//                 {finalPrice.toFixed(2)} DA
//               </span>
//               <span className="text-sm text-muted-foreground line-through">
//                 {product.price.toFixed(2)} DA
//               </span>
//             </>
//           ) : (
//             <span className="text-lg font-bold">{product.price.toFixed(2)} DA</span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  stock: number;
  images: string[];
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div
      className="group cursor-pointer animate-scale-in"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Square Image Card */}
      <Card className="aspect-square overflow-hidden border-0 hover:shadow-lg transition-all duration-300 mb-3 relative bg-gray-50">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 text-xs font-bold rounded">
            -{product.discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive" className="text-xs">
              Épuisé
            </Badge>
          </div>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
              Stock bas
            </Badge>
          </div>
        )}
      </Card>

      {/* Product Info - Clean layout like reference */}
      <div className="space-y-1.5">
        {/* Category or New Season badge */}
        {product.discount && (
          <p className="text-xs text-gray-500 font-medium">New Season</p>
        )}
        
        {/* Brand/Category */}
        <h3 className="font-semibold text-sm text-gray-900">
          {product.category}
        </h3>
        
        {/* Product Name */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.name}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {product.discount ? (
            <>
              <span className="text-base font-semibold text-gray-900">
                {finalPrice.toFixed(2)} DA
              </span>
              <span className="text-sm text-gray-400 line-through">
                {product.price.toFixed(2)} DA
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-gray-900">
              {product.price.toFixed(2)} DA
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;