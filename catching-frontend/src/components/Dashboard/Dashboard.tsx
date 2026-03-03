import React, { useRef, useState, useMemo, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Users, PlaySquare, ArrowDownToLine, Download, Activity, Zap, Calendar, ChevronDown, BarChart3 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { motion } from 'framer-motion';

// 왜(Why): 초기 카운트업 + 주기적 상승 + 부드러운 숫자 전환 애니메이션
const useLiveStat = (target: number, duration = 1200) => {
    const [displayValue, setDisplayValue] = useState(0);
    const currentRef = React.useRef(0);
    const targetRef = React.useRef(target);
    const rafRef = React.useRef<number>(0);

    // 부드러운 숫자 전환 (rAF 기반 보간)
    const animateTo = React.useCallback((to: number, dur: number) => {
        cancelAnimationFrame(rafRef.current);
        const from = currentRef.current;
        const startTime = performance.now();
        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / dur, 1);
            const eased = 1 - Math.pow(2, -10 * progress);
            const val = Math.floor(from + (to - from) * eased);
            currentRef.current = val;
            setDisplayValue(val);
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    }, []);

    // 1단계: 캠페인 전환 시 0부터 카운트업
    useEffect(() => {
        targetRef.current = target;
        currentRef.current = 0;
        animateTo(target, duration);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration, animateTo]);

    // 2단계: 2.5초마다 미세 상승 (절대 내려가지 않음)
    useEffect(() => {
        const interval = setInterval(() => {
            // 왜(Why): 조회수/전환/인게이지먼트는 현실적으로 감소하지 않으므로 양수만 추가
            const bump = Math.floor(Math.random() * targetRef.current * 0.003) + 1;
            const newVal = currentRef.current + bump;
            animateTo(newVal, 600); // 0.6초간 부드럽게 상승
        }, 2500);
        return () => clearInterval(interval);
    }, [target, animateTo]);

    return displayValue;
};

// 차트 데이터에 주기적 미세 변동을 넣어 "실시간" 느낌을 줍니다.
const useAnimatedChartData = (baseData: { day: string; views: number; conversion: number }[]) => {
    const [data, setData] = useState(baseData);
    useEffect(() => {
        setData(baseData); // 캠페인/기간 변경 시 즉시 반영
    }, [baseData]);
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => prev.map(d => ({
                ...d,
                // 왜(Why): 조회수와 전환수는 현실적으로 감소하지 않으므로 양수만 추가
                views: d.views + Math.floor(Math.random() * d.views * 0.005) + 1,
                conversion: d.conversion + Math.floor(Math.random() * d.conversion * 0.006) + 1,
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return data;
};

// 왜(Why): 여러 캠페인의 Mock 데이터를 준비하여, 사용자가 드롭다운으로 캠페인을 전환할 수 있게 합니다.
// 추후 Supabase의 user_orders + analytics 테이블과 연동하면 이 데이터를 대체합니다.
type DateRange = '7d' | '14d' | '30d';

interface CampaignData {
    id: string;
    name: string;
    stats: { views: number; conversion: number; engagement: number; viewsGrowth: string; convGrowth: string; engGrowth: string };
    daily: Record<DateRange, { day: string; views: number; conversion: number }[]>;
}

const CAMPAIGNS: CampaignData[] = [
    {
        id: 'camp-a',
        name: '2026 봄 시즌 통합 캠페인',
        stats: { views: 1520300, conversion: 32504, engagement: 105420, viewsGrowth: '345%', convGrowth: '120%', engGrowth: '89%' },
        daily: {
            '7d': [
                { day: '1일차', views: 12000, conversion: 200 },
                { day: '2일차', views: 35000, conversion: 600 },
                { day: '3일차', views: 89000, conversion: 1500 },
                { day: '4일차', views: 150000, conversion: 3200 },
                { day: '5일차', views: 280000, conversion: 5800 },
                { day: '6일차', views: 420000, conversion: 8900 },
                { day: '7일차', views: 650000, conversion: 12500 },
            ],
            '14d': [
                { day: '1일', views: 5000, conversion: 80 }, { day: '2일', views: 12000, conversion: 200 },
                { day: '3일', views: 22000, conversion: 400 }, { day: '4일', views: 35000, conversion: 600 },
                { day: '5일', views: 55000, conversion: 950 }, { day: '6일', views: 89000, conversion: 1500 },
                { day: '7일', views: 120000, conversion: 2100 }, { day: '8일', views: 150000, conversion: 3200 },
                { day: '9일', views: 195000, conversion: 4000 }, { day: '10일', views: 280000, conversion: 5800 },
                { day: '11일', views: 350000, conversion: 7200 }, { day: '12일', views: 420000, conversion: 8900 },
                { day: '13일', views: 540000, conversion: 10800 }, { day: '14일', views: 650000, conversion: 12500 },
            ],
            '30d': [
                { day: '1주', views: 89000, conversion: 1500 }, { day: '2주', views: 280000, conversion: 5800 },
                { day: '3주', views: 650000, conversion: 12500 }, { day: '4주', views: 1520300, conversion: 32504 },
            ],
        },
    },
    {
        id: 'camp-b',
        name: 'Q1 SNS 퍼포먼스 마케팅',
        stats: { views: 820000, conversion: 18200, engagement: 64300, viewsGrowth: '210%', convGrowth: '95%', engGrowth: '67%' },
        daily: {
            '7d': [
                { day: '1일차', views: 8000, conversion: 120 },
                { day: '2일차', views: 25000, conversion: 380 },
                { day: '3일차', views: 60000, conversion: 900 },
                { day: '4일차', views: 110000, conversion: 2100 },
                { day: '5일차', views: 200000, conversion: 4500 },
                { day: '6일차', views: 380000, conversion: 8200 },
                { day: '7일차', views: 520000, conversion: 11000 },
            ],
            '14d': [
                { day: '1일', views: 3000, conversion: 50 }, { day: '2일', views: 8000, conversion: 120 },
                { day: '3일', views: 18000, conversion: 280 }, { day: '4일', views: 25000, conversion: 380 },
                { day: '5일', views: 40000, conversion: 600 }, { day: '6일', views: 60000, conversion: 900 },
                { day: '7일', views: 85000, conversion: 1400 }, { day: '8일', views: 110000, conversion: 2100 },
                { day: '9일', views: 150000, conversion: 3200 }, { day: '10일', views: 200000, conversion: 4500 },
                { day: '11일', views: 280000, conversion: 6000 }, { day: '12일', views: 380000, conversion: 8200 },
                { day: '13일', views: 450000, conversion: 9600 }, { day: '14일', views: 520000, conversion: 11000 },
            ],
            '30d': [
                { day: '1주', views: 60000, conversion: 900 }, { day: '2주', views: 200000, conversion: 4500 },
                { day: '3주', views: 520000, conversion: 11000 }, { day: '4주', views: 820000, conversion: 18200 },
            ],
        },
    },
];

const DATE_RANGE_LABELS: Record<DateRange, string> = { '7d': '최근 7일', '14d': '최근 14일', '30d': '최근 30일' };

export const Dashboard: React.FC = () => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [selectedCampaign, setSelectedCampaign] = useState(CAMPAIGNS[0].id);
    const [dateRange, setDateRange] = useState<DateRange>('7d');

    const campaign = useMemo(() => CAMPAIGNS.find(c => c.id === selectedCampaign)!, [selectedCampaign]);
    const baseChartData = useMemo(() => campaign.daily[dateRange], [campaign, dateRange]);
    // 왜(Why): 차트 데이터에 3초마다 미세 변동을 넣어 "실시간 모니터링" 느낌을 줍니다.
    const chartData = useAnimatedChartData(baseChartData);
    // 왜(Why): 정적 숫자 대신 카운트업 + 주기적 미세 변동으로 캠페인 전환 시 역동적 효과
    const animViews = useLiveStat(campaign.stats.views);
    const animConv = useLiveStat(campaign.stats.conversion);
    const animEng = useLiveStat(campaign.stats.engagement);

    const formatNumber = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

    const handleGenerateReport = () => {
        if (!reportRef.current) return;
        const opt = {
            margin: 10,
            filename: `캐칭_성과_리포트_${campaign.name}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
        };
        html2pdf().from(reportRef.current).set(opt).save();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 pt-28 pb-24 relative z-10 overflow-hidden">
            {/* Background Effects (Light) */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-50/60 via-white to-transparent -z-10"></div>
            <div className="absolute -top-[300px] -right-[300px] w-[700px] h-[700px] bg-blue-100/40 rounded-full blur-[120px] opacity-50 -z-10"></div>
            <div className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px] opacity-50 -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 pb-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">실시간 캠페인 대시보드</h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">현재 진행 중인 마케팅 모듈의 퍼포먼스를 한눈에 트래킹하세요.</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        className="w-full sm:w-auto bg-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:bg-slate-700 active:scale-[0.98]"
                    >
                        <Download className="w-5 h-5 text-emerald-400" /> Recap Report 발급
                    </button>
                </motion.div>

                {/* Filters: Campaign Selector + Date Range */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col sm:flex-row gap-3 mb-8"
                >
                    {/* Campaign Selector */}
                    <div className="relative flex-1">
                        <BarChart3 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm appearance-none cursor-pointer relative z-0"
                        >
                            {CAMPAIGNS.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    </div>

                    {/* Date Range Picker */}
                    <div className="flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        {(['7d', '14d', '30d'] as DateRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold transition-all border-r border-slate-100 last:border-r-0 ${dateRange === range
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                                {DATE_RANGE_LABELS[range]}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div ref={reportRef} className="space-y-8">
                    {/* Top Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-5 group">
                            <div className="bg-blue-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <PlaySquare className="w-7 h-7 text-blue-500" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-500 mb-1 leading-tight flex items-center gap-2">
                                    총 누적 조회수 (틱톡/릴스) <Zap className="w-3 h-3 text-amber-500" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 tracking-tight">{formatNumber(animViews)}<span className="text-sm text-slate-400 font-medium ml-1">회</span></div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> {campaign.stats.viewsGrowth} (목표 대비)
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-5 group">
                            <div className="bg-purple-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <ArrowDownToLine className="w-7 h-7 text-purple-500" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-500 mb-1 leading-tight">앱 다운로드 전환 (O2O 포함)</div>
                                <div className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 tracking-tight">{formatNumber(animConv)}<span className="text-sm text-slate-400 font-medium ml-1">건</span></div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> {campaign.stats.convGrowth} (목표 대비)
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-5 group">
                            <div className="bg-pink-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7 text-pink-500" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-500 mb-1 leading-tight">바이럴 인게이지먼트 (댓글/공유)</div>
                                <div className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 tracking-tight">{formatNumber(animEng)}<span className="text-sm text-slate-400 font-medium ml-1">건</span></div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> {campaign.stats.engGrowth} (산업군 주 평균 대비)
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Charts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg text-slate-800 mb-8 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> 콘텐츠 바이럴 추이
                            </h3>
                            <div className="h-64 sm:h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `${value / 10000}만`} dx={-10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                            itemStyle={{ color: '#3b82f6' }}
                                        />
                                        <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg text-slate-800 mb-8 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span> 전환 액션 (앱 다운로드/가입)
                            </h3>
                            <div className="h-64 sm:h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                            itemStyle={{ color: '#a855f7' }}
                                        />
                                        <Line type="monotone" dataKey="conversion" stroke="#a855f7" strokeWidth={3} dot={{ r: 5, fill: '#fff', strokeWidth: 2, stroke: '#a855f7' }} activeDot={{ r: 8, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
