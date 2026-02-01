import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

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
  description?: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
      if (data.colors.length > 0) setSelectedColor(data.colors[0]);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Produit introuvable");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error("Veuillez sélectionner une taille");
      return;
    }

    if (!selectedColor) {
      toast.error("Veuillez sélectionner une couleur");
      return;
    }

    if (product.stock === 0) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }

    const finalPrice = product.discount
      ? product.price * (1 - product.discount / 100)
      : product.price;

    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0] || "/placeholder.svg",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/produits")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au catalogue
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4 animate-fade-in">
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-accent"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-fade-in">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground">{product.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {product.discount ? (
                <>
                  <span className="text-3xl font-bold text-accent">
                    {finalPrice.toFixed(2)} DA
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {product.price.toFixed(2)} DA
                  </span>
                  <Badge className="bg-accent text-accent-foreground">
                    -{product.discount}%
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold">
                  {product.price.toFixed(2)} DA
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock === 0 ? (
                <Badge variant="destructive">Rupture de stock</Badge>
              ) : product.stock < 10 ? (
                <Badge variant="secondary">
                  Seulement {product.stock} en stock
                </Badge>
              ) : (
                <Badge className="bg-success text-success-foreground">
                  En stock
                </Badge>
              )}
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">Taille:</h3>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={
                      selectedSize === size ? "bg-accent text-accent-foreground" : ""
                    }
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold mb-3">Couleur:</h3>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    onClick={() => setSelectedColor(color)}
                    className={
                      selectedColor === color
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ajouter au panier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
