-- Supabase Schema Setup for Catching (Phase 3)

-- 1. Create User_Chats table
CREATE TABLE public.user_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    chat_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_chats ENABLE ROW LEVEL SECURITY;

-- Create Policies for user_chats
CREATE POLICY "Users can insert their own chats" ON public.user_chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own chats" ON public.user_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.user_chats FOR UPDATE USING (auth.uid() = user_id);

-- 2. Create User_Carts table
CREATE TABLE public.user_carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

-- Create Policies for user_carts
CREATE POLICY "Users can insert their own carts" ON public.user_carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own carts" ON public.user_carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own carts" ON public.user_carts FOR UPDATE USING (auth.uid() = user_id);

-- 3. Create User_Orders table (P3: 주문 이력 영구 저장)
-- 왜: 결제 완료 시 주문 내역을 보존하여 리포트 보관함에서 실제 데이터를 조회합니다.
CREATE TABLE public.user_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,
    title TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount BIGINT NOT NULL DEFAULT 0,
    discount_rate NUMERIC(5,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'consulting', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;

-- Create Policies for user_orders
CREATE POLICY "Users can insert their own orders" ON public.user_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.user_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.user_orders FOR UPDATE USING (auth.uid() = user_id);

-- 4. Create User_Projects table (Phase 7: 프로젝트 시스템)
-- 왜: 챗봇에서 AI 추천 → 프로젝트 생성 → 모듈 커스터마이징 → 결제 플로우를 지원합니다.
CREATE TABLE public.user_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paid', 'completed')),
    modules JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_summary TEXT DEFAULT '',
    total_amount BIGINT NOT NULL DEFAULT 0,
    chat_snapshot JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- Create Policies for user_projects
CREATE POLICY "Users can insert their own projects" ON public.user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own projects" ON public.user_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.user_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.user_projects FOR DELETE USING (auth.uid() = user_id);
