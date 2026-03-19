import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Eye, Calendar, Tag, Download, FileText, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CommentSection from '@/components/CommentSection';
import type { Database } from '@/integrations/supabase/types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
};

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    const { data } = await supabase
      .from('posts')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!data) { setNotFound(true); setLoading(false); return; }
    setPost(data as Post);
    setLoading(false);

    // Increment views
    await supabase.rpc('increment_post_views', { post_slug: slug });
  }, [slug]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const downloadMarkdown = () => {
    if (!post) return;
    const blob = new Blob([post.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    window.print();
  };

  const date = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : post
    ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="aspect-video bg-muted rounded-lg" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-muted rounded" />)}
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-4xl font-bold text-blog-heading mb-4">Post Not Found</h1>
          <p className="font-body text-muted-foreground mb-6">The post you're looking for doesn't exist or isn't published yet.</p>
          <Link to="/blog" className="font-body text-primary hover:underline">← Back to Blog</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <article className="container mx-auto px-4 py-10 max-w-3xl print:py-0" id="post-content">
          {/* Breadcrumb */}
          <nav className="mb-6 print:hidden">
            <Link to="/blog" className="text-sm font-body text-muted-foreground hover:text-primary transition-colors">
              ← Back to Blog
            </Link>
          </nav>

          {/* Meta */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {post.categories && (
              <Link
                to={`/category/${post.categories.slug}`}
                className="inline-flex items-center gap-1 text-xs font-body font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full hover:bg-primary/15 transition-colors print:hidden"
              >
                <Tag className="h-2.5 w-2.5" />
                {post.categories.name}
              </Link>
            )}
            <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
              <Calendar className="h-3 w-3 print:hidden" />
              {date}
            </span>
            <span className="flex items-center gap-1 text-xs font-body text-muted-foreground print:hidden">
              <Eye className="h-3 w-3" />
              {post.views.toLocaleString()} views
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-blog-heading mb-3 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          <p className="font-body text-sm text-muted-foreground mb-6">
            By <span className="font-medium text-blog-heading">{post.author}</span>
          </p>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full object-cover max-h-[400px]"
              />
            </div>
          )}

          {/* Content */}
          <div className="blog-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  return isInline ? (
                    <code className={className} {...props}>{children}</code>
                  ) : (
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Download buttons */}
          <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-3 print:hidden">
            <p className="w-full text-sm font-body text-muted-foreground mb-1">Download this post:</p>
            <button
              onClick={downloadMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-medium border border-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
            >
              <FileText className="h-4 w-4" />
              Download as Markdown
            </button>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-medium border border-border rounded-lg text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              Download as PDF
            </button>
          </div>

          {/* Comments */}
          <div className="mt-12 print:hidden">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold text-blog-heading">Comments</h2>
            </div>
            <CommentSection postId={post.id} />
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
