import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type NavItem = Database['public']['Tables']['nav_items']['Row'];

export function useNavItems() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNav = async () => {
      const { data } = await supabase
        .from('nav_items')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });
      
      const transformed = (data ?? []).map((item) => {
        if (item.label === 'Cybersecurity') {
          return { ...item, label: 'Movies', href: '/blog?category=movies' } as NavItem;
        }
        return item;
      });
      setNavItems(transformed);
      setLoading(false);
    };
    fetchNav();
  }, []);

  return { navItems, loading };
}
