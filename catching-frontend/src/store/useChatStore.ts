import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface Message {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    timestamp: number;
}

interface ChatState {
    messages: Message[];
    isTyping: boolean;
    setMessages: (messages: Message[]) => void;
    addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
    setTyping: (status: boolean) => void;
    clearMessages: () => void;
    forceSync: () => Promise<void>;
}

const DEFAULT_MESSAGE: Message = {
    id: 'init-1',
    sender: 'ai',
    text: '안녕하세요! 캐칭 AI 매니저입니다. 브랜드의 산업군, 예산, 그리고 주요 목표(KPI)를 알려주시면 맞춤형 마케팅 솔루션을 진단해 드립니다.',
    timestamp: Date.now(),
};

const syncChatsToDb = async (messages: Message[]) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
        const { data } = await supabase.from('user_chats').select('id').eq('user_id', user.id).maybeSingle();
        if (data) {
            await supabase.from('user_chats').update({ chat_history: messages, updated_at: new Date().toISOString() }).eq('id', data.id);
        } else {
            await supabase.from('user_chats').insert({ user_id: user.id, chat_history: messages });
        }
    } catch (e) {
        console.error("Chat sync failed", e);
    }
};

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            messages: [DEFAULT_MESSAGE],
            isTyping: false,
            setMessages: (messages) => set({ messages: messages.length > 0 ? messages : [DEFAULT_MESSAGE] }),
            addMessage: (msg) => {
                set((state) => ({
                    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
                }));
                syncChatsToDb(get().messages);
            },
            setTyping: (status) => set({ isTyping: status }),
            clearMessages: () => {
                set({ messages: [DEFAULT_MESSAGE] });
                syncChatsToDb([DEFAULT_MESSAGE]);
            },
            forceSync: async () => {
                await syncChatsToDb(get().messages);
            }
        }),
        {
            name: 'catching-chat-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ messages: state.messages }), // Only persist messages
        }
    )
);
