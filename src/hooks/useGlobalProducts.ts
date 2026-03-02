'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GlobalProduct } from '@/lib/types';

export function useGlobalProducts(storeId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<GlobalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!storeId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('global_products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: true });

    if (data) setProducts(data);
    setLoading(false);
  }, [storeId, supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (product: {
    name: string;
    price: number;
    image_url?: string;
  }) => {
    if (!storeId) return null;
    const { data, error } = await supabase
      .from('global_products')
      .insert({ ...product, store_id: storeId })
      .select()
      .single();

    if (!error && data) {
      setProducts(prev => [...prev, data]);
    }
    return { data, error };
  };

  const updateProduct = async (productId: string, updates: Partial<GlobalProduct>) => {
    const { data, error } = await supabase
      .from('global_products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (!error && data) {
      setProducts(prev => prev.map(p => (p.id === productId ? data : p)));
    }
    return { data, error };
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('global_products')
      .delete()
      .eq('id', productId);

    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
    return { error };
  };

  return { products, loading, createProduct, updateProduct, deleteProduct, refetch: fetchProducts };
}
