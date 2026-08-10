export interface ProductI {
  id: number
  name: string
  slug: string
  type: string
  status: string
  featured: boolean
  catalog_visibility: string
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  date_on_sale_from: any
  date_on_sale_from_gmt: any
  date_on_sale_to: any
  date_on_sale_to_gmt: any
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  virtual: boolean
  downloadable: boolean
  downloads: any[]
  download_limit: number
  download_expiry: number
  external_url: string
  button_text: string
  tax_status: string
  tax_class: string
  manage_stock: boolean
  stock_quantity: number
  backorders: string
  backorders_allowed: boolean
  backordered: boolean
  low_stock_amount: any
  sold_individually: boolean
  weight: string
  dimensions: Dimensions
  shipping_required: boolean
  shipping_taxable: boolean
  shipping_class: string
  shipping_class_id: number
  reviews_allowed: boolean
  average_rating: string
  rating_count: number
  upsell_ids: any[]
  cross_sell_ids: any[]
  parent_id: number
  purchase_note: string
  categories: Category[]
  brands: Brand[]
  tags: any[]
  images: Image[]
  attributes: Attribute[]
  default_attributes: any[]
  variations: any[]
  grouped_products: any[]
  menu_order: number
  price_html: string
  related_ids: number[]
  meta_data: MetaDaum[]
  stock_status: string
  has_options: boolean
  post_password: string
  global_unique_id: string
  cost_of_goods_sold: CostOfGoodsSold
  translations: Translations
  lang: string
  _links: Links
}

export interface Dimensions {
  length: string
  width: string
  height: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Brand {
  id: number
  name: string
  slug: string
}

export interface Image {
  id: number
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  src: string
  name: string
  alt: string
  srcset: string
  sizes: string
  thumbnail: string
}

export interface Attribute {
  id: number
  name: string
  slug: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface MetaDaum {
  id: number
  key: string
  value: any
}

export interface CostOfGoodsSold {
  values: Value[]
  total_value: number
}

export interface Value {
  defined_value: any
  effective_value: number
}

export interface Translations {
  ar: string
  en: string
}

export interface Links {
  self: Self[]
  collection: Collection[]
}

export interface Self {
  href: string
  targetHints: TargetHints
}

export interface TargetHints {
  allow: string[]
}

export interface Collection {
  href: string
}
