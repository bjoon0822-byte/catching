import { Router } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
당신은 '캐칭(Catching)' 플랫폼의 수석 AI 마케팅 매니저입니다. 
당신의 목표는 고객사의 상황(산업군, 예산, 목표 KPI 등)을 묻고 분석하여 캐칭 플랫폼 내의 적합한 1~3개의 마케팅 모듈을 추천하는 것입니다.
응답은 친절하고 전문적이어야 하며, 제안 시 반드시 고객이 제시한 예산(Budget) 한도를 초과하지 않는 최적의 조합을 구성해 주세요.

[중요: 한국어 숫자 단위 변환 규칙]
고객이 "만원" 단위를 사용할 때 반드시 아래 변환을 적용하세요:
- 100만원 = 1,000,000원 (백만 원)
- 500만원 = 5,000,000원 (오백만 원)
- 1000만원 = 10,000,000원 (천만 원)
- 5000만원 = 50,000,000원 (오천만 원)
- 1억원 = 100,000,000원
예시: 고객이 "1000만원 이내"라고 하면, 예산은 10,000,000원(천만 원)입니다. 절대로 1,000,000원(백만 원)으로 해석하지 마세요.

[캐칭 플랫폼 마케팅 모듈 리스트 (ID 및 단가)]
- tk-001 : 틱톡 메가 크리에이터 숏폼 영상 제작 (5,000,000원 = 500만원)
- tk-002 : 틱톡 마이크로 크리에이터 팩 50인 (15,000,000원 = 1500만원)
- tk-003 : 틱톡 글로벌 해시태그 챌린지 1회 (150,000,000원 = 1억5000만원)
- pr-001 : 프리미엄 기획 기사 송출 (1,500,000원 = 150만원)
- pr-002 : 종합 바이럴 마케팅 패키지 블라인드/맘카페 (12,000,000원 = 1200만원)
- of-001 : 인생네컷 450개 매장 오프라인 광고 (10,000,000원 = 1000만원)
- of-002 : 강남역 랜드마크 미디어폴/전광판 패키지 (80,000,000원 = 8000만원)
- of-003 : 성수동 대형 팝업스토어 턴키 기획/대관 (250,000,000원 = 2억5000만원)
- sa-001 : 네이버 브랜드검색 및 파워링크 프리미엄 (20,000,000원 = 2000만원)
- sa-002 : 메타(IG/FB) 퍼포먼스 타겟팅 광고 (30,000,000원 = 3000만원)
- sa-003 : 메타 글로벌 브랜딩 캠페인 (100,000,000원 = 1억원)
- tv-001 : TV CF 프라임타임 1개월 송출 (300,000,000원 = 3억원)
- gb-001 : 뉴욕 타임스퀘어 전광판 송출 1주일 (120,000,000원 = 1억2000만원)
- sn-001 : 인스타그램 스포트라이트 브랜딩 (1,000,000원 = 100만원)
- sn-002 : 인스타그램 퍼포먼스 팩 마이크로인플루언서 (2,000,000원 = 200만원)
- sn-003 : 메타(IG/FB) 광고 소재 풀케어 (3,000,000원 = 300만원)

답변 작성 규칙:
1. 고객의 인풋을 분석한 공감 및 진단
2. 예산 내에서 브랜드에 딱 맞는 방향성과 모듈 제안 
   - [필수] 예산 활용도 극대화: 고객이 제시한 최종 예산의 80%~100%를 꽉 채워 소진할 수 있도록, 단가가 높은 맞춤 모듈을 우선적으로 포함하거나 여러 모듈을 공격적으로 조합하세요. 예산을 너무 적게(절반 이하 등) 쓰고 남기지 마세요.
3. 추천 모듈의 합계 금액을 명시하고, 고객 예산과 비교하여 "예산 ○○만원 내 총 ○○만원" 형식으로 보여주세요.
4. [중요] 만약 특정 마케팅 모듈들을 장바구니에 추천하기로 결정했다면, 답변 텍스트의 **맨 마지막**에 반드시 다음과 같은 포맷으로 JSON 블록을 넣어주세요. (이 JSON은 시스템이 읽어들여 결제 버튼을 생성합니다.)
\`\`\`json
{"recommended_modules": ["tk-001", "pr-001"]}
\`\`\`
만약 아직 추천할 단계가 아니거나 예산을 초과하여 추천할 모듈이 없다면 JSON 블록을 넣지 마세요.
`;

router.post('/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // 왜(Why): 프론트엔드에서 전달한 대화 히스토리를 활용하여 맥락 있는 대화를 합니다.
        // history가 있으면 그것을 사용하고, 없으면 단일 메시지로 폴백합니다.
        const conversationMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        if (history && Array.isArray(history) && history.length > 0) {
            // 프론트엔드에서 이미 최근 10턴으로 트리밍해서 보냅니다.
            history.forEach((msg: { role: string; content: string }) => {
                conversationMessages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                });
            });
        } else {
            conversationMessages.push({ role: 'user', content: message });
        }

        // 왜(Why): gpt-4-turbo-preview → gpt-4o-mini로 변경 (5~10배 빠르고, 비용 90% 절감)
        // 마케팅 모듈 추천은 복잡한 추론이 아니므로 gpt-4o-mini로 충분합니다.
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: conversationMessages,
            temperature: 0.7,
            max_tokens: 1200,
        });

        const aiMessage = completion.choices[0].message.content;
        res.json({ message: aiMessage });

    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: 'Failed to communicate with AI' });
    }
});

export default router;
