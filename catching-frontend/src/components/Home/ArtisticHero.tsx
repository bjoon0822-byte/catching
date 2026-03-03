import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chatbot } from '../Chatbot/Chatbot';

const SCROLLING_WORDS = ['마케팅 큐레이션 플랫폼', '데이터 기반 솔루션', '예산 맞춤형 패키지'];

export const ArtisticHero: React.FC = () => {
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % SCROLLING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Trust Metrics for floating cards (Moved further out to prevent Chatbot overlap)
    const metrics = [
        { value: '320%', label: '평균 ROAS', top: '15%', left: '3%', delay: 0 },
        { value: '500+', label: '크리에이터 DB', top: '35%', right: '3%', delay: 2 },
        { value: '1,200건', label: '누적 캠페인', top: '65%', left: '5%', delay: 4 },
    ];

    return (
        <section className="relative w-full min-h-[80vh] sm:min-h-[95vh] flex flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 sm:px-6 lg:px-8 py-12 sm:py-24 z-10 isolate">
            {/* 1. Deep Ambient Mesh Gradient Background */}
            <div className="absolute inset-0 w-full h-full z-[-1] overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/15 rounded-full mix-blend-screen filter blur-[150px] animate-pulse" style={{ animationDuration: '15s' }} />
                <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] bg-blue-500/15 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay"></div>
            </div>

            {/* 2. Floating Glassmorphism Cards (Premium subtle movement) */}
            <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0 max-w-[1400px] mx-auto">
                {metrics.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-center"
                        style={{ top: stat.top, left: stat.left, right: stat.right }}
                        animate={{ y: [-15, 15, -15] }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: stat.delay }}
                    >
                        <span className="text-4xl font-black text-white tracking-tighter mb-2 drop-shadow-md">{stat.value}</span>
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em]">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* 3. Main Hero Content */}
            <div className="relative z-10 w-full max-w-5xl mx-auto text-center mt-4 sm:mt-8">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out-cubic
                >
                    <h2 className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[80px] font-black tracking-tight leading-[1.1] text-white mb-4 sm:mb-8">
                        단언컨대 가장 확실한 <br />
                        <span className="relative inline-block h-[1.3em] w-full mt-1 sm:mt-2">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={wordIndex}
                                    initial={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
                                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ y: -30, opacity: 0, filter: 'blur(8px)' }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent origin-center"
                                >
                                    {SCROLLING_WORDS[wordIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-lg md:text-2xl font-medium max-w-3xl mx-auto mb-8 sm:mb-16 leading-relaxed opacity-90 tracking-wide px-2">
                        AI 마케팅 큐레이션, 견적부터 성과 트래킹까지 원스톱.
                    </p>
                </motion.div>

                {/* 4. Chatbot Section wrapped in Glass */}
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/10 bg-white/5 backdrop-blur-xl"
                >
                    {/* Dark mode overlay specifically for the chatbot container context */}
                    <div className="p-1">
                        <Chatbot />
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
                animate={{ y: [0, 10, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                </div>
            </motion.div>
        </section>
    );
};
