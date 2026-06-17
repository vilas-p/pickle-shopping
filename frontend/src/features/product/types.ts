export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  displayOrder: number;
  primary: boolean;
}

export interface ProductVariant {
  id: number;
  weight: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  displayOrder: number;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  ingredients?: string;
  shelfLife?: string;
  price: number;
  compareAtPrice?: number;
  weight: string;
  active: boolean;
  featured: boolean;
  category: Pick<Category, "id" | "name" | "slug">;
  images: ProductImage[];
  variants?: ProductVariant[];
}
