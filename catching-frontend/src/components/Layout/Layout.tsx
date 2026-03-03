import React from 'react';
import { ShoppingBag, LogIn, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '@supabase/supabase-js';

// 왜(Why): App.tsx가 440줄 이상으로 비대해져서 유지보수가 어려웠습니다.
// 헤더를 별도 컴포넌트로 분리하여 코드 가독성과 모듈화를 개선합니다.

type ViewType = 'shop' | 'dashboard' | 'archive' | 'mypage';

interface HeaderProps {
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    user: User | null;
    isLoading: boolean;
    signInWithGoogle: () => void;
    signOut: () => void;
    cartItemsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
    currentView, setCurrentView,
    setIsCartOpen,
    isMobileMenuOpen, setIsMobileMenuOpen,
    user, isLoading, signInWithGoogle, signOut,
    cartItemsCount,
}) => (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center relative z-10">
            <div className="flex items-center cursor-pointer group" onClick={() => setCurrentView('shop')}>
                {/* 브랜드 로고 이미지 */}
                <img src="/logo.png" alt="CATCHING" className="h-9 sm:h-10 object-contain group-hover:scale-105 transition-transform" />
                <span className="ml-3 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold tracking-widest uppercase hidden sm:inline-block border border-slate-200">B2B</span>
            </div>

            <nav className="hidden md:flex space-x-10 text-[15px] font-bold text-slate-500 h-full items-center">
                <button onClick={() => setCurrentView('shop')} className={`h-full relative flex items-center transition-colors ${currentView === 'shop' ? "text-slate-900" : "hover:text-slate-800"}`}>
                    AI 진단 &amp; 쇼핑
                    {currentView === 'shop' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                </button>
                <button onClick={() => setCurrentView('dashboard')} className={`h-full relative flex items-center transition-colors ${currentView === 'dashboard' ? "text-slate-900" : "hover:text-slate-800"}`}>
                    실시간 대시보드
                    {currentView === 'dashboard' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                </button>
                <button onClick={() => setCurrentView('archive')} className={`h-full relative flex items-center transition-colors ${currentView === 'archive' ? "text-slate-900" : "hover:text-slate-800"}`}>
                    리포트 보관함
                    {currentView === 'archive' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                </button>
                {user && (
                    <button onClick={() => setCurrentView('mypage')} className={`h-full relative flex items-center transition-colors ${currentView === 'mypage' ? "text-slate-900" : "hover:text-slate-800"}`}>
                        마이페이지
                        {currentView === 'mypage' && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                    </button>
                )}
            </nav>

            <div className="flex items-center h-full gap-3">
                {/* Desktop Auth UI */}
                {!isLoading && (
                    user ? (
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-100 rounded-full pl-1.5 pr-3 py-1 border border-slate-200">
                                <img src={user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" className="w-6 h-6 rounded-full bg-slate-200" />
                                <span className="text-xs font-bold text-slate-700">{user.user_metadata.full_name || user.email?.split('@')[0]}</span>
                            </div>
                            <button onClick={signOut} className="text-slate-400 hover:text-red-500 transition-colors" title="로그아웃">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={signInWithGoogle} className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95">
                            <LogIn className="w-4 h-4" /> 로그인
                        </button>
                    )
                )}

                {/* Cart Toggle — always visible */}
                {currentView === 'shop' && (
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 group h-full"
                    >
                        <div className="bg-slate-100 border border-slate-200 shadow-sm group-hover:border-blue-300 group-hover:bg-blue-50 p-2.5 rounded-full transition-all group-hover:scale-105 group-hover:text-blue-500">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        {cartItemsCount > 0 && (
                            <motion.span
                                key={cartItemsCount}
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute top-3 right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-blue-500 text-[11px] font-black text-white shadow-md ring-2 ring-white"
                            >
                                {cartItemsCount}
                            </motion.span>
                        )}
                    </button>
                )}

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
        </div>
    </header>
);

// 왜(Why): 모바일 슬라이드 네비게이션을 별도 컴포넌트로 분리합니다.
interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    setIsCartOpen: (open: boolean) => void;
    user: User | null;
    isLoading: boolean;
    signInWithGoogle: () => void;
    signOut: () => void;
    cartItemsCount: number;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen, onClose,
    currentView, setCurrentView,
    setIsCartOpen,
    user, isLoading, signInWithGoogle, signOut,
    cartItemsCount,
}) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-30 md:hidden flex flex-col border-l border-slate-200"
                >
                    <div className="p-6 border-b border-slate-200 max-h-[160px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-lg text-slate-800 tracking-tight">메뉴</h3>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {!isLoading && (
                            user ? (
                                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-200">
                                    <img src={user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-slate-800 truncate">{user.user_metadata.full_name || user.email?.split('@')[0]}</div>
                                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                                    </div>
                                    <button onClick={() => { signOut(); onClose(); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="로그아웃">
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => { signInWithGoogle(); onClose(); }} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-700 transition-colors">
                                    <LogIn className="w-4 h-4" /> 구글로 로그인
                                </button>
                            )
                        )}
                    </div>
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <button onClick={() => { setCurrentView('shop'); onClose(); }} className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-[15px] transition-colors ${currentView === 'shop' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                            AI 진단 &amp; 쇼핑
                        </button>
                        <button onClick={() => { setCurrentView('dashboard'); onClose(); }} className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-[15px] transition-colors ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                            실시간 대시보드
                        </button>
                        <button onClick={() => { setCurrentView('archive'); onClose(); }} className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-[15px] transition-colors ${currentView === 'archive' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                            리포트 보관함
                        </button>
                        {user && (
                            <button onClick={() => { setCurrentView('mypage'); onClose(); }} className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-[15px] transition-colors ${currentView === 'mypage' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                                마이페이지
                            </button>
                        )}
                        {currentView === 'shop' && (
                            <button onClick={() => { setIsCartOpen(true); onClose(); }} className="w-full text-left px-4 py-3.5 rounded-xl font-bold text-[15px] text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-between mt-2 border-t border-slate-200 pt-4">
                                <span>장바구니</span>
                                {cartItemsCount > 0 && <span className="bg-blue-500 text-white text-xs font-black px-2.5 py-1 rounded-full">{cartItemsCount}</span>}
                            </button>
                        )}
                    </nav>
                    <div className="p-4 border-t border-slate-200 shrink-0">
                        <p className="text-xs text-slate-400 text-center">&copy; 2026 Catching Platform</p>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

// 왜(Why): 푸터를 별도 컴포넌트로 분리합니다.
export const Footer: React.FC = () => (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-xl font-black text-white tracking-tighter mb-4">CATCHING</h3>
                    <p className="text-xs leading-relaxed text-slate-500">AI 기반 마케팅 큐레이션으로<br />브랜드 성장을 이끕니다.</p>
                    <div className="flex gap-4 mt-6">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-[12px] font-bold cursor-pointer hover:bg-slate-700 hover:text-white transition-all">in</div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-[12px] font-bold cursor-pointer hover:bg-slate-700 hover:text-white transition-all">f</div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-[12px] font-bold cursor-pointer hover:bg-slate-700 hover:text-white transition-all">t</div>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-6 tracking-wide">회사 소개</h4>
                    <ul className="space-y-4 text-xs font-medium">
                        <li><a href="#" className="hover:text-white transition-colors">캐칭 소개</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">채용 안내</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">블로그</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">요금 안내</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-6 tracking-wide">서비스</h4>
                    <ul className="space-y-4 text-xs font-medium">
                        <li><a href="#" className="hover:text-white transition-colors">견적서 발급</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">전자 계약</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">실시간 대시보드</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">AI 제안서</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-6 tracking-wide">고객 지원</h4>
                    <ul className="space-y-4 text-xs font-medium">
                        <li><a href="#" className="hover:text-white transition-colors">제안서 양식</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">견적서 양식</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">이용 가이드</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">자주 묻는 질문</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white mb-6 tracking-wide">문의하기</h4>
                    <ul className="space-y-4 text-xs font-medium text-slate-400">
                        <li className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px]">✉️</div>shakdir260@gmail.com</li>
                        <li className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px]">📞</div>+10-100-000-0000</li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 text-center border-t border-slate-800">
                <p className="text-[11px] text-slate-500 font-medium">Copyright © Catching {new Date().getFullYear()}. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
);
