import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Trash2, PenLine, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('categories').insert({
      name: form.name.trim(),
      slug: form.slug || slugify(form.name),
      description: form.description || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category added!' });
      setForm({ name: '', slug: '', description: '' });
      setAdding(false);
      fetchCategories();
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '' });
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from('categories').update({
      name: editForm.name.trim(),
      slug: editForm.slug || slugify(editForm.name),
      description: editForm.description || null,
    }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category updated!' });
      setEditingId(null);
      fetchCategories();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted' });
      fetchCategories();
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-blog-heading">Categories</h1>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="bg-card border border-border rounded-lg p-5 mb-5 space-y-3">
            <h3 className="text-sm font-body font-semibold text-blog-heading">New Category</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                  placeholder="Category Name"
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                  placeholder="category-slug"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-body text-muted-foreground mb-1 block">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                placeholder="Optional description"
              />
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

        {/* Categories list */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-10 text-center text-sm font-body text-muted-foreground">No categories yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4">
                  {editingId === cat.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="px-2 py-1.5 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                        />
                        <input
                          value={editForm.slug}
                          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                          className="px-2 py-1.5 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                        />
                      </div>
                      <input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                        placeholder="Description"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(cat.id)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-body font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-body border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors">
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-body font-medium text-blog-heading">{cat.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{cat.slug}</p>
                        {cat.description && <p className="text-xs font-body text-muted-foreground mt-0.5">{cat.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(cat)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                          <PenLine className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
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
