import { Link } from 'react-router-dom';
import { Eye, Calendar, Tag } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
};

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <article className="group bg-background border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5">
      {post.featured_image_url && (
        <Link to={`/blog/${post.slug}`}>
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="p-5">
        {/* Category + Date row */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {post.categories && (
            <Link
              to={`/category/${post.categories.slug}`}
              className="inline-flex items-center gap-1 text-xs font-body font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full hover:bg-primary/15 transition-colors"
            >
              <Tag className="h-2.5 w-2.5" />
              {post.categories.name}
            </Link>
          )}
          <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-xl font-semibold text-blog-heading mb-2 leading-snug">
          <Link
            to={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors duration-200"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <span className="text-xs font-body text-muted-foreground">
            By {post.author}
          </span>
          <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
            <Eye className="h-3 w-3" />
            {post.views.toLocaleString()} views
          </span>
        </div>
      </div>
    </article>
  );
}
