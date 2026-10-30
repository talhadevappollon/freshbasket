export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  icon?: string;
  description?: string;
  products_count?: number;
  parent_id?: number | null;
  /** Up to three product photos from this category (added by the categories API) */
  preview_images?: string[];
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description?: string;
  short_description?: string;
  brand?: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock_quantity: number;
  unit?: string;
  primary_image?: string;
  is_featured: boolean;
  category?: Category;
  images?: { id: number; image_url: string; is_primary: boolean }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderCustomer {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_city: string;
  delivery_area: string;
  delivery_address: string;
  order_notes?: string;
  /** YYYY-MM-DD and a key from data/deliverySlots.ts */
  delivery_date?: string;
  delivery_window?: string;
}

/** What the public tracking endpoint returns: no phone or street address. */
export interface TrackedOrder {
  order_number: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  delivery_city: string;
  delivery_area?: string | null;
  delivery_date?: string | null;
  delivery_window?: string | null;
  delivery_window_label?: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: { product_name: string; unit?: string; price: number; quantity: number; subtotal: number }[];
}

export interface OrderResponse {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_city: string;
  delivery_area?: string;
  delivery_address: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery_date?: string | null;
  delivery_window?: string | null;
  delivery_window_label?: string | null;
  created_at: string;
  updated_at?: string;
  items: {
    id: number;
    product_name: string;
    unit?: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

