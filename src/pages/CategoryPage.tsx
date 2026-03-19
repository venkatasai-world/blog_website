import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PostCard from '@/components/PostCard';
import type { Database } from '@/integrations/supabase/types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Database['public']['Tables']['categories']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      setCategory(cat);
      if (!cat) { setLoading(false); return; }

      const { data } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('is_published', true)
        .eq('category_id', cat.id)
        .order('published_at', { ascending: false });

      setPosts((data as Post[]) ?? []);
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="bg-card border-b border-border py-10">
          <div className="container mx-auto px-4">
            <nav className="mb-3">
              <Link to="/blog" className="text-sm font-body text-muted-foreground hover:text-primary">
                ← Blog
              </Link>
            </nav>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ) : category ? (
              <>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-blog-heading mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="font-body text-muted-foreground">{category.description}</p>
                )}
              </>
            ) : (
              <h1 className="font-display text-3xl font-bold text-blog-heading">Category Not Found</h1>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded" />
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
              <p className="font-display text-2xl text-blog-heading mb-2">No posts yet</p>
              <p className="font-body text-muted-foreground">No published posts in this category.</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
