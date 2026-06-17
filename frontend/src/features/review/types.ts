export interface Review {
  id: number;
  productId?: number;
  productName?: string;
  authorName: string;
  authorCity?: string;
  rating: number;
  title: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

export interface ReviewPayload {
  productId?: number;
  authorName: string;
  authorCity?: string;
  rating: number;
  title: string;
  body: string;
}
