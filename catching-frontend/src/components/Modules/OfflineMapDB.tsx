import React, { useState } from 'react';
import { MapPin, Navigation, Camera, Store } from 'lucide-react';

export const OfflineMapDB: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState('서울');

    const regions = ['서울', '경기/인천', '충청/강원', '전라/광주', '경상/부산', '제주'];

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 p-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                            <Camera className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            인생네컷 전국 망 커스텀 타겟팅
                        </h3>
                        <p className="text-sm text-slate-400">원하는 지역의 키오스크 화면과 앱 메인에 독점 광고를 라이브하세요.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {regions.map(region => (
                            <button
                                key={region}
                                onClick={() => setSelectedRegion(region)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedRegion === region
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 border border-purple-500/30 bg-purple-900/20 rounded-xl flex items-start gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-purple-500/20">
                                <Store className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm tracking-tight">{selectedRegion} 핵심 상권 집중 패키지</h4>
                                <p className="text-xs text-slate-400 mt-1 mb-2">주말 유동인구 10만 이상 A급 매장 50곳 동시 송출</p>
                                <div className="flex items-center gap-4 text-xs font-bold text-purple-300">
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> 매장 50개</span>
                                    <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /> 노출 보장 500만 뷰</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-white/10 bg-white/5 rounded-xl flex items-start gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/10">
                                <Store className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-300 text-sm tracking-tight">{selectedRegion} 대학가 스팟 패키지</h4>
                                <p className="text-xs text-slate-500 mt-1">1020 학생 타겟팅 특화 매장 집중</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 bg-slate-900/50 rounded-xl relative overflow-hidden min-h-[300px] flex items-center justify-center border border-white/10 shadow-inner">
                    {/* Mock Map View */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-slate-900/80 mix-blend-multiply pointer-events-none"></div>
                    <div className="relative z-10 text-center">
                        <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-bounce drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                        <div className="font-black text-2xl text-white tracking-tight drop-shadow-md">{selectedRegion}</div>
                        <div className="text-sm font-medium text-slate-400 mt-1">선택된 지역의 매장 데이터를 불러오는 중...</div>
                    </div>

                    {/* Fake map pins */}
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
                    <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)]" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)]" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>
        </div>
    );
};
