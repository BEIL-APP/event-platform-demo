export interface Booth {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  images: string[];
  links: {
    instagram?: string;
    store?: string;
    site?: string;
  };
  faq: Array<{ question: string; answer: string }>;
  nextEvents: Array<{ title: string; date: string; location: string }>;
  createdAt: string;
}

export interface Visit {
  boothId: string;
  visitedAt: string;
}

export interface Favorite {
  boothId: string;
  createdAt: string;
}

export interface ChatMessage {
  from: 'visitor' | 'booth';
  text: string;
  images?: string[];
  at: string;
}

export interface Thread {
  id: string;
  boothId: string;
  visitorId: 'guest' | 'user';
  visitorName?: string;
  messages: ChatMessage[];
  status: '미처리' | '처리' | '보류';
  tags: string[];
  memo: string;
  lastUpdated: string;
}

export interface Analytics {
  boothId: string;
  scans: number;
  favorites: number;
  inquiries: number;
}
