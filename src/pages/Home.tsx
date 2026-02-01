
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
    title: "APPAREL",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop"
  },
  {
    title: "NEW ARRIVALS",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=400&fit=crop"
  },
  {
    title: "SPORT STYLE",
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
        .limit(8); // Max 8 products

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-white font-sans">


      {/* Running Section - Now starts immediately on mobile */}
      <section className="lg:mt-0">
        <div className="min-h-[10vh] lg:min-h-0">
          {/* Top Section - Shoe Image with RUNNING Background */}
          <div className="relative w-full overflow-hidden">
            {/* RUNNING Text Pattern */}
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none overflow-hidden">
              {/* Top RUNNING text - normal */}
              <div className="text-8xl sm:text-6xl lg:text-8xl xl:text-[25rem] font-bold text-gray-200 leading-none whitespace-nowrap tracking-wide opacity-30">
                RUNNING
              </div>
              {/* Bottom RUNNING text - inverted/mirrored */}
              <div className="text-8xl sm:text-6xl lg:text-8xl xl:text-[25rem] font-bold text-white [text-shadow:none] [-webkit-text-stroke:1px_black] leading-none whitespace-nowrap tracking-wide opacity-10 transform scale-y-[-1] mt-[-0.5rem] lg:mt-[-4rem]">
                RUNNING
              </div>
            </div>

            {/* Sneaker Image */}
            <div className="relative z-10 py-0 lg:py-0 px-4 lg:px-8 flex items-center justify-center max-h-[70vh] ">

       
              <img
                src={shoe1}
                alt="Bold Sneaker"
                className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-68 object-contain"
              />

            </div>
          </div>
          </div>
      </section>


      {/* Products Section */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex justify-between items-center mb-8 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Nouvelle Collection
            </h2>
            <Link
              to="/produits"
              className="text-base lg:text-lg 
             sm:hidden font-semibold text-gray-600 hover:text-accent transition-colors flex items-center gap-2 tracking-normal "
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
              {/* --- Horizontal scroll ONLY on mobile --- */}
              <div className="lg:hidden flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">

                {filteredProducts.map((product) => (
                  <div key={product.id} className="snap-start min-w-[70%] max-w-[70%]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Grid for desktop */}
              <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Voir plus (mobile) */}
              <div className="text-center mt-8 lg:hidden ">
                <Link
                  to="/produits"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-300 tracking-normal"
                >
                  Voir tous
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Nos Marque Premium */}

 

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&h=400&fit=crop"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <p className="text-orange-500 font-bold mb-4 lg:mb-6 tracking-widest text-xs lg:text-sm">DOING SPORTS WITH THE BEST</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 lg:mb-10 leading-tight tracking-tight">
            BEAUTIFUL SPORTS Shoes
          </h2>
          <Button
            onClick={() => navigate("/produits")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 lg:px-10 lg:py-7 text-base lg:text-lg font-bold uppercase tracking-wide"
          >
            LET'S DO SOME SHOPPING
          </Button>
        </div>
      </section>

      {/* Brands */}
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





      // {/* Hero Section - Minimized for Mobile */}
      // <section className="mx-auto px-4 sm:px-6 lg:px-20 pt-4 lg:pt-16">
      //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-center">
      //     {/* Left Content - Hidden on mobile, shown on desktop */}
      //     <div className="hidden lg:block space-y-6 px-10 text-left">
      //       <h2 className="text-7xl font-bold leading-tight tracking-tight">
      //         Discover<br />
      //         Comfort and Style for<br />
      //         Every Occasion
      //       </h2>
      //       <p className="text-2xl text-gray-600 max-w-lg leading-relaxed font-normal">
      //         Discover the perfect balance of comfort, durability, and style for every occasion with our versatile, high-quality footwear collection.
      //       </p>
      //       <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg font-semibold group inline-flex items-center tracking-normal">
      //         Explore
      //         <div className="ml-12 h-9 w-9 bg-white rounded-full flex items-center justify-center">
      //           <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
      //         </div>
      //       </Button>
      //     </div>

      //     {/* Right Content - Reviews - Hidden on mobile, shown on desktop */}
      //     <div className="hidden lg:block pt-60 p-18">
      //       <div className="flex items-center gap-1 mb-4">
      //         {[...Array(5)].map((_, i) => (
      //           <Star key={i} className="h-5 w-5 fill-gray-800 text-gray-800" />
      //         ))}
      //         <span className="text-base font-medium ml-2 tracking-normal">4,9 / 399 Review</span>
      //       </div>

      //       <h3 className="text-2xl font-semibold mb-3 tracking-tight">
      //         {reviews[currentReview].title}
      //       </h3>

      //       <p className="text-gray-600 mb-6 text-xl leading-relaxed font-normal tracking-normal">
      //         {reviews[currentReview].text}
      //       </p>

      //       <div className="flex justify-between items-center">
      //         <div className="flex gap-2">
      //           {reviews.map((_, i) => (
      //             <div
      //               key={i}
      //               className={`h-2 w-2 rounded-full ${i === currentReview ? 'bg-black' : 'bg-gray-300'}`}
      //             />
      //           ))}
      //         </div>
      //         <div className="flex gap-2">
      //           <Button
      //             variant="outline"
      //             size="icon"
      //             className="rounded-full h-10 w-10 border-gray-300"
      //             onClick={prevReview}
      //           >
      //             <ChevronLeft className="h-5 w-5" />
      //           </Button>
      //           <Button
      //             variant="outline"
      //             size="icon"
      //             className="rounded-full h-10 w-10 border-gray-300"
      //             onClick={nextReview}
      //           >
      //             <ChevronRight className="h-5 w-5" />
      //           </Button>
      //         </div>
      //       </div>
      //     </div>

      //     {/* Mobile Only - Simple Hero */}
      //     <div className="lg:hidden text-center ">
      //       <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
      //         M&Y shoes for your Comfort and Style
      //       </h2>

      //     </div>
      //   </div>
      // </section>



      // <section className="lg:mt-0">
      //   <div className="container mx-auto">
      //     {/* Bottom Section - Content Grid */}
      //     <div className="px-4 sm:px-8 lg:px-16">
      //       <div className="max-w-7xl">
      //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
      //           {/* Left Side - Text Content */}
      //           <div className="pl-0 lg:pl-32 pt-6 lg:pt-12 h-full w-full text-center lg:text-left">
      //             <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
      //               We are Bold.
      //             </h1>
      //             <p className="text-gray-600 text-sm sm:text-base lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal tracking-normal">
      //               Bold design, pushing boundaries, shoes that stand out. Each pair
      //               combines innovation, comfort, and style, designed to make a bold
      //               statement and elevate every occasion effortlessly.
      //             </p>
      //           </div>

      //           {/* Right Side - SNEAKERS Text and Button */}
      //           <div className="pl-0 lg:pl-32 items-end justify-between h-full text-center lg:text-right">
      //             {/* Large SNEAKERS Watermark */}
      //             <div className="text-center lg:text-right">
      //               <span className="text-5xl sm:text-4xl lg:text-6xl xl:text-[12rem] font-bold text-white [text-shadow:none] [-webkit-text-stroke:1px_black] leading-none opacity-20 select-none tracking-wide">
      //                 SNEAKERS
      //               </span>
      //             </div>

      //             <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 lg:gap-16 pt-6 lg:pt-8 items-center justify-center lg:justify-end">
      //               <div className="text-center">
      //                 <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">120+</div>
      //                 <div className="text-gray-600 text-sm lg:text-base mt-1 lg:mt-2 font-normal tracking-normal">Happy Customer</div>
      //               </div>
      //               <div className="text-center">
      //                 <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">4,9/5</div>
      //                 <div className="text-gray-600 text-sm lg:text-base mt-1 lg:mt-2 font-normal tracking-normal">Customer Rating</div>
      //               </div>

      //               <div className="text-center">
      //                 <button className="px-4 py-2 sm:px-6 sm:py-3 mt-2 border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-300 text-sm sm:text-base tracking-normal">
      //                   Show More
      //                 </button>
      //               </div>
      //             </div>
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   </div>
        
      // </section>