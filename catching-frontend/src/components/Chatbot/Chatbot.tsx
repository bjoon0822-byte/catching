import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useCartStore } from '../../store/useCartStore';
import { MOCK_MODULES } from '../../data/modules';
import { Send, Bot, User, Loader2, ShoppingCart, Check, RotateCcw, Target, Sparkles, TrendingUp, FolderPlus } from 'lucide-react';
import axios from 'axios';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

// 왜(Why): 정적 타이핑 메시지 대신 단계별로 변환되는 애니메이션으로 체감 대기시간 단축
const TYPING_STAGES = [
    '브랜드 진단 중...',
    '채널 분석 중...',
    '솔루션 구성 중...',
];

const TypingIndicator: React.FC = () => {
    const [stage, setStage] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setStage(s => (s + 1) % TYPING_STAGES.length), 2000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="flex justify-start">
            <div className="flex flex-row items-end gap-3">
                <div className="p-2.5 rounded-[1.2rem] flex-shrink-0 bg-slate-100 text-blue-600 border border-slate-200 shadow-sm">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="px-5 py-4 bg-white rounded-3xl rounded-bl-md shadow-sm border border-slate-100 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-slate-600 text-sm font-bold tracking-tight transition-all duration-300">{TYPING_STAGES[stage]}</span>
                </div>
            </div>
        </div>
    );
};

export const Chatbot: React.FC = () => {
    const { messages, isTyping, addMessage, setTyping, clearMessages, setMessages } = useChatStore();
    const { items, addItem } = useCartStore();
    const [input, setInput] = useState('');
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const historyRestoredRef = useRef(false);

    // 왜(Why): 로그인 유저의 이전 대화 내역을 Supabase에서 복원합니다.
    useEffect(() => {
        if (historyRestoredRef.current) return;
        const restoreChat = async () => {
            const user = useAuthStore.getState().user;
            if (!user) return;
            try {
                const { data } = await supabase
                    .from('user_chats').select('chat_history').eq('user_id', user.id).maybeSingle();
                if (data?.chat_history && Array.isArray(data.chat_history) && data.chat_history.length > 1) {
                    setMessages(data.chat_history);
                    historyRestoredRef.current = true;
                }
            } catch (e) {
                console.error('채팅 히스토리 복원 실패:', e);
            }
        };
        restoreChat();
    }, [setMessages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            const container = messagesContainerRef.current;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 50);
    };

    // Scroll when messages length changes or when AI starts typing
    useEffect(() => {
        scrollToBottom();
    }, [messages.length, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userText = input.trim();
        addMessage({ sender: 'user', text: userText });
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setTyping(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            // 왜(Why): 전체 히스토리를 보내면 payload가 커져서 느려집니다.
            // 최근 10턴만 보내되, 이전 대화 맥락은 시스템 요약으로 대체합니다.
            const allMsgs = [...messages, { sender: 'user' as const, text: userText }];
            const trimmedHistory = allMsgs.slice(-10).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
            }));

            const payload = { message: userText, history: trimmedHistory };
            // 왜(Why): AI 모델 응답이 복잡한 추천일수록 30초 이상 소요될 수 있어 60초로 설정합니다.
            // 타임아웃 발생 시 자동으로 1회 재시도하여 사용자가 직접 다시 보낼 필요 없게 합니다.
            let res;
            try {
                res = await axios.post(`${apiUrl}/api/ai/chat`, payload, { timeout: 60000 });
            } catch (firstErr: any) {
                if (firstErr.code === 'ECONNABORTED') {
                    // 타임아웃 시 자동 1회 재시도
                    res = await axios.post(`${apiUrl}/api/ai/chat`, payload, { timeout: 60000 });
                } else {
                    throw firstErr;
                }
            }
            addMessage({ sender: 'ai', text: res.data.message });
        } catch (error: any) {
            console.error("AI Error:", error);
            const isNetwork = !error.response;
            const isTimeout = error.code === 'ECONNABORTED';
            const errorMsg = isTimeout
                ? '⏱️ AI 서버 응답이 지연되고 있습니다. 잠시 후 다시 질문해 주세요.'
                : isNetwork
                    ? '🌐 네트워크 연결을 확인해 주세요. 서버에 연결할 수 없습니다.'
                    : '⚠️ 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
            addMessage({ sender: 'ai', text: errorMsg });
        } finally {
            setTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    const handleAddModulesToCart = (moduleIds: string[]) => {
        moduleIds.forEach(id => {
            const module = MOCK_MODULES.find(m => m.id === id);
            // Only add if not already in cart
            if (module && !items.some(item => item.id === id)) {
                addItem(module);
            }
        });
        setToastMsg('✅ 추천 모듈이 장바구니에 담겼습니다!');
        setTimeout(() => setToastMsg(null), 3000);
    };

    // 왜(Why): AI 응답에서 **볼드**, 리스트 등 간단한 마크다운을 HTML로 변환합니다.
    const renderMarkdown = (raw: string) => {
        let html = raw
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
            .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$1. $2</li>')
            .replace(/\n/g, '<br />');
        // 연속된 <li>를 <ul>로 감싸기
        html = html.replace(/((?:<li[^>]*>.*?<\/li>(?:<br \/>)?)+)/g, '<ul class="space-y-1 my-2">$1</ul>');
        return html;
    };

    const renderMessage = (text: string) => {
        // 왜(Why): AI 응답의 포맷 미세 차이(공백, \r\n 등)로 인해 정규식이 실패하여 선택창이 안 뜨는 버그 방지
        const jsonMatch = text.match(/```[a-z]*\s*({[\s\S]*?})\s*```/i);

        if (jsonMatch) {
            const cleanText = text.replace(jsonMatch[0], '').trim();
            let recommendedIds: string[] = [];

            try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.recommended_modules && Array.isArray(parsed.recommended_modules)) {
                    // id를 안전하게 소문자로 변환하여 매칭
                    recommendedIds = parsed.recommended_modules.map((id: string) => id.toLowerCase());
                }
            } catch (e) {
                console.error("JSON parse error:", e);
            }

            const recommendedModules = recommendedIds.map(id => MOCK_MODULES.find(m => m.id === id)).filter(Boolean) as typeof MOCK_MODULES;

            return (
                <div className="space-y-5">
                    <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(cleanText) }} />
                    {recommendedModules.length > 0 && (
                        <div className="mt-4 p-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-xl border border-white shadow-xl rounded-2xl relative overflow-hidden group">
                            {/* Inner Glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-500"></div>

                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 relative z-10 tracking-tight">
                                <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                AI 맞춤형 큐레이션 패키지
                            </h4>
                            <ul className="space-y-2.5 mb-5 relative z-10">
                                {recommendedModules.map(m => {
                                    const inCart = items.some(item => item.id === m.id);
                                    return (
                                        <li key={m.id} className="flex justify-between items-center text-[13px] bg-white/60 p-2.5 rounded-xl border border-white/80 shadow-sm">
                                            <span className="text-slate-700 font-bold truncate mr-2">{m.title}</span>
                                            <span className="font-black text-slate-900 whitespace-nowrap bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">
                                                {new Intl.NumberFormat('ko-KR').format(m.basePrice)}원
                                                {inCart && <Check className="inline w-3 h-3 text-emerald-500 ml-1" />}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center mb-1 relative z-10">
                                <span className="font-bold text-slate-500 text-xs">총 제안 금액</span>
                                <span className="font-black text-primary text-xl tracking-tighter">
                                    {new Intl.NumberFormat('ko-KR').format(recommendedModules.reduce((acc, curr) => acc + curr.basePrice, 0))}원
                                </span>
                            </div>
                            <button
                                onClick={() => handleAddModulesToCart(recommendedIds)}
                                className="mt-5 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-sm relative z-10"
                            >
                                <ShoppingCart className="w-4 h-4" /> 제안 패키지 장바구니 일괄 담기
                            </button>
                            <button
                                onClick={async () => {
                                    const user = useAuthStore.getState().user;
                                    if (!user) {
                                        setToastMsg('로그인이 필요합니다. 구글 로그인 창으로 이동합니다...');
                                        setTimeout(() => setToastMsg(null), 2000);
                                        useAuthStore.getState().signInWithGoogle();
                                        return;
                                    }
                                    try {
                                        const projectModules = recommendedModules.map(m => ({
                                            id: m.id, title: m.title, category: m.category, basePrice: m.basePrice, quantity: 1,
                                        }));
                                        const project = await useProjectStore.getState().createProject(
                                            `AI 추천 ${new Date().toLocaleDateString('ko-KR')} 프로젝트`,
                                            cleanText.slice(0, 200),
                                            projectModules,
                                            cleanText,
                                        );
                                        if (project) {
                                            setToastMsg('📁 프로젝트가 생성되었습니다! 마이페이지에서 확인하세요.');
                                            setTimeout(() => setToastMsg(null), 3000);
                                            window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'mypage' }));
                                        } else {
                                            setToastMsg('⚠️ 프로젝트 생성에 실패했습니다. (DB 테이블을 확인해 주세요)');
                                            setTimeout(() => setToastMsg(null), 4000);
                                        }
                                    } catch (err: any) {
                                        console.error('프로젝트 생성 에러:', err);
                                        setToastMsg(`⚠️ 실패: ${err.message || '알 수 없는 오류'}`);
                                        setTimeout(() => setToastMsg(null), 5000);
                                    }
                                }}
                                className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm relative z-10"
                            >
                                <FolderPlus className="w-4 h-4" /> 이 추천으로 프로젝트 만들기
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        return <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />;
    };

    const suggestedPrompts = [
        { icon: <Target className="w-3.5 h-3.5" />, text: "KPI 기반 마케팅 진단" },
        { icon: <Sparkles className="w-3.5 h-3.5" />, text: "신제품 런칭 캠페인 기획" },
        { icon: <TrendingUp className="w-3.5 h-3.5" />, text: "2030 타겟 숏폼 큐레이션" },
    ];

    const isChatActive = messages.length > 1;

    return (
        <div className={`flex flex-col w-full max-w-4xl mx-auto relative transition-all duration-500 ${isChatActive ? 'h-[min(500px,calc(100vh-180px))] sm:h-[min(650px,calc(100vh-240px))]' : 'h-auto py-6 sm:py-10'}`}>
            {/* 토스트 알림 */}
            {toastMsg && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50">
                    <div className="bg-slate-900 text-white text-sm font-bold px-6 py-3 rounded-full shadow-xl border border-slate-700 whitespace-nowrap">{toastMsg}</div>
                </div>
            )}

            {!isChatActive ? (
                // ---------------- Empty State (Pill Search UI) ----------------
                <div className="flex flex-col items-center justify-center w-full px-4">
                    <form onSubmit={handleSend} className="w-full max-w-3xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 rounded-3xl p-2.5 flex items-end focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all">
                        <div className="p-3 text-blue-500 opacity-80">
                            <Bot className="w-6 h-6" />
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Initiate a query or send a command to the AI..."
                            className="flex-1 bg-transparent resize-none focus:outline-none px-2 py-3.5 text-slate-700 placeholder:text-slate-400 min-h-[52px] max-h-[140px] text-base font-medium leading-relaxed scrollbar-hide"
                            disabled={isTyping}
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="flex-shrink-0 w-12 h-12 ml-2 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 shadow-md hover:shadow-lg active:scale-95 border border-blue-600/20"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                        {suggestedPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setInput(prompt.text); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 shadow-sm rounded-full text-[13px] font-bold text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                            >
                                {prompt.icon} {prompt.text}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // ---------------- Active Chat UI ----------------
                <div className="flex flex-col flex-1 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative">
                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-4 sm:py-5 flex items-center text-slate-900 border-b border-slate-100 relative z-10">
                        <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/20 mr-4">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-black text-lg tracking-tight">캐칭 AI 마케팅 매니저</h2>
                            <p className="text-slate-500 text-xs font-bold mt-0.5">실시간 브랜드 맞춤형 큐레이션</p>
                        </div>
                        <button
                            onClick={clearMessages}
                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-bold text-xs flex items-center gap-1.5"
                            title="새 상담 시작"
                        >
                            <RotateCcw className="w-4 h-4" /> 리셋
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-transparent relative scrollbar-hide py-4 sm:py-8 z-0">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 16, x: msg.sender === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: idx === messages.length - 1 ? 0.05 : 0 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                                    <div className={`p-2.5 rounded-[1.2rem] flex-shrink-0 ${msg.sender === 'user' ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md' : 'bg-slate-100 text-blue-600 border border-slate-200 shadow-sm'}`}>
                                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`px-5 py-4 rounded-3xl ${msg.sender === 'user' ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-br-md shadow-md font-medium' : 'bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100 font-medium'} w-full overflow-hidden leading-relaxed text-[15px]`}>
                                        {renderMessage(msg.text)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <TypingIndicator />
                        )}
                        <div className="h-4" />
                    </div>

                    {/* Input Form */}
                    <div className="p-4 bg-white/50 backdrop-blur-md border-t border-slate-100 z-10">
                        <form onSubmit={handleSend} className="flex relative items-end bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all p-2 shadow-sm">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleTextareaChange}
                                onKeyDown={handleKeyDown}
                                placeholder="추가 문의사항을 입력해 주세요... (Shift+Enter로 줄바꿈)"
                                className="w-full bg-transparent resize-none focus:outline-none pl-4 py-2.5 text-slate-800 placeholder:text-slate-400 min-h-[44px] max-h-[140px] text-[15px] font-medium leading-relaxed"
                                disabled={isTyping}
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="flex-shrink-0 aspect-square w-11 h-11 mb-1 ml-2 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-[1rem] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 border border-blue-600/20"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
