// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import ProductCard from "@/components/ProductCard";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Search, Filter } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const categories = [
//   "Tous",
//   "Femmes",
//   "Homme",
//   "Sportif",
//   "Talons",
//   "Claquettes",
//   "Basket",
// ];

// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   discount?: number;
//   stock: number;
//   images: string[];
//   category: string;
//   sizes: number[];
//   colors: string[];
// }

// const Products = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("Tous");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     filterProducts();
//   }, [products, searchQuery, selectedCategory]);

//   const fetchProducts = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("products")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (error) throw error;
//       setProducts(data || []);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterProducts = () => {
//     let filtered = [...products];

//     // Filter by category
//     if (selectedCategory !== "Tous") {
//       filtered = filtered.filter((p) => p.category === selectedCategory);
//     }

//     // Filter by search query
//     if (searchQuery) {
//       filtered = filtered.filter((p) =>
//         p.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     setFilteredProducts(filtered);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">


//       {/* Filters */}
//       <section className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-4 px-4">
//         <div className="container mx-auto">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Rechercher des chaussures..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//               <SelectTrigger className="w-full md:w-48">
//                 <Filter className="h-4 w-4 mr-2" />
//                 <SelectValue placeholder="Catégorie" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map((category) => (
//                   <SelectItem key={category} value={category}>
//                     {category}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </section>

//       {/* Products Grid */}
//       <section className="container mx-auto px-4 py-12">
//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground text-lg">
//               Aucun produit trouvé
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredProducts.map((product) => (
//               <ProductCard key={product.id} product={product} />
//             ))}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// };

// export default Products;
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "Tous",
  "Femmes",
  "Homme",
  "Sportif",
  "Talons",
  "Claquettes",
  "Basket",
];

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  stock: number;
  images: string[];
  category: string;
  sizes: number[];
  colors: string[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "Tous") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Filters */}
      <section className="sticky top-16 z-40 bg-white border-b py-4 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des chaussures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Aucun produit trouvé
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;