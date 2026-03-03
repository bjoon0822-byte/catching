import React, { useState } from 'react';
import { Search, Star, Play, TrendingUp } from 'lucide-react';

interface Creator {
    id: string;
    name: string;
    handle: string;
    followers: number;
    category: string;
    engagement: number;
    imageUrl: string;
}

const MOCK_CREATORS: Creator[] = [
    { id: 'c1', name: '김댄스', handle: '@kim_dance_official', followers: 2500000, category: '댄스/챌린지', engagement: 12.5, imageUrl: 'https://i.pravatar.cc/150?u=c1' },
    { id: 'c2', name: '푸드킬러', handle: '@food_killer', followers: 1800000, category: '먹방/리뷰', engagement: 15.2, imageUrl: 'https://i.pravatar.cc/150?u=c2' },
    { id: 'c3', name: '뷰티여신', handle: '@beauty_goddess', followers: 3200000, category: '뷰티/패션', engagement: 9.8, imageUrl: 'https://i.pravatar.cc/150?u=c3' },
    { id: 'c4', name: '코믹스케치', handle: '@comic_sketch', followers: 5100000, category: '코미디/상황극', engagement: 18.1, imageUrl: 'https://i.pravatar.cc/150?u=c4' },
];

export const TiktokCreatorDB: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '만';
        }
        return new Intl.NumberFormat('ko-KR').format(num);
    };

    const filteredCreators = MOCK_CREATORS.filter(c =>
        c.name.includes(searchTerm) || c.category.includes(searchTerm)
    );

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                        틱톡 크리에이터 매칭 DB
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">캐칭 독점 300+ 메가 인플루언서 실시간 데이터</p>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="카테고리 또는 이름 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 w-64 placeholder-slate-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-400 uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">크리에이터</th>
                            <th className="px-4 py-3">카테고리</th>
                            <th className="px-4 py-3">팔로워</th>
                            <th className="px-4 py-3 text-center">반응률(ER)</th>
                            <th className="px-4 py-3 rounded-tr-lg">액션</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredCreators.map((creator) => (
                            <tr key={creator.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={creator.imageUrl} alt={creator.name} className="w-10 h-10 rounded-full border border-white/20 shadow-sm" />
                                        <div>
                                            <div className="font-bold text-white tracking-tight">{creator.name}</div>
                                            <div className="text-xs text-slate-400">{creator.handle}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-slate-300 rounded-full text-xs font-medium border border-white/5">
                                        {creator.category}
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-black text-white tracking-tight">
                                    {formatNumber(creator.followers)}명
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        {creator.engagement}%
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <button className="text-sm px-3 py-1.5 bg-white/10 text-white font-bold rounded-md hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all flex items-center gap-1.5 border border-white/10">
                                        <Play className="w-3.5 h-3.5 fill-current" /> 리포트 보기
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
