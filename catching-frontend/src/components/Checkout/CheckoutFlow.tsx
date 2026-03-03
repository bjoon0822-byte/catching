import React, { useState, useRef, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSignature, CreditCard, Download } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

// 왜(Why): 결제 성공 시 감성 UX를 위한 컨페티(축하 파티클) 애니메이션 컴포넌트
// 외부 라이브러리 없이 Canvas API로 구현하여 번들 사이즈 증가 없음
const ConfettiCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
        const particles: { x: number; y: number; w: number; h: number; color: string; vx: number; vy: number; rot: number; rv: number; opacity: number }[] = [];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 8 + 4,
                h: Math.random() * 6 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                rot: Math.random() * Math.PI * 2,
                rv: (Math.random() - 0.5) * 0.2,
                opacity: 1,
            });
        }

        let animId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // gravity
                p.rot += p.rv;
                if (p.y > canvas.height * 0.7) p.opacity -= 0.02;
                if (p.opacity <= 0) return;
                alive = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            if (alive) animId = requestAnimationFrame(animate);
        };
        animate();

        return () => cancelAnimationFrame(animId);
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-[9999] pointer-events-none" />;
};

export const CheckoutFlow: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [step, setStep] = useState(1);
    const [isAgreed, setIsAgreed] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const subTotal = getTotalPrice();
    const discountRate = items.length >= 3 ? 0.15 : items.length === 2 ? 0.05 : 0;
    const discountAmount = subTotal * discountRate;
    const finalTotal = subTotal - discountAmount;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    };

    const today = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const quoteNumber = `EST-${Date.now().toString().slice(-6)}`;

    const handleDownloadPDF = () => {
        if (!invoiceRef.current) return;
        const opt = {
            margin: 10,
            filename: `캐칭_견적서_${quoteNumber}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };
        html2pdf().from(invoiceRef.current).set(opt).save();
    };

    const handlePayment = async () => {
        // 왜(Why): 결제 완료 시 주문 내역을 Supabase에 저장하여
        // 리포트 보관함에서 실제 데이터로 조회할 수 있게 합니다.
        const user = useAuthStore.getState().user;
        if (user) {
            try {
                await supabase.from('user_orders').insert({
                    user_id: user.id,
                    quote_number: quoteNumber,
                    title: `마케팅 모듈 ${items.length}종 패키지`,
                    items: items.map(i => ({ id: i.id, title: i.title, category: i.category, quantity: i.quantity, price: i.basePrice })),
                    total_amount: finalTotal,
                    discount_rate: discountRate * 100,
                    status: 'paid',
                });
            } catch (e) {
                console.error('Order save failed:', e);
            }
        }
        setStep(3);
        clearCart();
    };

    if (items.length === 0 && step !== 3) {
        onBack();
        return null;
    }

    // 왜(Why): 비로그인 사용자가 결제까지 가면 주문 저장이 실패합니다.
    // 결제 화면 진입 전에 로그인 게이트를 표시합니다.
    const user = useAuthStore.getState().user;
    if (!user && step < 3) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
                        <CreditCard className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">로그인이 필요합니다</h2>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        결제를 진행하려면 로그인이 필요합니다.<br />
                        로그인 후 장바구니 내역이 그대로 유지됩니다.
                    </p>
                    <button
                        onClick={() => useAuthStore.getState().signInWithGoogle()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] mb-3"
                    >
                        Google로 로그인
                    </button>
                    <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
                        ← 쇼핑으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
            {/* Checkout Navbar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4 flex items-center justify-between shadow-sm">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-medium">
                    <ArrowLeft className="w-5 h-5" /> 돌아가기
                </button>

                <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                    <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-primary' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                        <span className="hidden sm:inline">견적 확인</span>
                    </div>
                    <div className="w-4 sm:w-8 h-px bg-slate-200"></div>
                    <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-primary' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                        <span className="hidden sm:inline">전자 서명 및 결제</span>
                    </div>
                    <div className="w-4 sm:w-8 h-px bg-slate-200"></div>
                    <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-primary' : ''}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
                        <span className="hidden sm:inline">완료</span>
                    </div>
                </div>
                <div className="w-24"></div> {/* Spacer balance */}
            </div>

            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

                {/* Step 1: Quote Review & PDF */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">다이렉트 자동 견적서</h2>
                                <p className="text-slate-500 mt-2">AI 결합 할인이 적용된 최종 견적서를 확인 및 다운로드 하세요.</p>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                className="bg-white border text-sm font-bold gap-2 border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center shadow-sm"
                            >
                                <Download className="w-4 h-4" /> PDF 다운로드
                            </button>
                        </div>

                        {/* A4 Printable Area */}
                        <div ref={invoiceRef} className="bg-white p-4 sm:p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200 mb-8 max-w-full sm:max-w-[210mm] mx-auto sm:min-h-[297mm]">
                            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 sm:pb-8 mb-6 sm:mb-8 gap-4">
                                <div>
                                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">QUOTATION</h1>
                                    <div className="text-slate-500 font-medium">No. {quoteNumber}</div>
                                    <div className="text-slate-500 font-medium">Date. {today}</div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-primary mb-1">CATCHING 플랫폼</h2>
                                    <p className="text-slate-500 text-sm">서울특별시 강남구 테헤란로 123<br />사업자등록번호: 123-45-67890<br />대표자: 김캐칭</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl mb-8 flex justify-between items-center border border-slate-100">
                                <div>
                                    <div className="text-sm font-bold text-slate-500 mb-1">수신</div>
                                    <div className="text-lg font-bold text-slate-900">귀하 (고객사)</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-500 mb-1">총 청구 금액 (VAT 포함)</div>
                                    <div className="text-3xl font-black text-primary">{formatPrice(finalTotal)}</div>
                                </div>
                            </div>

                            <table className="w-full text-left mb-8">
                                <thead>
                                    <tr className="border-b-2 border-slate-900 text-slate-900">
                                        <th className="py-3 font-bold w-1/2">항목 및 설명</th>
                                        <th className="py-3 font-bold text-center">수량</th>
                                        <th className="py-3 font-bold text-right">단가</th>
                                        <th className="py-3 font-bold text-right">금액</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="text-slate-700">
                                            <td className="py-4">
                                                <div className="font-bold text-slate-900">{item.title}</div>
                                                <div className="text-xs text-slate-500 mt-1">{item.category.toUpperCase()} 모듈</div>
                                            </td>
                                            <td className="py-4 text-center">{item.quantity}</td>
                                            <td className="py-4 text-right">{formatPrice(item.basePrice)}</td>
                                            <td className="py-4 text-right font-medium">{formatPrice(item.basePrice * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end border-t-2 border-slate-900 pt-6">
                                <div className="w-72 space-y-3">
                                    <div className="flex justify-between text-slate-600 font-medium">
                                        <span>공급가액</span>
                                        <span>{formatPrice(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-500 font-bold">
                                        <span>AI 결합 할인 ({(discountRate * 100)}%)</span>
                                        <span>- {formatPrice(discountAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-900 font-black text-xl border-t border-slate-200 pt-3 mt-3">
                                        <span>최종 결제 금액</span>
                                        <span className="text-primary">{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 text-center text-sm text-slate-400">
                                위와 같이 견적을 제출합니다. <br />본 견적서는 발행일로부터 14일간 유효합니다.
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 max-w-full sm:max-w-[210mm] mx-auto">
                            <button
                                onClick={() => setStep(2)}
                                className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/30"
                            >
                                전자 계약서 서명 및 결제 진행 <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Contract & Payment */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">전자 서명 및 간편 결제</h2>
                            <p className="text-slate-500">계약 조항을 확인하고 결제를 완료해 주세요.</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden mb-8">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                <FileSignature className="w-6 h-6 text-primary" />
                                <h3 className="font-bold text-lg">마케팅 대행 표준 계약서 (요약)</h3>
                            </div>
                            <div className="p-6 h-64 overflow-y-auto text-sm text-slate-600 bg-slate-50/50 leading-relaxed space-y-4">
                                <p>제 1조 (목적) 본 계약은 "캐칭"과 "고객사" 간의 마케팅 대행 업무에 관한 제반 사항 및 권리와 의무를 규정함을 목적으로 합니다.</p>
                                <p>제 2조 (서비스 범위) 확정된 견적서({quoteNumber})에 명시된 틱톡 크리에이터, 언론 홍보, 오프라인 광고 등의 모듈 제공을 포함합니다.</p>
                                <p>제 3조 (대금 결제) 고객사는 최종 견적 금액인 {formatPrice(finalTotal)}을 본 시스템을 통해 선결제하며, 결제 완료 시 즉각적인 캠페인 온보딩이 시작됩니다.</p>
                                <p>제 4조 (비밀 유지) 양 당사자는 본 계약과 관련하여 지득한 상대방의 영업비밀 및 정보를 제3자에게 누설하지 아니합니다.</p>
                                {/* Mock legal text */}
                            </div>
                            <div className="p-6 bg-white border-t border-slate-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="sr-only peer" />
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isAgreed ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                                        {isAgreed && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className="font-medium text-slate-700 select-none">위 계약 내용을 모두 확인하였으며, 이에 동의하고 전자 서명합니다.</span>
                                </label>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center mb-8">
                            <div className="text-sm font-bold text-slate-500 mb-2">최종 결제 금액</div>
                            <div className="text-4xl font-black text-slate-900 mb-8">{formatPrice(finalTotal)}</div>

                            <button
                                onClick={handlePayment}
                                disabled={!isAgreed}
                                className={`w-full font-bold py-5 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-xl text-lg group ${isAgreed ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                            >
                                <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                {isAgreed ? 'B2B 카드 간편 결제' : '계약서에 동의해 주세요'}
                            </button>
                        </div>

                        <button onClick={() => setStep(1)} className="text-center w-full text-slate-500 font-medium hover:text-slate-900 transition-colors">
                            이전 단계로 돌아가기
                        </button>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <>
                        <ConfettiCanvas />
                        <div className="animate-in zoom-in-95 duration-500 max-w-md mx-auto text-center py-20">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">결제 및 계약 완료!</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                성공적으로 마케팅 모듈이 접수되었습니다.<br />
                                담당 매니저가 1시간 이내에 온보딩 안내를 드립니다.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={onBack}
                                    className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    실시간 대시보드로 이동
                                </button>
                                <div className="text-sm text-slate-500 bg-slate-100 p-4 rounded-xl border border-slate-200">
                                    영수증 및 계약서 사본이 이메일로 발송되었습니다.
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
