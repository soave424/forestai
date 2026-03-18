import { InsectKnowledge } from "@/types/insect";

export const SAMPLE_DATA: InsectKnowledge[] = [
  {
    id: "1",
    author: "김연구원",
    name: "장수말벌 (Vespa mandarinia)",
    source: "현장 관찰 (2024.03)",
    description: "동아시아 지역에서 발견되는 세계 최대의 말벌로, 강력한 독침과 거대한 턱을 가지고 있습니다. 주로 산림 지대에 서식하며 꿀벌 집단을 공격하는 것으로 알려져 있습니다.",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    author: "박관찰자",
    name: "호랑나비 (Papilio xuthus)",
    source: "도감 참고 + 현장",
    description: "한국의 대표적인 나비 종으로, 날개에 호랑이 무늬와 유사한 줄무늬가 특징입니다. 봄부터 가을까지 관찰되며 감귤류 식물에 산란합니다.",
    createdAt: "2024-04-02",
  },
  {
    id: "3",
    author: "이생태학",
    name: "꿀벌 (Apis mellifera)",
    source: "논문 리뷰 (2023)",
    description: "사회성 곤충의 대표종으로 정교한 집단 구조를 가집니다. 여왕벌, 일벌, 수벌의 역할 분담이 뚜렷하며 8자 춤으로 먹이 위치를 전달합니다.",
    createdAt: "2024-02-20",
  },
  {
    id: "4",
    author: "최현장",
    name: "사슴벌레 (Lucanus cervus)",
    source: "야간 채집 기록",
    description: "수컷의 큰 턱이 사슴뿔을 닮아 이름 붙여졌습니다. 참나무 수액에 모이며 야행성으로 여름철 가로등 주변에서 자주 관찰됩니다.",
    createdAt: "2024-06-10",
  },
  {
    id: "5",
    author: "정분류학",
    name: "무당벌레 (Harmonia axyridis)",
    source: "실험실 관찰",
    description: "진딧물의 천적으로 생물학적 방제에 활용됩니다. 등딱지 색상과 반점 수가 개체마다 크게 다르며 위협 시 관절에서 독성 체액을 분비합니다.",
    createdAt: "2024-05-18",
  },
  {
    id: "6",
    author: "한곤충학",
    name: "왕잠자리 (Anax parthenope)",
    source: "습지 모니터링",
    description: "국내 최대 잠자리 중 하나로, 강력한 비행 능력을 갖추고 있습니다. 유충(수채)은 수중 생태계의 최상위 포식자로 수질 지표종으로 활용됩니다.",
    createdAt: "2024-07-22",
  },
];

export const SUGGESTION_QUESTIONS = [
  "이 곤충의 생태적 역할은?",
  "서식지 환경을 알려줘",
  "천적 관계를 분석해줘",
  "보전 상태는 어때?",
];
