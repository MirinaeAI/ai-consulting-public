export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  price_min: number | null;
  price_max: number | null;
  is_free_tier: boolean;
  tool_categories: {
    categories: {
      name: string;
    };
  }[];
}

export interface ConsultationData {
  purpose: string;
  orgSize: string | null;
  budget: number | null;
}