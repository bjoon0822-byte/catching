import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, ShoppingCart, Calendar, Clock, CheckCircle2, AlertCircle, Search, Filter, ChevronDown, Eye, ArrowRight, Sparkles } from 'lucide-react';

// 왜(Why): DB 구축 이전 MVP 단계이므로, 실제 주문 데이터 대신 Mock 데이터로 UI 프로토타입을 먼저 구성합니다.
// 추후 Supabase의 user_orders 테이블과 연동하면 이 데이터를 대체합니다.
type ReportStatus = 'paid' | 'pending' | 'consulting' | 'completed';

interface MockReport {
    id: string;
    quoteNumber: string;
    title: string;
    description: string;
    totalAmount: number;
    status: ReportStatus;
    createdAt: string;
    modules: string[];
    discountRate: number;
}

const MOCK_REPORTS: MockReport[] = [
    {
        id: '1',
        quoteNumber: 'EST-482910',
        title: '2026 봄 시즌 통합 마케팅 캠페인',
        description: '틱톡 숏폼 + 인스타그램 브랜딩 + 인생네컷 오프라인 광고를 결합한 멀티채널 캠페인 견적',
        totalAmount: 28500000,
        status: 'completed',
        createdAt: '2026-01-15',
        modules: ['틱톡 바이럴 마케팅', '인스타그램 스포트라이트', '인생네컷 스팟 광고'],
        discountRate: 15,
    },
    {
        id: '2',
        quoteNumber: 'EST-519204',
        title: 'Q1 SNS 퍼포먼스 마케팅 패키지',
        description: '인스타그램 퍼포먼스 팩 + 메타 풀케어 관리를 통한 SNS 전방위 마케팅 전략',
        totalAmount: 5000000,
        status: 'paid',
        createdAt: '2026-02-03',
        modules: ['인스타그램 퍼포먼스 팩', '메타(IG/FB) 풀케어 관리'],
        discountRate: 5,
    },
    {
        id: '3',
        quoteNumber: 'EST-627381',
        title: '신제품 런칭 프레스 & PR 파이프라인',
        description: '미디어 기사 송출 + 바이럴 챌린지를 통한 인지도 극대화 런칭 전략 제안',
        totalAmount: 45000000,
        status: 'consulting',
        createdAt: '2026-02-18',
        modules: ['미디어 프레스 패키지', '바이럴 챌린지 캠페인', '브랜드 커스텀 프레임'],
        discountRate: 15,
    },
    {
        id: '4',
        quoteNumber: 'EST-738492',
        title: '글로벌 진출 동남아 마케팅 플랜',
        description: '동남아 주요 5개국 대상 틱톡 크리에이터 매칭 + 현지 인플루언서 활용 캠페인',
        totalAmount: 120000000,
        status: 'pending',
        createdAt: '2026-02-25',
        modules: ['글로벌 틱톡 캠페인', '현지 인플루언서 매칭', 'KOL 매니지먼트'],
        discountRate: 15,
    },
];

// 상태 뱃지 컴포넌트
const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
    const config = {
        paid: { label: '결제 완료', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
        pending: { label: '결제 대기', icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
        consulting: { label: '상담 진행', icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
        completed: { label: '캠페인 완료', icon: CheckCircle2, bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
    };
    const { label, icon: Icon, bg, text, border } = config[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${bg} ${text} border ${border}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

export const ReportArchive: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);

    const filteredReports = MOCK_REPORTS.filter((r) => {
        const matchesSearch =
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">리포트 보관함</h1>
                            <p className="text-slate-500 font-medium text-sm">과거 마케팅 제안 및 견적 이력을 한눈에 관리하세요.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: '전체 제안', value: MOCK_REPORTS.length, color: 'text-slate-800', bg: 'bg-white' },
                        { label: '진행 중', value: MOCK_REPORTS.filter(r => r.status === 'paid' || r.status === 'consulting').length, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: '결제 대기', value: MOCK_REPORTS.filter(r => r.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: '총 거래액', value: formatPrice(MOCK_REPORTS.reduce((sum, r) => sum + r.totalAmount, 0)), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-slate-100 shadow-sm`}>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</div>
                            <div className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col sm:flex-row gap-3 mb-8"
                >
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="제안명 또는 견적 번호로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3.5 shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | ReportStatus)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 py-3 pl-2 pr-6 focus:outline-none cursor-pointer appearance-none"
                        >
                            <option value="all">전체 상태</option>
                            <option value="paid">결제 완료</option>
                            <option value="pending">결제 대기</option>
                            <option value="consulting">상담 진행</option>
                            <option value="completed">캠페인 완료</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                </motion.div>

                {/* Report Cards List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredReports.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl shadow-lg"
                            >
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">검색 결과가 없습니다</h3>
                                <p className="text-slate-500">필터 조건을 변경하거나 다른 키워드로 검색해 보세요.</p>
                            </motion.div>
                        ) : (
                            filteredReports.map((report, index) => (
                                <motion.div
                                    key={report.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 25 }}
                                    className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group"
                                >
                                    {/* Card Main Row */}
                                    <div
                                        className="p-6 sm:p-8 cursor-pointer"
                                        onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Left: Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <StatusBadge status={report.status} />
                                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{report.quoteNumber}</span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {report.createdAt}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight mb-1 truncate group-hover:text-primary transition-colors">{report.title}</h3>
                                                <p className="text-slate-500 text-sm font-medium line-clamp-1">{report.description}</p>
                                            </div>

                                            {/* Right: Amount + Actions */}
                                            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-slate-400 mb-0.5">총 견적액</div>
                                                    <div className="text-2xl font-black text-slate-900 tracking-tight">{formatPrice(report.totalAmount)}</div>
                                                    {report.discountRate > 0 && (
                                                        <div className="text-xs font-bold text-red-400 flex items-center gap-1 justify-end">
                                                            <Sparkles className="w-3 h-3" />
                                                            AI 할인 {report.discountRate}% 적용
                                                        </div>
                                                    )}
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: expandedId === report.id ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shrink-0"
                                                >
                                                    <ChevronDown className="w-5 h-5" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    <AnimatePresence>
                                        {expandedId === report.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                                                    <div className="border-t border-slate-100 pt-6">
                                                        {/* Included Modules */}
                                                        <div className="mb-6">
                                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">포함 모듈</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {report.modules.map((mod, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-3.5 py-2 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm"
                                                                    >
                                                                        {mod}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">
                                                                <Eye className="w-4 h-4" />
                                                                견적서 상세보기
                                                            </button>
                                                            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]">
                                                                <Download className="w-4 h-4" />
                                                                PDF 다운로드
                                                            </button>
                                                            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all shadow-sm active:scale-[0.98]">
                                                                <ShoppingCart className="w-4 h-4" />
                                                                다시 장바구니에 담기
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl px-6 py-4 shadow-sm">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-bold text-slate-600">새로운 마케팅 전략이 필요하신가요?</span>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-full text-xs font-black hover:bg-blue-600 transition-all shadow-md">
                            AI 진단 시작 <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
