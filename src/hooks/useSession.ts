'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SalesSession } from '@/lib/types';

export function useSessions(storeId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [sessions, setSessions] = useState<SalesSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    const { data } = await supabase
      .from('sales_sessions')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (data) setSessions(data);
    setLoading(false);
  }, [storeId, supabase]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async (name: string) => {
    if (!storeId) return null;
    const { data, error } = await supabase
      .from('sales_sessions')
      .insert({ store_id: storeId, name, is_active: false })
      .select()
      .single();

    if (!error && data) {
      setSessions(prev => [data, ...prev]);
    }
    return { data, error };
  };

  const toggleActive = async (sessionId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('sales_sessions')
      .update({ is_active: isActive })
      .eq('id', sessionId);

    if (!error) {
      await fetchSessions();
    }
    return { error };
  };

  const updateSession = async (sessionId: string, updates: Partial<SalesSession>) => {
    const { data, error } = await supabase
      .from('sales_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (!error) {
      await fetchSessions();
    }
    return { data, error };
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('sales_sessions')
      .delete()
      .eq('id', sessionId);

    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
    return { error };
  };

  const activeSession = sessions.find(s => s.is_active) || null;

  return {
    sessions,
    activeSession,
    loading,
    createSession,
    toggleActive,
    updateSession,
    deleteSession,
    refetch: fetchSessions,
  };
}
