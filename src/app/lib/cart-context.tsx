import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import panierService from "../service/panier.service";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  seller: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  saveCart: (utilisateurId: number) => Promise<void>;
  loadCart: (utilisateurId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const saveCart = async (utilisateurId: number) => {
    // Convertir les items en format backend
    const produitIds = items.map(item => parseInt(item.id));
    const quantites = items.map(item => item.quantity);

    try {
      await panierService.create({
        utilisateurId,
        produitId: produitIds, // Temporaire, à changer quand on aura la relation
        quantites,
        statut: 'en_cours'
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  };

  const loadCart = async (utilisateurId: number) => {
    try {
      const paniers = await panierService.getByUtilisateur(utilisateurId);
      if (paniers.length > 0) {
        const panier = paniers[0]; // Prendre le premier panier actif
        // Convertir en CartItem - besoin de récupérer les détails des produits
        // Pour l'instant, garder local
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        saveCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
