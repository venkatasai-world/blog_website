import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PostCard from '@/components/PostCard';
import type { Database } from '@/integrations/supabase/types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Database['public']['Tables']['categories']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') ?? '';
  const activeCategory = searchParams.get('category') ?? '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
      ]);
      setCategories(catsRes.data ?? []);

      let query = supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (activeCategory) {
        const cat = catsRes.data?.find((c) => c.slug === activeCategory);
        if (cat) query = query.eq('category_id', cat.id);
      }

      const { data } = await query;
      let filtered = (data as Post[]) ?? [];

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.excerpt ?? '').toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            (p.categories?.name ?? '').toLowerCase().includes(q)
        );
      }

      setPosts(filtered);
      setLoading(false);
    };

    fetchData();
  }, [searchQuery, activeCategory]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get('q') as string).trim();
    setSearchParams(q ? { q } : {});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-card border-b border-border py-10">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-blog-heading mb-2">Blog</h1>
            <p className="font-body text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}{searchQuery ? ` for "${searchQuery}"` : ''}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  name="q"
                  defaultValue={searchQuery}
                  type="text"
                  placeholder="Search posts by title, keyword, or category..."
                  className="w-full pl-9 pr-4 py-2 text-sm font-body border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              to="/blog"
              className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                !activeCategory
                  ? 'border-primary text-primary bg-primary/8 font-medium'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              All Posts
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/blog?category=${cat.slug}`}
                className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                  activeCategory === cat.slug
                    ? 'border-primary text-primary bg-primary/8 font-medium'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                <Tag className="h-2.5 w-2.5" />
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Posts grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-blog-heading mb-2">No posts found</p>
              <p className="font-body text-muted-foreground">
                {searchQuery ? `No results for "${searchQuery}". Try a different keyword.` : 'No posts published yet. Check back soon!'}
              </p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
