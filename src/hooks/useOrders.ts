'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { OrderWithItems, CartItem, PaymentMethod } from '@/lib/types';

export function useOrders(sessionId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!sessionId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (data) setOrders(data as OrderWithItems[]);
    setLoading(false);
  }, [sessionId, supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (
    cartItems: CartItem[],
    total: number,
    paymentMethod: PaymentMethod,
    paymentProofUrl?: string
  ) => {
    if (!sessionId) return null;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        session_id: sessionId,
        total,
        payment_method: paymentMethod,
        payment_proof_url: paymentProofUrl || null,
      })
      .select()
      .single();

    if (orderError || !order) return { data: null, error: orderError };

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) return { data: null, error: itemsError };

    // Deduct stock for each product
    const stockUpdates = cartItems.map(item =>
      supabase
        .from('products')
        .update({ stock: Math.max(0, item.product.stock - item.quantity) })
        .eq('id', item.product.id)
    );
    await Promise.all(stockUpdates);

    await fetchOrders();
    return { data: order, error: null };
  };

  return { orders, loading, createOrder, refetch: fetchOrders };
}
