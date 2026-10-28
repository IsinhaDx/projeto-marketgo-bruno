import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cart, CartItem, Product, Store } from '@/types';
import {
  addToCart as addToCartUtil,
  EMPTY_CART,
  isValidCart,
  removeItem as removeItemUtil,
  replaceCart as replaceCartUtil,
  setQuantity as setQuantityUtil,
} from '@/utils/cart';

const STORAGE_KEY = '@marketgo:cart';

interface CartContextType {
  cart: Cart;
  addToCart: (
    store: Pick<Store, 'id' | 'name' | 'delivery_fee' | 'min_order'>,
    product: Pick<Product, 'id' | 'name' | 'emoji' | 'price'>,
    quantity?: number,
  ) => { conflict: boolean };
  replaceCart: (
    store: Pick<Store, 'id' | 'name' | 'delivery_fee' | 'min_order'>,
    product: Pick<Product, 'id' | 'name' | 'emoji' | 'price'>,
    quantity?: number,
  ) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (isValidCart(parsed)) setCart(parsed);
      } catch {
        AsyncStorage.removeItem(STORAGE_KEY);
      }
    });
  }, []);

  const saveCart = (newCart: Cart) => {
    setCart(newCart);
    if (newCart.items.length === 0) {
      AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCart));
    }
  };

  const addToCart = (
    store: Pick<Store, 'id' | 'name' | 'delivery_fee' | 'min_order'>,
    product: Pick<Product, 'id' | 'name' | 'emoji' | 'price'>,
    quantity = 1,
  ) => {
    const result = addToCartUtil(cart, store, product, quantity);
    if (!result.conflict) saveCart(result.cart);
    return { conflict: result.conflict };
  };

  const replaceCart = (
    store: Pick<Store, 'id' | 'name' | 'delivery_fee' | 'min_order'>,
    product: Pick<Product, 'id' | 'name' | 'emoji' | 'price'>,
    quantity = 1,
  ) => {
    saveCart(replaceCartUtil(store, product, quantity));
  };

  const setQuantity = (productId: string, quantity: number) => {
    saveCart(setQuantityUtil(cart, productId, quantity));
  };

  const removeItem = (productId: string) => {
    saveCart(removeItemUtil(cart, productId));
  };

  const clearCart = () => {
    saveCart(EMPTY_CART);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        replaceCart,
        setQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);