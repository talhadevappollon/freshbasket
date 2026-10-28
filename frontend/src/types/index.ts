export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  icon?: string;
  description?: string;
  products_count?: number;
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
  created_at: string;
  items: {
    id: number;
    product_name: string;
    unit?: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

