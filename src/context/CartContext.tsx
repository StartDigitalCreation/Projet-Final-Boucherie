import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Category = string;

export type Product = {
  id: string;
  nom: string;
  description: string;
  prix_kg: number; // Prix par kilo
  categorie: Category;
  image_url: string;
};

export type CartItem = {
  product: Product;
  quantity: number; // Interprété comme "kilos" pour simplifier (1 = 1kg)
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "mbh_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.product.prix_kg, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

  const value = { items, addItem, removeItem, updateQuantity, clear, total, count };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
};
