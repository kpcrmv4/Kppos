'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/types';

export function useProducts(sessionId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!sessionId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) setProducts(data);
    setLoading(false);
  }, [sessionId, supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (product: {
    name: string;
    price: number;
    image_url?: string;
    stock: number;
  }) => {
    if (!sessionId) return null;
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, session_id: sessionId })
      .select()
      .single();

    if (!error && data) {
      setProducts(prev => [...prev, data]);
    }
    return { data, error };
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
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
      .from('products')
      .delete()
      .eq('id', productId);

    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
    return { error };
  };

  return { products, loading, createProduct, updateProduct, deleteProduct, refetch: fetchProducts };
}
