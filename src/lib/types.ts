export interface Store {
  id: string;
  name: string;
  logo_url: string | null;
  bank_account: string;
  promptpay: string;
  created_at: string;
  updated_at: string;
}

export interface SalesSession {
  id: string;
  store_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  session_id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  session_id: string;
  total: number;
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'transfer' | 'qrcode';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
