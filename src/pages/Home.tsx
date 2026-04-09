
// import { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight, ShoppingCart, Mail, User, ArrowRight, Star } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { supabase } from "@/integrations/supabase/client";
// import { useNavigate } from "react-router-dom";
// import ProductCard from "@/components/ProductCard";
// import { Link } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import shoe1 from "@/assets/shoes/shoe1.png";

// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   discount?: number;
//   stock: number;
//   images: string[];
//   category: string;
// }

// const categories = [
//   {
//     title: "APPAREL",
//     image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop"
//   },
//   {
//     title: "NEW ARRIVALS",
//     image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=400&fit=crop"
//   },
//   {
//     title: "SPORT STYLE",
//     image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&h=400&fit=crop"
//   }
// ];

// const brands = [
//   "NIKE", "SKECHERS", "ASICS", "ADIDAS", "PUMA"
// ];


// const Home = () => {
//   const [cartItemCount] = useState(3);
//   const [currentReview, setCurrentReview] = useState(0);
//   const reviews = [
//     {
//       title: "Confort, Style, Polyvalence, Qualité",
//       text: "Ces chaussures offrent un confort et un style incroyables. Parfaites pour chaque occasion, je les porte tous les jours!"
//     },
//     {
//       title: "Excellent rapport qualité-prix",
//       text: "Des chaussures de haute qualité qui durent longtemps. Je recommande vivement!"
//     },
//     {
//       title: "Design moderne et confortable",
//       text: "Le style est impeccable et le confort exceptionnel. Mon achat préféré de l'année!"
//     }
//   ];

//   const nextReview = () => {
//     setCurrentReview((prev) => (prev + 1) % reviews.length);
//   };

//   const prevReview = () => {
//     setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
//   };

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("products")
//         .select("*")
//         .order("created_at", { ascending: false })
//         .limit(8); // Max 8 products

//       if (error) throw error;
//       setProducts(data || []);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredProducts = products;

//   return (
//     <div className="min-h-screen bg-white font-sans">


//       {/* Running Section - Now starts immediately on mobile */}
//       <section className="lg:mt-0">
//         <div className="min-h-[10vh] lg:min-h-0">
//           {/* Top Section - Shoe Image with RUNNING Background */}
//           <div className="relative w-full overflow-hidden">
//             {/*  Text Pattern (hidden on small screens to avoid overflow) */}
//             <div className="absolute inset-0 hidden md:flex flex-col justify-center items-center pointer-events-none select-none overflow-hidden">
//               {/* Top RUNNING text - visible from md+ */}
//               <div className="text-6xl md:text-8xl lg:text-9xl xl:text-[18rem] font-bold text-gray-200 leading-none tracking-wide opacity-30">
//                 M&Y SHOES
//               </div>
//               {/* Bottom  text - inverted/mirrored - visible from md+ */}
//               <div className="text-6xl md:text-8xl lg:text-9xl xl:text-[18rem] font-bold text-white [text-shadow:none] [-webkit-text-stroke:1px_black] leading-none tracking-wide opacity-10 transform scale-y-[-1] mt-[-0.5rem] lg:mt-[-4rem]">
//                 M&Y SHOES
//               </div>
//             </div>

//             {/* Sneaker Image */}
//             <div className="relative z-10 py-0 lg:py-0 px-4 lg:px-8 flex items-center justify-center max-h-[80vh] ">

//               <img
//                 src={shoe1}
//                 alt="Bold Sneaker"
//                 className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-68 object-contain"
//               />

//             </div>
//           </div>
//           </div>
//       </section>



      


//       {/* Products Section */}
//       <section className="py-12 lg:py-20">
//         <div className="mx-auto px-4 sm:px-8 lg:px-16">
//           <div className="flex justify-between items-center mb-8 lg:mb-12">
//             <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">
//                Collection
//             </h2>
//             <Link
//               to="/produits"
//               className="text-base lg:text-lg 
//              sm:hidden font-semibold text-gray-600 hover:text-accent transition-colors flex items-center gap-2 tracking-normal "
//             >
//               Voir tous les produits
//               <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
//             </Link>
//           </div>

//           {filteredProducts.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-muted-foreground text-lg font-normal tracking-normal">
//                 Aucun produit trouvé
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* --- Horizontal scroll ONLY on mobile --- */}
//               <div className="lg:hidden flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">

//                 {filteredProducts.map((product) => (
//                   <div key={product.id} className="snap-start min-w-[70%] max-w-[70%]">
//                     <ProductCard product={product} />
//                   </div>
//                 ))}
//               </div>

//               {/* Grid for desktop */}
//               <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
//                 {filteredProducts.map((product) => (
//                   <ProductCard key={product.id} product={product} />
//                 ))}
//               </div>

//               {/* Voir plus (mobile) */}
//               <div className="text-center mt-8 lg:hidden ">
//                 <Link
//                   to="/produits"
//                   className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-300 tracking-normal"
//                 >
//                   Voir tous
//                   <ArrowRight className="h-4 w-4" />
//                 </Link>
//               </div>
//             </>
//           )}
//         </div>
//       </section>

//       {/* Nos Marque Premium */}

 

//       {/* CTA Section */}
//       <section className="py-16 lg:py-24 bg-gray-900 text-white text-center relative overflow-hidden">
//         <div className="absolute inset-0 opacity-20">
//           <img
//             src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&h=400&fit=crop"
//             alt="Background"
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div className="relative container mx-auto px-4 sm:px-6">
//           <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 lg:mb-10 leading-tight tracking-tight">
//             M&Y Shoes
//           </h2>
//           <Button
//             onClick={() => navigate("/produits")}
//             className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 lg:px-10 lg:py-7 text-base lg:text-lg font-bold uppercase tracking-wide"
//           >
//             LET'S DO SOME SHOPPING
//           </Button>
//         </div>
//       </section>

//       {/* Brands */}
//       <section className="py-12 lg:py-16 bg-gray-100">
//         <div className="container mx-auto px-4 sm:px-6">
//           <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
//             {brands.map((brand, index) => (
//               <div
//                 key={index}
//                 className="text-xl sm:text-2xl lg:text-4xl font-black text-gray-300 hover:text-gray-600 transition-colors cursor-pointer tracking-wider"
//               >
//                 {brand}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };
// export default Home;
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Mail, User, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import shoe1 from "@/assets/shoes/shoe1.png";

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  stock: number;
  images: string[];
  category: string;
}

const categories = [
  {
    title: "VÊTEMENTS",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop"
  },
  {
    title: "NOUVEAUTÉS",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=400&fit=crop"
  },
  {
    title: "STYLE SPORT",
    image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&h=400&fit=crop"
  }
];

const brands = [
  "NIKE", "SKECHERS", "ASICS", "ADIDAS", "PUMA"
];


const Home = () => {
  const [cartItemCount] = useState(3);
  const [currentReview, setCurrentReview] = useState(0);
  const reviews = [
    {
      title: "Confort, Style, Polyvalence, Qualité",
      text: "Ces chaussures offrent un confort et un style incroyables. Parfaites pour chaque occasion, je les porte tous les jours!"
    },
    {
      title: "Excellent rapport qualité-prix",
      text: "Des chaussures de haute qualité qui durent longtemps. Je recommande vivement!"
    },
    {
      title: "Design moderne et confortable",
      text: "Le style est impeccable et le confort exceptionnel. Mon achat préféré de l'année!"
    }
  ];

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8); // Max 8 produits

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-white font-sans">


      {/* Section Principale */}
      <section className="lg:mt-0">
        <div className="min-h-[10vh] lg:min-h-0">
          {/* Zone supérieure - Image chaussure avec fond M&Y SHOES */}
          <div className="relative w-full overflow-hidden">

            {/* Texte décoratif M&Y SHOES — visible sur TOUTES les tailles */}
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none overflow-hidden">
              {/* Texte M&Y SHOES principal */}
              <div className="text-[4.8rem] sm:text-6xl md:text-8xl lg:text-9xl xl:text-[18rem] font-bold text-gray-200 leading-none tracking-wide opacity-30 whitespace-nowrap">
                M&Y SHOES
              </div>
              {/* Texte M&Y SHOES miroir inversé */}
              <div className="text-[4.8rem] sm:text-6xl md:text-8xl lg:text-9xl xl:text-[18rem] font-bold text-white [text-shadow:none] [-webkit-text-stroke:1px_black] leading-none tracking-wide opacity-10 transform scale-y-[-1] mt-[-0.5rem] lg:mt-[-4rem] whitespace-nowrap">
                M&Y SHOES
              </div>
            </div>

            {/* Image de la chaussure */}
            <div className="relative z-10 py-0 lg:py-0 px-4 lg:px-8 flex items-center justify-center max-h-[80vh]">
              <img
                src={shoe1}
                alt="Sneaker en vedette"
                className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-68 object-contain"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Section Produits */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex justify-between items-center mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Notre Collection
            </h2>
            <Link
              to="/produits"
              className="text-base lg:text-lg sm:hidden font-semibold text-gray-600 hover:text-accent transition-colors flex items-center gap-2 tracking-normal"
            >
              Voir tous les produits
              <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
            </Link>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg font-normal tracking-normal">
                Aucun produit trouvé
              </p>
            </div>
          ) : (
            <>
              {/* Défilement horizontal sur mobile */}
              <div className="lg:hidden flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="snap-start min-w-[70%] max-w-[70%]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Grille pour bureau */}
              <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Bouton Voir plus (mobile) */}
              <div className="text-center mt-8 lg:hidden">
                <Link
                  to="/produits"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-300 tracking-normal"
                >
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>


      {/* Section Appel à l'action */}
      <section className="py-16 lg:py-24 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/banner.jpg"
            alt="Arrière-plan"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 lg:mb-10 leading-tight tracking-tight">
            M&Y Shoes
          </h2>
          <p className="text-gray-400 text-xl mb-8 w-xl mx-auto">
            Sélection exclusive de chaussures pour tous les styles et toutes les occasions.
          </p>
          <Button
            onClick={() => navigate("/produits")}
            className="bg-red-500 hover:bg-red-700 text-white px-6 py-4 lg:px-10 lg:py-7 text-base lg:text-lg font-bold uppercase tracking-wide"
          >
            COMMENCER MES ACHATS
          </Button>
        </div>
      </section>

      {/* Section Marques */}
      <section className="py-12 lg:py-16 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6">

          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="text-xl sm:text-2xl lg:text-4xl font-black text-gray-300 hover:text-gray-600 transition-colors cursor-pointer tracking-wider"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
