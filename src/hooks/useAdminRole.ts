import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth listener BEFORE getSession to avoid lock races
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Use setTimeout to avoid deadlock inside the auth callback
      setTimeout(async () => {
        const { data } = await supabase.rpc('is_admin');
        setIsAdmin(data === true);
        setLoading(false);
      }, 0);
    });

    // Then restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setIsAdmin(false); setLoading(false); return; }
      supabase.rpc('is_admin').then(({ data }) => {
        setIsAdmin(data === true);
        setLoading(false);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading };
}
