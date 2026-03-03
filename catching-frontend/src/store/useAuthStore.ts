import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useCartStore } from './useCartStore';
import { useChatStore } from './useChatStore';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    setUser: (user: User | null, session: Session | null) => void;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true, // initial load state
    setUser: async (user, session) => {
        set({ user, session, isLoading: false });

        if (user) {
            // Load Cart
            const { data: cartData } = await supabase.from('user_carts').select('cart_items').eq('user_id', user.id).maybeSingle();
            if (cartData && cartData.cart_items) {
                useCartStore.getState().setItems(cartData.cart_items);
            }

            // Load Chat (Guest History Merge)
            const localMessages = useChatStore.getState().messages;
            const { data: chatData } = await supabase.from('user_chats').select('chat_history').eq('user_id', user.id).maybeSingle();

            if (localMessages.length > 1) {
                // 왜(Why): 비로그인 상태에서 나눈 대화가 있다면 리로드되어도 Zustand persist가 복구합니다.
                // 이 상태에서 로그인 시, 기존 DB 내역으로 덮어쓰지 않고 현재 대화를 DB로 강제 싱크(승격)합니다.
                await useChatStore.getState().forceSync();
            } else if (chatData && chatData.chat_history && chatData.chat_history.length > 0) {
                // 로컬 대화가 없으면 기존 DB 내역 불러오기
                useChatStore.getState().setMessages(chatData.chat_history);
            }
        } else {
            useCartStore.getState().clearCart();
            useChatStore.getState().clearMessages();
        }
    },
    signInWithGoogle: async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
            });
        } catch (error) {
            console.error('Login error:', error);
        }
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    }
}));
