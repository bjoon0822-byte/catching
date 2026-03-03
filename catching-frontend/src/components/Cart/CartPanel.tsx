import React from 'react';
import { useCartStore } from '../../store/useCartStore';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CartPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    };

    const discountRate = items.length >= 3 ? 0.15 : items.length === 2 ? 0.05 : 0; // AI 결합 할인 시뮬레이션
    const subTotal = getTotalPrice();
    const discountAmount = subTotal * discountRate;
    const finalTotal = subTotal - discountAmount;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
                                <div className="bg-slate-100 p-2 rounded-xl">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                </div>
                                마케팅 솔루션 장바구니
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 relative">
                            {items.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4"
                                >
                                    <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-2">
                                        <ShoppingBag className="w-8 h-8 opacity-40 text-primary" />
                                    </div>
                                    <p className="font-medium text-slate-500">아직 장바구니에 담긴 모듈이 없습니다.</p>
                                    <button onClick={onClose} className="text-primary font-bold hover:underline text-sm hover:text-blue-700 transition-colors">카탈로그 둘러보기</button>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                className="flex gap-4 p-5 rounded-2xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 inline-block">
                                                            {item.category}
                                                        </span>
                                                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-sm mb-2 leading-snug pr-4">{item.title}</h4>
                                                    <div className="text-primary font-black text-[15px] mb-4">{formatPrice(item.basePrice)}</div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-0.5 shadow-sm">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer / Checkout Info */}
                        {items.length > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-6 border-t border-slate-200 bg-white z-10 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]"
                            >
                                <div className="space-y-3.5 mb-6">
                                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                                        <span>공급 가액</span>
                                        <span className="text-slate-900">{formatPrice(subTotal)}</span>
                                    </div>
                                    {discountRate > 0 && (
                                        <div className="flex justify-between text-blue-600 text-sm font-bold bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                                            <span className="flex items-center gap-1.5 text-primary">
                                                AI 결합 큐레이션 할인 <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">{(discountRate * 100)}%</span>
                                            </span>
                                            <span className="text-primary">-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 pt-4 pb-1 mt-4 flex justify-between items-end">
                                        <span className="font-bold text-slate-900">최종 견적 금액</span>
                                        <span className="text-3xl font-black text-primary tracking-tight">{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onClose();
                                        window.dispatchEvent(new CustomEvent('open-checkout'));
                                    }}
                                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                                >
                                    자동 견적서 발급 및 결제
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-center text-slate-400 text-[11px] mt-4 font-medium">
                                    * 결제 전 담당 매니저와 AI 자동 견적서(PDF) 검토가 가능합니다.
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
