import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: number;
  color: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "id" | "quantity">) => {
    const existingItem = items.find(
      (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
    );

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        quantity: 1,
      };
      setItems([...items, newItem]);
      toast.success("Article ajouté au panier");
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Article retiré du panier");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
