import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { PenSquare, Trash2, Eye, EyeOff, PlusCircle, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePublish = async (id: string, current: boolean) => {
    // Optimistic update — flip state immediately
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, is_published: !current, published_at: !current ? new Date().toISOString() : null }
          : p
      )
    );
    const { error } = await supabase
      .from('posts')
      .update({ is_published: !current, published_at: !current ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, is_published: current } : p
        )
      );
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: !current ? 'Post published' : 'Post unpublished' });
    }
  };

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    // Optimistic remove
    setPosts((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      fetchPosts(); // Re-sync on error
    } else {
      toast({ title: 'Post deleted' });
    }
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-blog-heading">Posts</h1>
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            New Post
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2 text-sm font-body border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-body text-muted-foreground text-sm">
                {search ? `No posts matching "${search}"` : 'No posts yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-body font-medium text-blog-heading truncate">{post.title}</p>
                      <span className={`text-xs font-body px-2 py-0.5 rounded-full flex-shrink-0 ${
                        post.is_published
                          ? 'text-green-700 bg-green-50'
                          : 'text-orange-700 bg-orange-50'
                      }`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {post.categories && (
                        <span className="text-xs font-body text-muted-foreground">{post.categories.name}</span>
                      )}
                      <span className="text-xs font-body text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-body text-muted-foreground">👁 {post.views}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePublish(post.id, post.is_published)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={post.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <Link
                      to={`/admin/posts/${post.id}/edit`}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Edit"
                    >
                      <PenSquare className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deletePost(post.id, post.title)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      title="Delete"
                    >
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
