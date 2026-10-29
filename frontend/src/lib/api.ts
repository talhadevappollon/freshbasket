import { Product, Category, OrderResponse, OrderCustomer, CartItem } from '@/types';
import fallbackData from '@/data/initialCatalog.json';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api/v1' : 'http://127.0.0.1:8000/api/v1');

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    console.warn('API unavailable, falling back to local dataset for categories');
  }

  return (fallbackData.categories as any[]).map((c, i) => ({
    id: i + 1,
    name: c.name,
    slug: c.slug,
    image_url: c.image || undefined,
    description: c.description || undefined,
    products_count: 25,
  }));
}

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
  sort?: string;
  per_page?: number;
}): Promise<{ data: Product[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', '1');
    if (params?.sort) query.set('sort', params.sort);
    if (params?.per_page) query.set('per_page', params.per_page.toString());

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return { data: json.data, total: json.total };
    }
  } catch {
    console.warn('API unavailable, falling back to local dataset for products');
  }

  let prods: Product[] = (fallbackData.products as any[]).map((p, i) => ({
    id: i + 1,
    category_id: 1,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    barcode: p.barcode,
    description: p.description,
    short_description: p.description?.slice(0, 100),
    brand: p.brand || 'Fresh Basket',
    price: Number(p.price) || 150,
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    cost_price: Number(p.price) * 0.78,
    stock_quantity: p.stock_quantity || 45,
    unit: p.unit || '1 unit',
    primary_image: p.primary_image,
    is_featured: i % 4 === 0,
    images: (p.images || []).map((img: string, idx: number) => ({
      id: idx + 1,
      image_url: img,
      is_primary: idx === 0,
    })),
  }));

  if (params?.search) {
    const term = params.search.toLowerCase();
    prods = prods.filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term))
    );
  }

  if (params?.category) {
    const cat = params.category.toLowerCase();
    prods = prods.filter(p => p.slug.includes(cat) || p.name.toLowerCase().includes(cat));
  }

  return { data: prods.slice(0, params?.per_page || 40), total: prods.length };
}

export async function fetchProductBySlug(slug: string): Promise<{ product: Product; related: Product[] } | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      return {
        product: json.product,
        related: json.related || [],
      };
    }
  } catch {
    console.warn('API single product error, falling back to local');
  }

  // Fallback lookup
  const rawList = fallbackData.products as any[];
  const foundIndex = rawList.findIndex(p => p.slug === slug || String(p.external_id) === slug);
  if (foundIndex === -1) {
    // Try partial match
    const altIndex = rawList.findIndex(p => p.slug.includes(slug) || slug.includes(p.slug));
    if (altIndex === -1 && rawList.length > 0) {
      return null;
    }
  }

  const p = rawList[foundIndex !== -1 ? foundIndex : 0];
  const product: Product = {
    id: p.external_id || 1,
    category_id: 1,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    barcode: p.barcode,
    description: p.description,
    short_description: p.description?.slice(0, 120),
    brand: p.brand || 'Fresh Basket',
    price: Number(p.price) || 150,
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    cost_price: Number(p.price) * 0.78,
    stock_quantity: p.stock_quantity || 45,
    unit: p.unit || '1 unit',
    primary_image: p.primary_image,
    is_featured: true,
    images: (p.images || []).map((img: string, idx: number) => ({
      id: idx + 1,
      image_url: img,
      is_primary: idx === 0,
    })),
  };

  const related: Product[] = rawList.slice(0, 4).map((rp, i) => ({
    id: rp.external_id || i + 1,
    category_id: 1,
    name: rp.name,
    slug: rp.slug,
    sku: rp.sku,
    barcode: rp.barcode,
    description: rp.description,
    brand: rp.brand || 'Fresh Basket',
    price: Number(rp.price) || 150,
    compare_at_price: rp.compare_at_price ? Number(rp.compare_at_price) : null,
    stock_quantity: 40,
    unit: rp.unit || '1 unit',
    primary_image: rp.primary_image,
    is_featured: false,
  }));

  return { product, related };
}

export async function submitCheckout(
  customer: OrderCustomer,
  items: CartItem[]
): Promise<{ success: boolean; message: string; order?: OrderResponse }> {
  try {
    const payload = {
      ...customer,
      items: items.map(it => ({
        product_id: it.product.id,
        quantity: it.quantity,
      })),
    };

    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message, order: data.order };
    }
    const err = await res.json();
    return { success: false, message: err.message || 'Failed to place order.' };
  } catch {
    const subtotal = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
    const deliveryFee = subtotal >= 2500 ? 0 : 150;
    const mockOrder: OrderResponse = {
      id: Math.floor(Math.random() * 1000),
      order_number: 'FB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone,
      delivery_city: customer.delivery_city,
      delivery_area: customer.delivery_area,
      delivery_address: customer.delivery_address,
      subtotal,
      delivery_fee: deliveryFee,
      discount: 0,
      total: subtotal + deliveryFee,
      payment_method: 'cod',
      payment_status: 'unpaid',
      order_status: 'pending',
      created_at: new Date().toISOString(),
      items: items.map(it => ({
        id: it.product.id,
        product_name: it.product.name,
        unit: it.product.unit,
        price: it.product.price,
        quantity: it.quantity,
        subtotal: it.product.price * it.quantity,
      })),
    };
    return {
      success: true,
      message: 'Order placed successfully with Cash on Delivery!',
      order: mockOrder,
    };
  }
}

export async function trackOrder(orderNumber: string): Promise<OrderResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderNumber}`);
    if (res.ok) {
      const data = await res.json();
      return data.order;
    }
  } catch (err) {
    console.error('Track order error', err);
  }
  return null;
}
