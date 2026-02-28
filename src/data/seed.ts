import type { Booth, Thread, Analytics } from '../types';

export const SEED_BOOTHS: Booth[] = [
  {
    id: 'booth-001',
    name: 'TeaCo',
    category: '음료 & 식품',
    tagline: '한 잔에 담긴 일상의 여유',
    description:
      '국내 최고의 산지에서 직접 수확한 유기농 차를 선보입니다. 하동 녹차부터 보성 홍차까지, 기업 복지 선물 세트와 사무실 웰니스 구독 패키지를 제공합니다. 연간 계약 시 커스텀 패키징과 브랜드 라벨링이 가능합니다.',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
    ],
    links: {
      instagram: 'https://instagram.com',
      store: 'https://example.com',
      site: 'https://example.com',
    },
    faq: [
      {
        question: '최소 주문 수량이 있나요?',
        answer:
          '기업 납품의 경우 50세트 이상부터 가능합니다. 소량은 스토어에서 개인 구매로 진행해 주세요.',
      },
      {
        question: 'OEM 패키지 제작도 가능한가요?',
        answer:
          '네, 브랜드 로고와 디자인을 적용한 커스텀 패키지 제작이 가능합니다. 제작 기간은 약 3주 소요됩니다.',
      },
      {
        question: '샘플을 먼저 받아볼 수 있나요?',
        answer:
          '문의 남겨주시면 5종 샘플 키트를 무료로 보내드립니다. (배송비 별도)',
      },
    ],
    nextEvents: [
      { title: '봄 바이어 미팅', date: '2025-03-15', location: 'COEX Hall A' },
    ],
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'booth-002',
    name: 'BrandKit Studio',
    category: '인쇄 & 굿즈',
    tagline: '브랜드의 첫인상을 완성하는 곳',
    description:
      '명함, 브로셔, 패키지 디자인부터 대량 인쇄까지. 스타트업부터 중견기업까지 600개 이상의 기업과 함께했습니다. 24시간 온라인 주문 시스템과 당일 시안 제공으로 빠른 의사결정을 지원합니다.',
    images: [
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
      'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?w=800&q=80',
    ],
    links: {
      instagram: 'https://instagram.com',
      site: 'https://example.com',
    },
    faq: [
      {
        question: '시안 확인까지 얼마나 걸리나요?',
        answer: '주문 접수 후 영업일 기준 1일 이내 1차 시안을 제공합니다.',
      },
      {
        question: '소량(100장 이하) 명함도 가능한가요?',
        answer: '50장부터 주문 가능합니다. 수량이 적을수록 장당 단가가 올라갑니다.',
      },
      {
        question: '디자인 파일이 없어도 제작할 수 있나요?',
        answer:
          '네, 브랜드 가이드라인이나 참고 자료만 주셔도 디자인팀이 제작해드립니다.',
      },
    ],
    nextEvents: [
      {
        title: '인쇄 & 굿즈 워크숍',
        date: '2025-03-22',
        location: 'DDP 디자인홀',
      },
    ],
    createdAt: '2025-01-12T10:30:00Z',
  },
  {
    id: 'booth-003',
    name: 'GreenSpace',
    category: '친환경 오피스',
    tagline: '지구도 좋고, 사무실도 좋고',
    description:
      'FSC 인증 목재와 재활용 소재로 만든 사무용 가구와 친환경 소모품을 공급합니다. ESG 경영을 실천하는 기업들의 오피스 환경을 새롭게 디자인하고, 탄소 발자국 리포트를 함께 제공합니다.',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
    ],
    links: {
      instagram: 'https://instagram.com',
      store: 'https://example.com',
      site: 'https://example.com',
    },
    faq: [
      {
        question: 'ESG 인증서 발급이 가능한가요?',
        answer:
          '네, 구매 제품에 대한 탄소 절감량 리포트와 ESG 기여 증명서를 발급합니다.',
      },
      {
        question: '기존 사무실 가구와 어울릴까요?',
        answer:
          '모듈형 디자인으로 기존 가구와 믹스매치가 가능합니다. 무료 인테리어 컨설팅도 제공합니다.',
      },
      {
        question: '배송 및 설치 서비스가 포함되나요?',
        answer:
          '수도권은 자체 배송 및 설치 서비스를 제공합니다. 지방은 협력사를 통해 진행됩니다.',
      },
    ],
    nextEvents: [
      { title: 'ESG 오피스 세미나', date: '2025-04-05', location: 'GreenSpace 쇼룸' },
    ],
    createdAt: '2025-01-14T11:00:00Z',
  },
  {
    id: 'booth-004',
    name: 'DataFlow',
    category: 'IT & SaaS',
    tagline: '데이터가 의사결정이 되는 순간',
    description:
      'B2B 영업팀을 위한 AI 기반 파이프라인 관리 & 예측 분석 플랫폼입니다. 평균 도입 후 3개월 내 영업 효율 40% 향상. 현재 120개 기업 고객이 사용 중이며, 무료 30일 트라이얼을 제공합니다.',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    ],
    links: {
      site: 'https://example.com',
    },
    faq: [
      {
        question: '기존 CRM과 연동이 가능한가요?',
        answer:
          'Salesforce, HubSpot, Pipedrive 등 주요 CRM과 API 연동을 지원합니다.',
      },
      {
        question: '데이터 보안은 어떻게 되나요?',
        answer:
          'ISO 27001 인증을 보유하고 있으며 데이터는 국내 IDC에 암호화 저장됩니다.',
      },
      {
        question: '도입 교육은 제공되나요?',
        answer:
          '전담 CS 매니저를 배정하고 온보딩 세션(4시간)을 무료로 제공합니다.',
      },
    ],
    nextEvents: [
      {
        title: '영업팀 생산성 웨비나',
        date: '2025-03-28',
        location: '온라인 (Zoom)',
      },
    ],
    createdAt: '2025-01-15T09:30:00Z',
  },
  {
    id: 'booth-005',
    name: 'CraftLeather',
    category: '핸드크래프트',
    tagline: '오래 쓸수록 더 멋있어지는',
    description:
      '이탈리아산 풀그레인 가죽을 사용한 수공예 기업 선물 전문 브랜드입니다. 명함지갑, 노트북 파우치, 사무용 액세서리에 기업 로고 각인 서비스를 제공합니다. 제작 기간: 2~3주.',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80',
    ],
    links: {
      instagram: 'https://instagram.com',
      store: 'https://example.com',
    },
    faq: [
      {
        question: '로고 각인 최소 수량은?',
        answer:
          '각인 주문은 30개부터 가능합니다. 20개 이하는 개별 협의로 진행합니다.',
      },
      {
        question: '가죽 색상 선택이 가능한가요?',
        answer: '탄 브라운, 다크 브라운, 블랙 3가지 색상 중 선택 가능합니다.',
      },
      {
        question: '견본품 확인 후 진행할 수 있나요?',
        answer:
          '샘플 1개를 원가에 제작해드립니다. 이후 대량 주문 시 샘플 비용은 차감됩니다.',
      },
    ],
    nextEvents: [
      { title: '가을 선물세트 주문 마감', date: '2025-09-01', location: '온라인 접수' },
    ],
    createdAt: '2025-01-16T14:00:00Z',
  },
  {
    id: 'booth-006',
    name: 'NutritionLab',
    category: '웰니스 & 복지',
    tagline: '건강한 팀이 만드는 좋은 성과',
    description:
      '기업 구성원의 건강을 위한 맞춤형 영양 솔루션입니다. 월 구독형 건강 간식 박스, 임직원 영양 상담, 단체 건강검진 패키지를 제공합니다. 현재 50개 기업과 파트너십을 맺고 있습니다.',
    images: [
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
    ],
    links: {
      instagram: 'https://instagram.com',
      site: 'https://example.com',
    },
    faq: [
      {
        question: '구독 최소 인원이 있나요?',
        answer: '10인 이상 팀부터 기업 구독 플랜 적용이 가능합니다.',
      },
      {
        question: '직원 알레르기 정보를 반영할 수 있나요?',
        answer:
          '네, 구독 신청 시 개인별 식이 제한 정보를 수집해 맞춤 구성합니다.',
      },
      {
        question: '한 달 구독 후 해지가 가능한가요?',
        answer: '최소 약정 기간은 3개월이며, 이후 매달 해지 신청이 가능합니다.',
      },
    ],
    nextEvents: [
      { title: '기업 웰니스 트렌드 세미나', date: '2025-04-10', location: '여의도 IFC' },
    ],
    createdAt: '2025-01-17T10:00:00Z',
  },
];

export const SEED_ANALYTICS: Analytics[] = SEED_BOOTHS.map((b, i) => ({
  boothId: b.id,
  scans: [124, 87, 203, 156, 63, 98][i],
  favorites: [42, 31, 78, 54, 19, 37][i],
  inquiries: [18, 12, 29, 22, 8, 15][i],
}));

export const SEED_THREADS: Thread[] = [
  {
    id: 'thread-001',
    boothId: 'booth-001',
    visitorId: 'user',
    visitorName: '김지수',
    messages: [
      {
        from: 'visitor',
        text: '안녕하세요! 50인 이상 기업 복지 선물 세트 견적을 받고 싶습니다. 명절 시즌 전에 납품이 가능한지 문의드립니다.',
        at: '2025-02-10T14:22:00Z',
      },
      {
        from: 'booth',
        text: '안녕하세요 김지수님, 관심 가져주셔서 감사합니다! 50세트 이상은 기업가 할인이 적용됩니다. 원하시는 예산 범위와 납품 일정을 알려주시면 맞춤 견적을 드릴게요.',
        at: '2025-02-10T15:05:00Z',
      },
    ],
    status: '처리',
    tags: ['견적문의', 'B2B'],
    memo: '명절 납품 수요. 50세트 이상 예상.',
    lastUpdated: '2025-02-10T15:05:00Z',
  },
  {
    id: 'thread-002',
    boothId: 'booth-004',
    visitorId: 'guest',
    messages: [
      {
        from: 'visitor',
        text: 'CRM 연동 시 커스텀 필드도 매핑이 되나요? Salesforce 사용 중입니다.',
        at: '2025-02-11T09:40:00Z',
      },
    ],
    status: '미처리',
    tags: ['기술문의'],
    memo: '',
    lastUpdated: '2025-02-11T09:40:00Z',
  },
  {
    id: 'thread-003',
    boothId: 'booth-002',
    visitorId: 'user',
    visitorName: '이민준',
    messages: [
      {
        from: 'visitor',
        text: '명함 500장 + 브로셔 200부 합산 견적 부탁드립니다. 파일은 PDF로 있습니다.',
        at: '2025-02-12T11:00:00Z',
      },
      {
        from: 'booth',
        text: '이민준님 안녕하세요! 파일 전달해 주시면 1영업일 내 견적서 발송해 드리겠습니다. 이메일은 quote@brandkit.kr 입니다.',
        at: '2025-02-12T11:45:00Z',
      },
    ],
    status: '보류',
    tags: ['견적문의', '대량주문'],
    memo: '파일 수령 대기 중',
    lastUpdated: '2025-02-12T11:45:00Z',
  },
];
