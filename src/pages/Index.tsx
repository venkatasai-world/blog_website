import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PostCard from '@/components/PostCard';
import type { Database } from '@/integrations/supabase/types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
};

export default function Index() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Database['public']['Tables']['categories']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [recentRes, popularRes, catsRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, categories(*)')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(6),
        supabase
          .from('posts')
          .select('*, categories(*)')
          .eq('is_published', true)
          .order('views', { ascending: false })
          .limit(5),
        supabase
          .from('categories')
          .select('*')
          .order('name'),
      ]);

      setRecentPosts((recentRes.data as Post[]) ?? []);
      setPopularPosts((popularRes.data as Post[]) ?? []);
      setCategories(catsRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-card border-b border-border py-16">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <p className="inline-block text-xs font-body font-semibold tracking-widest uppercase text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
              Personal Blog
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-blog-heading mb-4 leading-tight">
              Exploring AI, Tech &amp; Ideas
            </h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
              Sharing insights on Artificial Intelligence, Machine Learning, Web Development, Automation, and more.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary-foreground bg-primary px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              Read All Posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Recent Posts */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl font-semibold text-blog-heading">Recent Posts</h2>
                </div>
                <Link to="/blog" className="text-sm font-body text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
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
              ) : recentPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground font-body">
                  <p className="text-lg">No posts yet. Check back soon!</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Popular Posts */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold text-blog-heading">Popular Posts</h3>
                </div>
                <div className="space-y-3">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="p-3 border border-border rounded-lg animate-pulse">
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    ))
                  ) : popularPosts.length > 0 ? (
                    popularPosts.map((post, idx) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-card transition-all duration-200 group"
                      >
                        <span className="font-display text-2xl font-bold text-border group-hover:text-primary/30 transition-colors leading-none mt-0.5 min-w-[1.5rem]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="text-sm font-body font-medium text-blog-heading group-hover:text-primary transition-colors leading-snug mb-1">
                            {post.title}
                          </h4>
                          <span className="text-xs font-body text-muted-foreground">
                            👁 {post.views.toLocaleString()} views
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm font-body text-muted-foreground">No posts yet.</p>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-display text-xl font-semibold text-blog-heading mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="text-xs font-body px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-200"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* About snippet */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-display text-lg font-semibold text-blog-heading mb-2">About</h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed mb-3">
                  Hi, I'm VenkataSai Merugu, an AI Engineer and Tech Enthusiast passionate about AI, ML, Web Development, and Automation.
                </p>
                <Link to="/about" className="text-sm font-body text-primary hover:underline">
                  Read more →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
