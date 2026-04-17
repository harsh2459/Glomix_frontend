'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, IProduct } from '../types';
import toast from 'react-hot-toast';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: IProduct, quantity?: number, variant?: { name: string; value: string }) => void;
  removeItem: (productId: string, variant?: { name: string; value: string }) => void;
  updateQuantity: (productId: string, quantity: number, variant?: { name: string; value: string }) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const isSameItem = (
  item: CartItem,
  productId: string,
  variant?: { name: string; value: string }
): boolean => {
  if (!item?.product?._id) return false;  // guard against stale/corrupt data
  const sameProduct = item.product._id === productId;
  if (!variant && !item.variant) return sameProduct;
  if (!variant || !item.variant) return false;
  return sameProduct && item.variant.name === variant.name && item.variant.value === variant.value;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, variant) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) =>
            isSameItem(item, product._id, variant)
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            toast.success(`${product.name} quantity updated`);
            return { items: newItems };
          }

          toast.success(`${product.name} added to cart`);
          return {
            items: [...state.items, { product, quantity, variant }],
          };
        });
      },

      removeItem: (productId, variant) => {
        set((state) => ({
          items: state.items.filter((item) => !isSameItem(item, productId, variant)),
        }));
        toast.success('Item removed from cart');
      },

      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            isSameItem(item, productId, variant) ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => get().items
        .filter(item => item?.product?._id)          // skip orphaned items
        .reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items
          .filter(item => item?.product?._id)        // skip orphaned items
          .reduce((sum, item) => {
            const price = item.product.salePrice ?? item.product.price ?? 0;
            return sum + price * item.quantity;
          }, 0),
    }),
    {
      name: 'glomix-cart',
      skipHydration: true,
      // Strip out any items with missing product data on rehydration
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<{ items: CartItem[] }>;
        const validItems = (p?.items ?? []).filter(
          (item): item is CartItem => !!(item?.product?._id && item?.product?.price !== undefined)
        );
        return { ...current, ...(p as object), items: validItems };
      },
    }
  )
);
