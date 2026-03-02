'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface SessionReport {
  id: string;
  name: string;
  created_at: string;
  is_active: boolean;
  total_revenue: number;
  total_orders: number;
  total_items_sold: number;
  products: { name: string; quantity: number; revenue: number; image_url: string | null }[];
  payment_methods: { cash: number; transfer: number; qrcode: number };
  orders: {
    id: string;
    total: number;
    payment_method: string;
    created_at: string;
    items: { product_name: string; quantity: number; subtotal: number }[];
  }[];
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  image_url: string | null;
}

export interface ReportData {
  total_revenue: number;
  total_orders: number;
  total_items_sold: number;
  sessions: SessionReport[];
  top_products: TopProduct[];
}

export function useReport(storeId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);

    const { data: sessions } = await supabase
      .from('sales_sessions')
      .select('*, orders(*, order_items(*)), products(*)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (!sessions) {
      setLoading(false);
      return;
    }

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalItemsSold = 0;
    const productMap = new Map<string, TopProduct>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionReports: SessionReport[] = sessions.map((s: any) => {
      const orders = s.orders || [];
      const sessionRevenue = orders.reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0);
      const sessionOrders = orders.length;

      let sessionItemsSold = 0;
      const sessionProducts = new Map<string, { name: string; quantity: number; revenue: number; image_url: string | null }>();
      const paymentMethods = { cash: 0, transfer: 0, qrcode: 0 };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orders.forEach((order: any) => {
        const method = order.payment_method as keyof typeof paymentMethods;
        if (method in paymentMethods) {
          paymentMethods[method] += Number(order.total);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (order.order_items || []).forEach((item: any) => {
          sessionItemsSold += item.quantity;

          // Session-level aggregation
          const existing = sessionProducts.get(item.product_name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += Number(item.subtotal);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const product = (s.products || []).find((p: any) => p.id === item.product_id);
            sessionProducts.set(item.product_name, {
              name: item.product_name,
              quantity: item.quantity,
              revenue: Number(item.subtotal),
              image_url: product?.image_url || null,
            });
          }

          // Global aggregation
          const globalExisting = productMap.get(item.product_name);
          if (globalExisting) {
            globalExisting.quantity += item.quantity;
            globalExisting.revenue += Number(item.subtotal);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const product = (s.products || []).find((p: any) => p.id === item.product_id);
            productMap.set(item.product_name, {
              name: item.product_name,
              quantity: item.quantity,
              revenue: Number(item.subtotal),
              image_url: product?.image_url || null,
            });
          }
        });
      });

      totalRevenue += sessionRevenue;
      totalOrders += sessionOrders;
      totalItemsSold += sessionItemsSold;

      return {
        id: s.id,
        name: s.name,
        created_at: s.created_at,
        is_active: s.is_active,
        total_revenue: sessionRevenue,
        total_orders: sessionOrders,
        total_items_sold: sessionItemsSold,
        products: Array.from(sessionProducts.values()).sort((a, b) => b.quantity - a.quantity),
        payment_methods: paymentMethods,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orders: orders.map((o: any) => ({
          id: o.id,
          total: Number(o.total),
          payment_method: o.payment_method,
          created_at: o.created_at,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: (o.order_items || []).map((i: any) => ({
            product_name: i.product_name,
            quantity: i.quantity,
            subtotal: Number(i.subtotal),
          })),
        })),
      };
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    setReport({
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      total_items_sold: totalItemsSold,
      sessions: sessionReports,
      top_products: topProducts,
    });
    setLoading(false);
  }, [storeId, supabase]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, loading, refetch: fetchReport };
}
