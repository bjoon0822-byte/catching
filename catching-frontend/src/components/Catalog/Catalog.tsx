import React, { useState } from 'react';
import { ShoppingCart, Search, TrendingUp, Camera, LayoutGrid, Filter, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { MOCK_MODULES } from '../../data/modules';
import { TiktokCreatorDB } from '../Modules/TiktokCreatorDB';
import { OfflineMapDB } from '../Modules/OfflineMapDB';
import { ModuleDetailModal } from './ModuleDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketingModule } from '../../store/useCartStore';

type BudgetRange = 'all' | 'under10m' | '10m-100m' | 'over100m';

export const Catalog: React.FC = () => {
    const { items, addItem } = useCartStore();
    const [activeTab, setActiveTab] = useState<'all' | 'tiktok' | 'offline'>('all');
    const [budgetFilter, setBudgetFilter] = useState<BudgetRange>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState<MarketingModule | null>(null);

    const handleAddToCart = (moduleId: string) => {
        const module = MOCK_MODULES.find(m => m.id === moduleId);
        if (module) addItem(module);
    };

    const isInCart = (id: string) => items.some(item => item.id === id);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    }

    const filteredModules = MOCK_MODULES.filter(m => {
        const matchesTab = activeTab === 'all' || m.category === activeTab;
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesBudget = true;
        if (budgetFilter === 'under10m') matchesBudget = m.basePrice <= 10000000;
        else if (budgetFilter === '10m-100m') matchesBudget = m.basePrice > 10000000 && m.basePrice <= 100000000;
        else if (budgetFilter === 'over100m') matchesBudget = m.basePrice > 100000000;
        return matchesTab && matchesSearch && matchesBudget;
    });

    return (
        <div className="w-full relative z-10 pb-20 bg-white text-slate-800">
            {/* Catalog Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 pb-6 gap-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center md:text-left w-full md:w-auto">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">캐칭 마케팅 모듈 숍</h2>
                        <p className="text-slate-500 mt-2 font-medium">AI 진단을 바탕으로 브랜드에 최적화된 마케팅 솔루션을 조합해 보세요.</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-full shadow-sm"
                    >
                        <ShoppingCart className="w-5 h-5 text-blue-500" />
                        <span>{items.reduce((acc, item) => acc + item.quantity, 0)}개 담김</span>
                    </motion.div>
                </div>

                {/* Filters Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col lg:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200"
                >
                    {/* Tabs */}
                    <div className="flex space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1">
                        <button onClick={() => setActiveTab('all')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'}`}>
                            <LayoutGrid className="w-4 h-4" /> 전체 카탈로그
                        </button>
                        <button onClick={() => setActiveTab('tiktok')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'tiktok' ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'}`}>
                            <TrendingUp className="w-4 h-4" /> 틱톡 크리에이터 매칭
                        </button>
                        <button onClick={() => setActiveTab('offline')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'offline' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'}`}>
                            <Camera className="w-4 h-4" /> 인생네컷 라이브 맵
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="모듈 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 w-full lg:w-64 placeholder-slate-400"
                            />
                        </div>
                        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 outline-none focus-within:ring-2 focus-within:ring-primary/30">
                            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                            <select
                                value={budgetFilter}
                                onChange={(e) => setBudgetFilter(e.target.value as BudgetRange)}
                                className="bg-transparent border-none text-sm font-medium text-slate-600 py-2.5 pl-2 pr-4 focus:outline-none cursor-pointer"
                            >
                                <option value="all">최대 예산: 전체</option>
                                <option value="under10m">~ 1,000만 원 이하</option>
                                <option value="10m-100m">~ 1억 원 이하</option>
                                <option value="over100m">1억 원 초과 (엔터프라이즈)</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Conditional Sub-Module Rendering */}
                <AnimatePresence mode="wait">
                    {activeTab === 'tiktok' && (
                        <motion.div
                            key="tiktok-db"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-12 overflow-hidden"
                        >
                            <TiktokCreatorDB />
                        </motion.div>
                    )}

                    {activeTab === 'offline' && (
                        <motion.div
                            key="offline-db"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-12 overflow-hidden"
                        >
                            <OfflineMapDB />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {filteredModules.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm"
                    >
                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">필터 조건에 맞는 모듈이 없습니다</h3>
                        <p className="text-slate-500">예산 한도를 늘리거나 검색어를 변경해 보세요.</p>
                    </motion.div>
                )}

                {/* Top 3 Main Modules */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-20">
                    <motion.div
                        layout
                        className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0"
                    >
                        <AnimatePresence>
                            {filteredModules.slice(0, 3).map((module) => {
                                // 왜(Why): 카테고리별 고유 색상으로 시각적 다양성을 줍니다
                                const colorMap: Record<string, { bg: string; border: string; icon: string; price: string; btn: string; btnHover: string; hoverBorder: string }> = {
                                    tiktok: { bg: 'bg-pink-50', border: 'border-pink-100', icon: 'text-pink-500', price: 'text-pink-600', btn: 'bg-pink-50 border-pink-200 text-pink-600', btnHover: 'hover:bg-pink-500 hover:text-white hover:border-pink-400', hoverBorder: 'hover:border-pink-300' },
                                    pr: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', price: 'text-blue-600', btn: 'bg-blue-50 border-blue-200 text-blue-600', btnHover: 'hover:bg-blue-500 hover:text-white hover:border-blue-400', hoverBorder: 'hover:border-blue-300' },
                                    offline: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-500', price: 'text-purple-600', btn: 'bg-purple-50 border-purple-200 text-purple-600', btnHover: 'hover:bg-purple-500 hover:text-white hover:border-purple-400', hoverBorder: 'hover:border-purple-300' },
                                    sns: { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'text-orange-500', price: 'text-orange-600', btn: 'bg-orange-50 border-orange-200 text-orange-600', btnHover: 'hover:bg-orange-500 hover:text-white hover:border-orange-400', hoverBorder: 'hover:border-orange-300' },
                                    meta: { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-500', price: 'text-indigo-600', btn: 'bg-indigo-50 border-indigo-200 text-indigo-600', btnHover: 'hover:bg-indigo-500 hover:text-white hover:border-indigo-400', hoverBorder: 'hover:border-indigo-300' },
                                    search: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-500', price: 'text-emerald-600', btn: 'bg-emerald-50 border-emerald-200 text-emerald-600', btnHover: 'hover:bg-emerald-500 hover:text-white hover:border-emerald-400', hoverBorder: 'hover:border-emerald-300' },
                                    tv: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500', price: 'text-red-600', btn: 'bg-red-50 border-red-200 text-red-600', btnHover: 'hover:bg-red-500 hover:text-white hover:border-red-400', hoverBorder: 'hover:border-red-300' },
                                    global: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'text-violet-500', price: 'text-violet-600', btn: 'bg-violet-50 border-violet-200 text-violet-600', btnHover: 'hover:bg-violet-500 hover:text-white hover:border-violet-400', hoverBorder: 'hover:border-violet-300' },
                                };
                                const c = colorMap[module.category] || colorMap.pr;
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        key={module.id}
                                        className={`bg-white rounded-[2rem] border border-slate-200 shadow-lg hover:shadow-xl ${c.hoverBorder} transition-all duration-500 group flex flex-col items-center text-center p-6 sm:p-8 relative cursor-pointer min-w-[240px] w-[75vw] sm:w-[80vw] md:w-auto md:min-w-0 snap-center shrink-0 md:shrink`}
                                        onClick={() => setSelectedModule(module)}
                                    >
                                        <div className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm ${c.border}`}>
                                            {module.category === 'tiktok' ? <TrendingUp className={`w-8 h-8 ${c.icon}`} /> : module.category === 'pr' ? <Search className={`w-8 h-8 ${c.icon}`} /> : <Camera className={`w-8 h-8 ${c.icon}`} />}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">{module.title}</h3>
                                        <p className="text-slate-500 text-[13px] leading-relaxed mb-6 font-medium px-2">{module.description}</p>
                                        <div className="mt-auto w-full flex flex-col items-center">
                                            <span className={`font-black text-2xl ${c.price} tracking-tighter mb-5`}>{formatPrice(module.basePrice)}원</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAddToCart(module.id); }}
                                                disabled={isInCart(module.id)}
                                                className={`w-full max-w-[200px] py-3.5 rounded-full font-bold transition-all text-[15px] border ${isInCart(module.id)
                                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                    : `${c.btn} ${c.btnHover} hover:shadow-lg`
                                                    }`}
                                            >
                                                {isInCart(module.id) ? '이미 담김' : '장바구니 담기'}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Sub-Grid Modules */}
                {filteredModules.length > 3 && (
                    <div className="w-full relative py-20">
                        <div className="absolute inset-0 border-t border-slate-200 -z-20"></div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {filteredModules.slice(3).map((module) => {
                                        // 왜(Why): 서브 카드에서도 카테고리별 색상 적용
                                        const catColor: Record<string, { gradient: string; iconColor: string; priceColor: string; hoverText: string }> = {
                                            tiktok: { gradient: 'bg-gradient-to-tr from-rose-200 to-pink-100', iconColor: 'text-pink-500', priceColor: 'text-pink-600', hoverText: 'group-hover:text-pink-600' },
                                            pr: { gradient: 'bg-gradient-to-br from-blue-200 to-indigo-100', iconColor: 'text-blue-500', priceColor: 'text-blue-600', hoverText: 'group-hover:text-blue-600' },
                                            offline: { gradient: 'bg-gradient-to-br from-purple-200 to-fuchsia-100', iconColor: 'text-purple-500', priceColor: 'text-purple-600', hoverText: 'group-hover:text-purple-600' },
                                            sns: { gradient: 'bg-gradient-to-tr from-amber-200 via-pink-100 to-purple-100', iconColor: 'text-orange-500', priceColor: 'text-orange-600', hoverText: 'group-hover:text-orange-600' },
                                            meta: { gradient: 'bg-gradient-to-br from-indigo-200 to-blue-100', iconColor: 'text-indigo-500', priceColor: 'text-indigo-600', hoverText: 'group-hover:text-indigo-600' },
                                            search: { gradient: 'bg-gradient-to-br from-emerald-200 to-teal-100', iconColor: 'text-emerald-500', priceColor: 'text-emerald-600', hoverText: 'group-hover:text-emerald-600' },
                                            tv: { gradient: 'bg-gradient-to-br from-red-200 to-orange-100', iconColor: 'text-red-500', priceColor: 'text-red-600', hoverText: 'group-hover:text-red-600' },
                                            global: { gradient: 'bg-gradient-to-br from-violet-200 to-indigo-100', iconColor: 'text-violet-500', priceColor: 'text-violet-600', hoverText: 'group-hover:text-violet-600' },
                                        };
                                        const cc = catColor[module.category] || catColor.pr;
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                                key={module.id}
                                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer group overflow-hidden relative"
                                                onClick={() => setSelectedModule(module)}
                                            >
                                                {/* Image Placeholder Area */}
                                                <div className="h-44 w-full bg-slate-50 relative flex items-center justify-center overflow-hidden">
                                                    <div className={`absolute inset-0 opacity-40 ${cc.gradient}`}></div>
                                                    <div className="absolute inset-0 opacity-[0.3] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                                                    <span className="relative z-10 text-3xl font-black text-slate-300 tracking-tighter uppercase"> {module.category}</span>
                                                    <div className="absolute top-4 left-4 z-20">
                                                        <span className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full bg-white/80 backdrop-blur-md text-slate-600 border border-slate-200 shadow-sm">
                                                            {module.category === 'tiktok' ? 'TikTok' : module.category === 'pr' ? 'Press' : module.category === 'sns' ? 'SNS' : module.category === 'meta' ? 'Meta' : module.category === 'search' ? 'Search' : module.category === 'tv' ? 'TV/CF' : module.category === 'global' ? 'Global' : 'O2O'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card Content */}
                                                <div className="p-6 pt-8 flex flex-col flex-1 relative">
                                                    <motion.div
                                                        whileHover={{ rotate: -10, scale: 1.15 }}
                                                        className="absolute -top-7 right-6 w-12 h-12 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center rotate-3 transition-transform"
                                                    >
                                                        {module.category === 'tiktok' ? <TrendingUp className={`w-5 h-5 ${cc.iconColor}`} /> : module.category === 'pr' ? <Search className={`w-5 h-5 ${cc.iconColor}`} /> : module.category === 'sns' ? <Camera className={`w-5 h-5 ${cc.iconColor}`} /> : module.category === 'meta' ? <Search className={`w-5 h-5 ${cc.iconColor}`} /> : module.category === 'search' ? <Search className={`w-5 h-5 ${cc.iconColor}`} /> : module.category === 'tv' ? <Camera className={`w-5 h-5 ${cc.iconColor}`} /> : module.category === 'global' ? <TrendingUp className={`w-5 h-5 ${cc.iconColor}`} /> : <Camera className={`w-5 h-5 ${cc.iconColor}`} />}
                                                    </motion.div>

                                                    <h3 className={`text-xl font-black text-slate-800 mb-2 tracking-tight ${cc.hoverText} transition-colors pr-2`}>{module.title}</h3>
                                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium line-clamp-2">{module.description}</p>

                                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200">
                                                        <span className={`font-black ${cc.priceColor} text-xl tracking-tight`}>{formatPrice(module.basePrice)}</span>
                                                        <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm whitespace-nowrap shrink-0">
                                                            자세히 <ArrowRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                <ModuleDetailModal
                    module={selectedModule}
                    isOpen={!!selectedModule}
                    onClose={() => setSelectedModule(null)}
                    onAddToCart={handleAddToCart}
                    isInCart={selectedModule ? isInCart(selectedModule.id) : false}
                />
            </div>
        </div>
    );
};
