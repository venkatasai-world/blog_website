import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Trash2, PenLine, Check, X, ArrowUp, ArrowDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminNavigation() {
  const [navItems, setNavItems] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', href: '' });
  const [editForm, setEditForm] = useState({ label: '', href: '' });

  const fetchNav = async () => {
    const { data } = await supabase.from('nav_items').select('*').order('order', { ascending: true });
    setNavItems(data ?? []);
  };

  useEffect(() => { fetchNav(); }, []);

  const handleAdd = async () => {
    if (!form.label.trim() || !form.href.trim()) {
      toast({ title: 'Label and URL are required', variant: 'destructive' });
      return;
    }
    const maxOrder = navItems.length > 0 ? Math.max(...navItems.map((n) => n.order)) : 0;
    const { error } = await supabase.from('nav_items').insert({
      label: form.label.trim(),
      href: form.href.trim(),
      order: maxOrder + 1,
      is_active: true,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Nav item added!' });
      setForm({ label: '', href: '' });
      setAdding(false);
      fetchNav();
    }
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from('nav_items').update({
      label: editForm.label.trim(),
      href: editForm.href.trim(),
    }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated!' });
      setEditingId(null);
      fetchNav();
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"?`)) return;
    await supabase.from('nav_items').delete().eq('id', id);
    toast({ title: 'Deleted' });
    fetchNav();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('nav_items').update({ is_active: !current }).eq('id', id);
    fetchNav();
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= navItems.length) return;

    const current = navItems[index];
    const swap = navItems[swapIndex];

    await Promise.all([
      supabase.from('nav_items').update({ order: swap.order }).eq('id', current.id),
      supabase.from('nav_items').update({ order: current.order }).eq('id', swap.id),
    ]);
    fetchNav();
  };

  return (
    <AdminLayout>
      <div className="max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-blog-heading">Navigation</h1>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="bg-card border border-border rounded-lg p-4 mb-5 space-y-3">
            <h3 className="text-sm font-body font-semibold text-blog-heading">New Nav Item</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Label *</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                  placeholder="About"
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">URL *</label>
                <input
                  type="text"
                  value={form.href}
                  onChange={(e) => setForm({ ...form, href: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                  placeholder="/about"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                <Check className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setAdding(false)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-body border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Nav items list */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {navItems.length === 0 ? (
            <div className="p-10 text-center text-sm font-body text-muted-foreground">No nav items.</div>
          ) : (
            <div className="divide-y divide-border">
              {navItems.map((item, index) => (
                <div key={item.id} className={`p-4 ${!item.is_active ? 'opacity-50' : ''}`}>
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editForm.label}
                          onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                          className="px-2 py-1.5 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                          placeholder="Label"
                        />
                        <input
                          value={editForm.href}
                          onChange={(e) => setEditForm({ ...editForm, href: e.target.value })}
                          className="px-2 py-1.5 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                          placeholder="/url"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(item.id)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-body font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-body border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors">
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === navItems.length - 1}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-body font-medium text-blog-heading">{item.label}</p>
                          <p className="text-xs font-mono text-muted-foreground">{item.href}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(item.id, item.is_active)}
                          className="p-1.5 rounded-md transition-colors"
                          title={item.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {item.is_active
                            ? <ToggleRight className="h-4 w-4 text-primary" />
                            : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          }
                        </button>
                        <button
                          onClick={() => { setEditingId(item.id); setEditForm({ label: item.label, href: item.href }); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <PenLine className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.label)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
