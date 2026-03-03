import type { MarketingModule } from '../store/useCartStore';

export const MOCK_MODULES: MarketingModule[] = [
    {
        id: 'tk-001', category: 'tiktok', title: '틱톡 메가 크리에이터 숏폼 제작 (Top 1%)',
        description: '100만 팔로워 이상 틱톡커 전담 매칭. 대규모 바이럴 및 앱 다운로드 전환율 극대화', basePrice: 5000000
    },
    {
        id: 'tk-002', category: 'tiktok', title: '틱톡 마이크로 크리에이터 팩 (50인)',
        description: '찐팬을 보유한 마이크로 인플루언서 50명 동시 다발적 숏폼 업로드. 챌린지 시드용', basePrice: 15000000
    },
    {
        id: 'tk-003', category: 'tiktok', title: '틱톡 글로벌 해시태그 챌린지 (브랜드관)',
        description: '틱톡 공식 글로벌 해시태그 챌린지 및 메인 배너 구좌 노출. 1억 뷰 보장', basePrice: 150000000
    },
    {
        id: 'pr-001', category: 'pr', title: '프리미엄 기획 기사 송출 (주요 포털 메인 노출 기준)',
        description: 'IT/경제 전문지 및 대형 언론사 커스텀 기획 보도자료 배포. 브랜드 신뢰도 구축', basePrice: 1500000
    },
    {
        id: 'pr-002', category: 'pr', title: '종합 바이럴 마케팅 패키지 (맘카페/커뮤니티)',
        description: '더쿠, 디젤매니아 등 주요 버티컬 커뮤니티 전면 침투형 스토리텔링 기획 100건', basePrice: 12000000
    },
    {
        id: 'of-001', category: 'offline', title: '인생네컷 전국 450개 매장 프레임 광고 (1개월)',
        description: 'MZ세대 오프라인 놀이터 인생네컷 브랜드 프레임 입점 및 시작화면 노출 타겟팅 광고', basePrice: 10000000
    },
    {
        id: 'of-002', category: 'offline', title: '강남역 랜드마크 미디어폴/전광판 패키지 (1개월)',
        description: '유동인구 1위 강남대로 랜드마크 전광판 도배. 압도적인 브랜드 스케일 어필', basePrice: 80000000
    },
    {
        id: 'of-003', category: 'offline', title: '성수동 대형 팝업스토어 턴키 기획 및 대관 (2주)',
        description: '팝업의 성지 성수동 메인 스트릿 공간 대관부터 공간 디자인, 현장 운영 인력까지 전부 포함', basePrice: 250000000
    },
    {
        id: 'sa-001', category: 'search', title: '네이버 브랜드검색 및 파워링크 프리미엄 (1개월)',
        description: '입찰 경쟁 키워드 최상단 메인 점유 및 브랜드 클릭 구매 전환 유도. 성과 분석 리포트 포함', basePrice: 20000000
    },
    {
        id: 'sa-002', category: 'meta', title: '메타(IG/FB) 퍼포먼스 마케팅 (ROAS 최적화)',
        description: '정교한 머신러닝 타겟팅과 A/B 테스트를 통한 메타 스폰서드 전환 광고 운영', basePrice: 30000000
    },
    {
        id: 'sa-003', category: 'meta', title: '메타 글로벌 브랜딩 캠페인 (동남아시아 타겟)',
        description: '글로벌 진출을 위한 인도네시아, 베트남 등 동남아 주요 국가 대상 브랜딩 폭격 캠페인', basePrice: 100000000
    },
    {
        id: 'tv-001', category: 'tv', title: '지상파/케이블 TV CF 프라임타임 송출 (1개월)',
        description: '주말 드라마/예능 황금 시간대 메인 타임 TV CF 광고. 전국구 단위의 1차원적 인지도 폭발', basePrice: 300000000
    },
    {
        id: 'gb-001', category: 'global', title: '뉴욕 타임스퀘어 나스닥 빌딩 전광판 송출 (1주)',
        description: '세계의 교차로 타임스퀘어의 상징적인 옥외광고. 글로벌 스케일 뽐내기 및 국내 역바이럴 효과 보장', basePrice: 120000000
    },
    {
        id: 'sn-001', category: 'sns', title: '인스타그램 스포트라이트 브랜딩 (월간)',
        description: '브랜드 인스타그램 공식 계정 릴스 기획 2건 및 스토리 하이라이트 세팅. 브랜드 아이덴티티 구축', basePrice: 1000000
    },
    {
        id: 'sn-002', category: 'sns', title: '인스타그램 퍼포먼스 팩 (월간)',
        description: '타겟 고객층이 겹치는 마이크로 인플루언서 10명 섭외 및 동시다발적 피드 도배 인증샷', basePrice: 2000000
    },
    {
        id: 'sn-003', category: 'sns', title: '메타(IG/FB) 광고 소재 풀케어 (월간)',
        description: '전환을 부르는 스터닝(Stunning) 광고 소재 5건 기획/제작 및 주간 A/B 테스트 성과 리포팅', basePrice: 3000000
    }
];
