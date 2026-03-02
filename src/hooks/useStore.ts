'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Store } from '@/lib/types';

export function useStore() {
  const supabase = useMemo(() => createClient(), []);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStore = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // No store exists, create one
      const { data: newStore } = await supabase
        .from('stores')
        .insert({ name: '', bank_account: '', promptpay: '' })
        .select()
        .single();
      setStore(newStore);
    } else if (data) {
      setStore(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const updateStore = async (updates: Partial<Store>) => {
    if (!store) return;
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', store.id)
      .select()
      .single();

    if (!error && data) {
      setStore(data);
    }
    return { data, error };
  };

  return { store, loading, updateStore, refetch: fetchStore };
}
