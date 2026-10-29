'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, OrderResponse } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  freeDeliveryThreshold: number;
  amountUntilFreeDelivery: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  completedOrder: OrderResponse | null;
  setCompletedOrder: (order: OrderResponse | null) => void;
  /** Most recent add-to-basket, drives the confirmation toast. `id` changes on every add. */
  lastAdded: { id: number; product: Product; quantity: number } | null;
  dismissLastAdded: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(null);
  const [lastAdded, setLastAdded] = useState<{ id: number; product: Product; quantity: number } | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fb_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('fb_cart', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  // A line never exceeds the shelf stock (when the store reports one)
  const clampToStock = (product: Product, quantity: number) =>
    product.stock_quantity > 0 ? Math.min(quantity, product.stock_quantity) : quantity;

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: clampToStock(product, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: clampToStock(product, quantity) }];
    });
    // Confirm with a toast instead of throwing the whole basket drawer over the page on every tap
    setLastAdded({ id: Date.now(), product, quantity });
  };

  const dismissLastAdded = () => setLastAdded(null);

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: clampToStock(item.product, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeDeliveryThreshold = 2500;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 150;
  const total = subtotal + deliveryFee;
  const amountUntilFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        total,
        freeDeliveryThreshold,
        amountUntilFreeDelivery,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        completedOrder,
        setCompletedOrder,
        lastAdded,
        dismissLastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

