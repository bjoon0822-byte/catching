import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export type ModuleCategory = 'tiktok' | 'pr' | 'offline' | 'search' | 'meta' | 'tv' | 'global' | 'sns';

export interface MarketingModule {
    id: string;
    category: ModuleCategory;
    title: string;
    description: string;
    basePrice: number;
    imageUrl?: string;
}

export interface CartItem extends MarketingModule {
    quantity: number;
    options?: any;
}

interface CartState {
    items: CartItem[];
    setItems: (items: CartItem[]) => void;
    addItem: (module: MarketingModule, quantity?: number, options?: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

const syncCartToDb = async (items: CartItem[]) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
        const { data } = await supabase.from('user_carts').select('id').eq('user_id', user.id).maybeSingle();
        if (data) {
            await supabase.from('user_carts').update({ cart_items: items, updated_at: new Date().toISOString() }).eq('id', data.id);
        } else {
            await supabase.from('user_carts').insert({ user_id: user.id, cart_items: items });
        }
    } catch (e) {
        console.error("Cart sync failed", e);
    }
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    setItems: (items) => set({ items }),
    addItem: (module, quantity = 1, options = {}) => {
        set((state) => {
            const existingItem = state.items.find(item => item.id === module.id);
            if (existingItem) {
                return {
                    items: state.items.map(item =>
                        item.id === module.id
                            ? { ...item, quantity: item.quantity + quantity, options: { ...item.options, ...options } }
                            : item
                    )
                };
            }
            return { items: [...state.items, { ...module, quantity, options }] };
        });
        syncCartToDb(get().items);
    },
    removeItem: (id) => {
        set((state) => ({ items: state.items.filter(item => item.id !== id) }));
        syncCartToDb(get().items);
    },
    updateQuantity: (id, quantity) => {
        if (quantity < 1) {
            // 수량이 0 이하면 아이템 자체를 제거
            set((state) => ({ items: state.items.filter(item => item.id !== id) }));
        } else {
            set((state) => ({
                items: state.items.map(item => item.id === id ? { ...item, quantity } : item)
            }));
        }
        syncCartToDb(get().items);
    },
    clearCart: () => {
        set({ items: [] });
        syncCartToDb([]);
    },
    getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.basePrice * item.quantity), 0);
    }
}));
