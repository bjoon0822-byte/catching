import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useProjectStore } from '../../store/useProjectStore';
import type { Project, ProjectModule } from '../../store/useProjectStore';
import { MOCK_MODULES } from '../../data/modules';
import {
    FolderOpen, Plus, Trash2, ChevronRight, Edit3, Package,
    Clock, CheckCircle2, CreditCard, User, Mail, LogOut,
    X, Minus, ShoppingBag
} from 'lucide-react';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);

// 왜(Why): 마이페이지는 프로필 + 프로젝트 관리를 하나의 화면에서 제공합니다.
// 프로젝트는 챗봇에서 자동 생성되며, 여기서 모듈을 커스터마이징하고 결제합니다.

// 프로젝트 상세/편집 모달
const ProjectDetailModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdate: (projectId: string, modules: ProjectModule[]) => void;
    onPayment: (project: Project) => void;
}> = ({ project, onClose, onUpdate, onPayment }) => {
    const [modules, setModules] = useState<ProjectModule[]>(project.modules);

    const totalAmount = useMemo(() => modules.reduce((sum, m) => sum + m.basePrice * m.quantity, 0), [modules]);

    const handleQuantityChange = (moduleId: string, delta: number) => {
        setModules(prev => prev.map(m => {
            if (m.id === moduleId) {
                const newQty = Math.max(1, m.quantity + delta);
                return { ...m, quantity: newQty };
            }
            return m;
        }).filter(m => m.quantity > 0));
    };

    const handleRemoveModule = (moduleId: string) => {
        setModules(prev => prev.filter(m => m.id !== moduleId));
    };

    const handleAddModule = (module: typeof MOCK_MODULES[0]) => {
        if (modules.some(m => m.id === module.id)) return;
        setModules(prev => [...prev, { id: module.id, title: module.title, category: module.category, basePrice: module.basePrice, quantity: 1 }]);
    };

    const handleSave = () => {
        onUpdate(project.id, modules);
        onClose();
    };

    const statusConfig: Record<string, { label: string; color: string }> = {
        draft: { label: '초안', color: 'bg-amber-100 text-amber-700' },
        active: { label: '진행중', color: 'bg-blue-100 text-blue-700' },
        paid: { label: '결제완료', color: 'bg-emerald-100 text-emerald-700' },
        completed: { label: '완료', color: 'bg-slate-100 text-slate-600' },
    };

    const status = statusConfig[project.status] || statusConfig.draft;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h2>
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${status.color}`}>{status.label}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{project.ai_summary || project.description}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Modules List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-3">선택된 모듈 ({modules.length}개)</h3>
                    {modules.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <div className="flex-1 min-w-0">
                                <span className="font-bold text-slate-800 text-sm truncate block">{m.title}</span>
                                <span className="text-xs text-slate-400 uppercase">{m.category}</span>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200">
                                    <button onClick={() => handleQuantityChange(m.id, -1)} className="p-1.5 hover:bg-slate-50 rounded-l-lg transition-colors">
                                        <Minus className="w-3 h-3 text-slate-500" />
                                    </button>
                                    <span className="px-3 text-sm font-black text-slate-800 min-w-[2rem] text-center">{m.quantity}</span>
                                    <button onClick={() => handleQuantityChange(m.id, 1)} className="p-1.5 hover:bg-slate-50 rounded-r-lg transition-colors">
                                        <Plus className="w-3 h-3 text-slate-500" />
                                    </button>
                                </div>
                                <span className="text-sm font-black text-slate-800 min-w-[100px] text-right">
                                    {formatPrice(m.basePrice * m.quantity)}
                                </span>
                                <button onClick={() => handleRemoveModule(m.id)} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Module */}
                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> 모듈 추가하기
                        </summary>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {MOCK_MODULES.filter(m => !modules.some(pm => pm.id === m.id)).map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => handleAddModule(m)}
                                    className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:shadow-sm transition-all"
                                >
                                    <div className="text-sm font-bold text-slate-700 truncate">{m.title}</div>
                                    <div className="text-xs text-slate-400 mt-1">{formatPrice(m.basePrice)}</div>
                                </button>
                            ))}
                        </div>
                    </details>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-slate-500">총 견적 금액</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" /> 변경사항 저장
                        </button>
                        <button
                            onClick={() => onPayment({ ...project, modules, total_amount: totalAmount })}
                            className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                            <CreditCard className="w-4 h-4" /> 결제 진행
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const MyPage: React.FC = () => {
    const { user, signOut } = useAuthStore();
    const { projects, isLoading, fetchProjects, deleteProject, updateProjectModules, selectProject, selectedProject } = useProjectStore();

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);

    const handlePayment = (project: Project) => {
        // 왜(Why): 프로젝트 기반 결제는 기존 CheckoutFlow를 재활용합니다.
        // 프로젝트 모듈을 장바구니에 넣고 결제 화면으로 전환합니다.
        window.dispatchEvent(new CustomEvent('project-checkout', { detail: project }));
        selectProject(null);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-white pt-28 pb-24 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-800 mb-2">로그인이 필요합니다</h2>
                    <p className="text-slate-500">마이페이지를 이용하려면 Google 계정으로 로그인해 주세요.</p>
                </div>
            </div>
        );
    }

    const statusCounts = {
        draft: projects.filter(p => p.status === 'draft').length,
        active: projects.filter(p => p.status === 'active').length,
        paid: projects.filter(p => p.status === 'paid').length,
        total: projects.length,
    };

    return (
        <div className="min-h-screen bg-white pt-28 pb-24 relative z-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] p-8 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/20">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                            {user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'}
                        </h2>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Mail className="w-4 h-4" /> {user.email}
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> 로그아웃
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                >
                    {[
                        { label: '전체 프로젝트', value: statusCounts.total, icon: <FolderOpen className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                        { label: '초안', value: statusCounts.draft, icon: <Edit3 className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                        { label: '진행 중', value: statusCounts.active, icon: <Clock className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
                        { label: '결제 완료', value: statusCounts.paid, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${stat.color} flex items-center gap-4`}>
                            {stat.icon}
                            <div>
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-[11px] font-bold opacity-70">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Project List */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" /> 내 프로젝트
                        </h3>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <FolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-slate-700 mb-2">아직 프로젝트가 없습니다</h3>
                            <p className="text-slate-500 text-sm mb-6">AI 챗봇과 상담하면 맞춤형 프로젝트가 자동으로 생성됩니다!</p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'shop' }))}
                                className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" /> AI 상담 시작하기
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project, i) => {
                                const statusBadge: Record<string, { label: string; cls: string }> = {
                                    draft: { label: '초안', cls: 'bg-amber-100 text-amber-700' },
                                    active: { label: '진행중', cls: 'bg-blue-100 text-blue-700' },
                                    paid: { label: '결제완료', cls: 'bg-emerald-100 text-emerald-700' },
                                    completed: { label: '완료', cls: 'bg-slate-100 text-slate-600' },
                                };
                                const badge = statusBadge[project.status] || statusBadge.draft;
                                return (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => selectProject(project)}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.08)] transition-all p-6 cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-black text-slate-800 tracking-tight truncate">{project.title}</h4>
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${badge.cls} shrink-0`}>{badge.label}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 line-clamp-1 mb-3">{project.ai_summary || project.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                                    <span>{project.modules?.length || 0}개 모듈</span>
                                                    <span>·</span>
                                                    <span>{formatPrice(project.total_amount)}</span>
                                                    <span>·</span>
                                                    <span>{new Date(project.created_at).toLocaleDateString('ko-KR')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Project Detail Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectDetailModal
                        project={selectedProject}
                        onClose={() => selectProject(null)}
                        onUpdate={updateProjectModules}
                        onPayment={handlePayment}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
