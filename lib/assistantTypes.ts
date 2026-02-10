export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category?: string;
  color?: string;
  gender?: string;
  tags?: string[];
  features?: string[];
  style?: string;
  height?: string;
  pattern?: string;
  url?: string;
  mainCategory?: string;
  sizes?: string[];
  isAiRecommended?: boolean;
}

export type AssistantMode = "basic" | "advanced";
