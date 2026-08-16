export interface Category {
  id: number;
  name: string;
  slug: string;
  count?: number;
  parent?: number;
}

export interface ProductImage {
  id: number;
  src: string;
  name?: string;
  alt?: string;
}

export interface ProductBrand {
  id: number;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  position?: number;
  visible?: boolean;
  variation?: boolean;
  options: string[];
}

export interface ProductI {
  id: number;

  name: string;

  slug: string;

  price: string;

  regular_price: string;

  sale_price: string;

  on_sale: boolean;

  stock_status:
    | "instock"
    | "outofstock"
    | "onbackorder";

  images: ProductImage[];

  categories: Category[];

  brands: ProductBrand[];

  sku?: string;

  type?: string;

  description?: string;

  short_description?: string;

  attributes?: ProductAttribute[];

  variations?: number[];

  date_created?: string;
}
