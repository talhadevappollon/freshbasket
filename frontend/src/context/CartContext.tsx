'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, OrderResponse } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  addMultipleToCart: (batch: { product: Product; quantity?: number; variant?: ProductVariant }[]) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
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

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    if (product.availability && product.availability !== 'available') return;
    setItems(prev => {
      const existingIdx = prev.findIndex(item =>
        item.product.id === product.id &&
        (variant ? item.variant?.id === variant.id : !item.variant)
      );
      if (existingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: clampToStock(product, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: clampToStock(product, quantity), variant }];
    });
    setLastAdded({ id: Date.now(), product, quantity });
  };

  const addMultipleToCart = (batch: { product: Product; quantity?: number; variant?: ProductVariant }[]) => {
    if (!batch || batch.length === 0) return;
    setItems(prev => {
      let updated = [...prev];
      for (const entry of batch) {
        const prod = entry.product;
        if (prod.availability && prod.availability !== 'available') continue;
        const qty = entry.quantity || 1;
        const varId = entry.variant?.id;
        const matchIdx = updated.findIndex(it =>
          it.product.id === prod.id && (varId ? it.variant?.id === varId : !it.variant)
        );
        if (matchIdx !== -1) {
          updated[matchIdx] = {
            ...updated[matchIdx],
            quantity: clampToStock(prod, updated[matchIdx].quantity + qty),
          };
        } else {
          updated.push({
            product: prod,
            quantity: clampToStock(prod, qty),
            variant: entry.variant,
          });
        }
      }
      return updated;
    });
    setIsCartOpen(true);
  };

  const dismissLastAdded = () => setLastAdded(null);

  const removeFromCart = (productId: number, variantId?: number) => {
    setItems(prev =>
      prev.filter(item =>
        variantId
          ? !(item.product.id === productId && item.variant?.id === variantId)
          : item.product.id !== productId
      )
    );
  };

  const updateQuantity = (productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        const matches = variantId
          ? item.product.id === productId && item.variant?.id === variantId
          : item.product.id === productId;
        return matches
          ? { ...item, quantity: clampToStock(item.product, quantity) }
          : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.variant?.price ?? item.product.price) * item.quantity,
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
        addMultipleToCart,
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
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
