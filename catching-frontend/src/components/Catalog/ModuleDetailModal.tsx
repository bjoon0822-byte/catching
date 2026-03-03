import React from 'react';
import ReactDOM from 'react-dom';
import { X, ShoppingCart, Check, Star, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketingModule } from '../../store/useCartStore';

interface Props {
    module: MarketingModule | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (id: string) => void;
    isInCart: boolean;
}

// 카테고리별 예상 성과 지표 (시뮬레이션 데이터)
const CATEGORY_METRICS: Record<string, { reach: string; conversion: string; roi: string }> = {
    tiktok: { reach: '50만~500만 뷰', conversion: '앱 설치 5,000~50,000건', roi: '평균 ROAS 320%' },
    pr: { reach: '포털 메인 노출 3~7일', conversion: '브랜드 검색량 200%↑', roi: '신뢰도 지표 45%↑' },
    offline: { reach: '월 유동인구 150만 노출', conversion: 'QR 스캔 전환 8~12%', roi: 'O2O 방문 전환 15%↑' },
    sns: { reach: '팔로워 도달률 35~60%', conversion: '인게이지먼트 8~15%', roi: '평균 CPE ₩120~250' },
    meta: { reach: '도달 200만~1,000만', conversion: '클릭률(CTR) 2.5~4.5%', roi: '평균 ROAS 280%' },
    search: { reach: '키워드 노출 1위 점유', conversion: '클릭 전환율 12~18%', roi: '평균 CPC ₩350~800' },
    tv: { reach: '전국 시청률 0.5~3%', conversion: '브랜드 인지도 40%↑', roi: '1인당 도달 비용 ₩2~5' },
    global: { reach: '글로벌 1,000만 노출', conversion: '현지 앱 설치 10,000+', roi: '국내 역바이럴 효과 300%↑' },
};

// 각 카테고리별 FAQ
const CATEGORY_FAQ: Record<string, { q: string; a: string }[]> = {
    tiktok: [
        { q: '크리에이터 선정은 어떻게 하나요?', a: '캐칭 자체 DB에서 KPI에 맞는 최적의 크리에이터를 AI가 매칭합니다.' },
        { q: '콘텐츠 수정이 가능한가요?', a: '촬영 전 기획안 확인 및 1회 수정이 기본 포함됩니다.' },
    ],
    pr: [
        { q: '어떤 매체에 노출되나요?', a: '조선비즈, 한경, 매경, IT조선 등 Tier 1 매체를 포함합니다.' },
        { q: '기사 게재 보장인가요?', a: '프리미엄 패키지는 포털 메인 노출 보장형입니다.' },
    ],
    offline: [
        { q: '전국 매장을 선택할 수 있나요?', a: '네, 지역/상권 단위로 타겟팅이 가능합니다.' },
        { q: '디자인은 직접 해야하나요?', a: '프레임 디자인 가이드가 제공되며, 추가 비용으로 제작 대행도 가능합니다.' },
    ],
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);

export const ModuleDetailModal: React.FC<Props> = ({ module, isOpen, onClose, onAddToCart, isInCart }) => {
    if (!module) return null;

    const metrics = CATEGORY_METRICS[module.category] || CATEGORY_METRICS.tiktok;
    const faqs = CATEGORY_FAQ[module.category] || CATEGORY_FAQ.tiktok;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-lg max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Hero Header */}
                        <div className={`relative h-44 w-full flex items-center justify-center overflow-hidden ${module.category === 'tiktok' ? 'bg-gradient-to-tr from-cyan-400 to-pink-500' :
                            module.category === 'pr' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                module.category === 'sns' ? 'bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-500' :
                                    module.category === 'meta' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                                        module.category === 'search' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                                            module.category === 'tv' ? 'bg-gradient-to-br from-red-500 to-orange-600' :
                                                module.category === 'global' ? 'bg-gradient-to-br from-violet-600 to-indigo-700' :
                                                    'bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600'
                            }`}>
                            <span className="text-7xl font-black text-white/20 uppercase tracking-tighter">{module.category}</span>
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-5">
                                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase rounded-full border border-white/30">
                                    {module.category === 'tiktok' ? 'TikTok' : module.category === 'pr' ? 'Press' : module.category === 'sns' ? 'SNS' : module.category === 'meta' ? 'Meta' : module.category === 'search' ? 'Search' : module.category === 'tv' ? 'TV/CF' : module.category === 'global' ? 'Global' : 'O2O'}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 leading-tight">{module.title}</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">{module.description}</p>
                            </div>

                            {/* 예상 성과 지표 */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" /> 예상 성과 지표</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                                        <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                                        <div className="text-[11px] font-bold text-blue-600 mb-1">도달(Reach)</div>
                                        <div className="text-xs font-black text-slate-700">{metrics.reach}</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                                        <Zap className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                                        <div className="text-[11px] font-bold text-purple-600 mb-1">전환(Conv.)</div>
                                        <div className="text-xs font-black text-slate-700">{metrics.conversion}</div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                                        <Star className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                                        <div className="text-[11px] font-bold text-emerald-600 mb-1">ROI</div>
                                        <div className="text-xs font-black text-slate-700">{metrics.roi}</div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-3 text-center">자주 묻는 질문</h3>
                                <div className="space-y-3">
                                    {faqs.map((faq, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <div className="font-bold text-sm text-slate-700 mb-1.5 flex gap-2"><span className="text-blue-500">Q.</span> {faq.q}</div>
                                            <div className="text-sm text-slate-500 leading-relaxed pl-6">A. {faq.a}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xs font-bold text-slate-500 mb-0.5">모듈 가격</div>
                                <div className="text-2xl font-black text-blue-600 tracking-tight">{formatPrice(module.basePrice)}</div>
                            </div>
                            <button
                                onClick={() => { onAddToCart(module.id); onClose(); }}
                                disabled={isInCart}
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold transition-all text-sm border shadow-sm ${isInCart
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
                                    }`}
                            >
                                {isInCart ? <><Check className="w-4 h-4" /> 이미 담김</> : <><ShoppingCart className="w-4 h-4" /> 장바구니 담기</>}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>)}
        </AnimatePresence>,
        document.body
    );
};
