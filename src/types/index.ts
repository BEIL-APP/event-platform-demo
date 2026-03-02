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
  visitorId?: string;
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
  visitorEmail?: string;
  consentGiven?: boolean;
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

// ─── New types for extended MVP ───────────────────────────────────────────────

export interface Lead {
  id: string;
  boothId: string;
  source: 'bizcard' | 'inquiry' | 'email_info' | 'survey';
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  memo: string;
  consent: boolean;
  createdAt: string;
}

export interface BoothPolicy {
  boothId: string;
  startAt: string;
  endAt: string;
  allowViewAfterEnd: boolean;
  allowInquiryAfterEnd: boolean;
}

export interface Attachment {
  id: string;
  boothId: string;
  filename: string;
  type: string;
  size?: string;
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  boothId: string;
  visitorId: string;
  answers: {
    interests?: string[];
    purpose?: string;
    wantsContact?: boolean;
  };
  createdAt: string;
}
