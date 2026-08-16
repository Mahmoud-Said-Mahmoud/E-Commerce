export interface BrandI {
  id: number;

  name: string;

  slug: string;

  count?: number;

  parent?: number;

  image?: {
    id?: number;
    src?: string;
    alt?: string;
  };
}
