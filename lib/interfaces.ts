export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageString: string;
  size?: string;
  color?: string;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  discountCode?: string;
  discountPercentage?: number;
};

export type TestStatus = "running" | "success" | "failure";

export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  message?: string;
  duration?: number;
  details?: Record<string, string | number>;
}