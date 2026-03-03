import React, { useState, useEffect, Suspense } from 'react';

import { Catalog } from './components/Catalog/Catalog';
import { ArtisticHero } from './components/Home/ArtisticHero';
import { CartPanel } from './components/Cart/CartPanel';
import { Header, MobileMenu, Footer } from './components/Layout/Layout';
// 왜(Why): 초기 번들이 1.97MB로 Vercel 경고가 발생했습니다.
// 페이지 단위 코드 스플리팅으로 초기 로딩 시 사용하지 않는 컴포넌트를 지연 로드합니다.
const CheckoutFlow = React.lazy(() => import('./components/Checkout/CheckoutFlow').then(m => ({ default: m.CheckoutFlow })));
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const ReportArchive = React.lazy(() => import('./components/Archive/ReportArchive').then(m => ({ default: m.ReportArchive })));
const MyPage = React.lazy(() => import('./components/MyPage/MyPage').then(m => ({ default: m.MyPage })));
import { useCartStore } from './store/useCartStore';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'shop' | 'dashboard' | 'archive' | 'mypage'>('shop');


  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const { user, isLoading, signInWithGoogle, signOut, setUser } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null, session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  React.useEffect(() => {
    const handleOpenCheckout = () => setIsCheckoutOpen(true);
    window.addEventListener('open-checkout', handleOpenCheckout);
    return () => window.removeEventListener('open-checkout', handleOpenCheckout);
  }, []);

  // 왜(Why): 프로젝트 상세에서 "결제 진행" 클릭 시 프로젝트 모듈을 장바구니에 넣고 결제 화면으로 전환합니다.
  useEffect(() => {
    const handleProjectCheckout = (e: Event) => {
      const project = (e as CustomEvent).detail;
      if (!project?.modules) return;
      // 장바구니 초기화 후 프로젝트 모듈 세팅
      const cartStore = useCartStore.getState();
      cartStore.clearCart();
      project.modules.forEach((m: any) => {
        cartStore.addItem(
          { id: m.id, title: m.title, category: m.category, description: '', basePrice: m.basePrice },
          m.quantity
        );
      });
      setCurrentView('shop');
      setIsCheckoutOpen(true);
    };
    window.addEventListener('project-checkout', handleProjectCheckout);
    return () => window.removeEventListener('project-checkout', handleProjectCheckout);
  }, []);

  // 왜(Why): MyPage나 다른 컴포넌트에서 네비게이션 이벤트를 발생시켜 뷰를 전환합니다.
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const target = (e as CustomEvent).detail as string;
      setCurrentView(target as typeof currentView);
    };
    window.addEventListener('navigate-to', handleNavigate);
    return () => window.removeEventListener('navigate-to', handleNavigate);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isCheckoutOpen ? (
        <motion.div
          key="checkout"
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -20 }}
          transition={{ duration: 0.4, ease: "anticipate" }}
          className="min-h-screen bg-slate-50 relative z-50 overflow-hidden"
        >
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <CheckoutFlow onBack={() => {
              setIsCheckoutOpen(false);
              setCurrentView('dashboard');
            }} />
          </Suspense>
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-white flex flex-col font-sans relative overflow-hidden"
        >
          {/* Global Ambient Background Orb (Reference style) */}
          <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-blue-200 via-indigo-100/50 to-transparent blur-[80px] opacity-70 mix-blend-multiply"></div>
            <div className="absolute top-[5%] left-1/2 -translate-x-[60%] w-[300px] h-[300px] rounded-full bg-purple-200/40 blur-[60px] mix-blend-multiply"></div>
          </div>

          {/* Header */}
          <Header
            currentView={currentView}
            setCurrentView={setCurrentView}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            user={user}
            isLoading={isLoading}
            signInWithGoogle={signInWithGoogle}
            signOut={signOut}
            cartItemsCount={cartItemsCount}
          />

          {/* Mobile Slide Nav */}
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsCartOpen={setIsCartOpen}
            user={user}
            isLoading={isLoading}
            signInWithGoogle={signInWithGoogle}
            signOut={signOut}
            cartItemsCount={cartItemsCount}
          />

          {/* Main Content */}
          <main className="flex-1 w-full pb-20 overflow-hidden relative z-10">
            <AnimatePresence mode="wait">
              {currentView === 'shop' ? (
                <motion.div
                  key="shop"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArtisticHero />

                  {/* 2. Catalog Section */}
                  <section className="bg-white border-t border-b border-slate-200 py-10">
                    <Catalog />
                  </section>
                </motion.div>
              ) : currentView === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-28"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                    <Dashboard />
                  </Suspense>
                </motion.div>
              ) : currentView === 'archive' ? (
                <motion.div
                  key="archive"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-28"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                    <ReportArchive />
                  </Suspense>
                </motion.div>
              ) : currentView === 'mypage' ? (
                <motion.div
                  key="mypage"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-28"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                    <MyPage />
                  </Suspense>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </main >

          {/* Footer */}
          <Footer />



          {/* Slide-over Cart Panel */}
          < CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)
          } />
        </motion.div >
      )}
    </AnimatePresence >
  );
}

export default App;
