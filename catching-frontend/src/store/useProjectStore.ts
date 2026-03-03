import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

// 왜(Why): 프로젝트 시스템의 핵심 상태를 관리합니다.
// 챗봇에서 AI 추천 → 프로젝트 자동 생성 → 모듈 커스터마이징 → 결제 플로우를 연결합니다.

export interface ProjectModule {
    id: string;
    title: string;
    category: string;
    basePrice: number;
    quantity: number;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'paid' | 'completed';
    modules: ProjectModule[];
    ai_summary: string;
    total_amount: number;
    created_at: string;
}

interface ProjectState {
    projects: Project[];
    selectedProject: Project | null;
    isLoading: boolean;
    fetchProjects: () => Promise<void>;
    createProject: (title: string, description: string, modules: ProjectModule[], aiSummary: string) => Promise<Project | null>;
    updateProjectModules: (projectId: string, modules: ProjectModule[]) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    selectProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    selectedProject: null,
    isLoading: false,

    fetchProjects: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('user_projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (!error && data) {
                set({ projects: data as Project[] });
            }
        } catch (e) {
            console.error('프로젝트 조회 실패:', e);
        } finally {
            set({ isLoading: false });
        }
    },

    createProject: async (title, description, modules, aiSummary) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('로그인이 필요합니다.');

        const totalAmount = modules.reduce((sum, m) => sum + m.basePrice * m.quantity, 0);
        const newProject = {
            user_id: user.id,
            title,
            description,
            status: 'draft',
            modules,
            ai_summary: aiSummary,
            total_amount: totalAmount,
        };

        const { data, error } = await supabase
            .from('user_projects')
            .insert(newProject)
            .select()
            .single();

        if (error) {
            console.error('Supabase 프로젝트 생성 에러:', error.message, error.details, error.hint);
            throw new Error(error.message);
        }
        if (data) {
            const project = data as Project;
            set((state) => ({ projects: [project, ...state.projects] }));
            return project;
        }
        return null;
    },

    updateProjectModules: async (projectId, modules) => {
        const totalAmount = modules.reduce((sum, m) => sum + m.basePrice * m.quantity, 0);
        try {
            await supabase
                .from('user_projects')
                .update({ modules, total_amount: totalAmount })
                .eq('id', projectId);

            set((state) => ({
                projects: state.projects.map(p =>
                    p.id === projectId ? { ...p, modules, total_amount: totalAmount } : p
                ),
                selectedProject: state.selectedProject?.id === projectId
                    ? { ...state.selectedProject, modules, total_amount: totalAmount }
                    : state.selectedProject,
            }));
        } catch (e) {
            console.error('프로젝트 모듈 업데이트 실패:', e);
        }
    },

    deleteProject: async (projectId) => {
        try {
            await supabase.from('user_projects').delete().eq('id', projectId);
            set((state) => ({
                projects: state.projects.filter(p => p.id !== projectId),
                selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject,
            }));
        } catch (e) {
            console.error('프로젝트 삭제 실패:', e);
        }
    },

    selectProject: (project) => set({ selectedProject: project }),
}));
