import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminComments() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*, posts(title, slug)')
      .order('created_at', { ascending: false });
    setComments(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, []);

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await supabase.from('comments').delete().eq('id', id);
    toast({ title: 'Comment deleted' });
    fetchComments();
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-blog-heading mb-6">Comments</h1>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center font-body text-muted-foreground text-sm">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="p-10 text-center font-body text-muted-foreground text-sm">No comments yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {comments.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-body font-medium text-blog-heading">{c.name}</span>
                        <span className="text-xs font-body text-muted-foreground">{c.email}</span>
                        <span className="text-xs font-body text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-body text-blog-body mb-1">{c.content}</p>
                      {c.posts && (
                        <p className="text-xs font-body text-muted-foreground">On: <span className="text-primary">{c.posts.title}</span></p>
                      )}
                    </div>
                    <button onClick={() => deleteComment(c.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
