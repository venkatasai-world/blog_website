import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Comment = Database['public']['Tables']['comments']['Row'];

const commentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  content: z.string().trim().min(3, 'Comment is too short').max(2000),
});
type CommentForm = z.infer<typeof commentSchema>;

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  });

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const onSubmit = async (data: CommentForm) => {
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      name: data.name,
      email: data.email,
      content: data.content,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to submit comment.', variant: 'destructive' });
    } else {
      toast({ title: 'Comment submitted!', description: 'Your comment has been posted.' });
      reset();
      fetchComments();
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div>
      {/* Existing comments */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse space-y-2">
              <div className="h-3 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-xs font-body font-medium text-primary">
                      {comment.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-body text-sm font-medium text-blog-heading">{comment.name}</span>
                </div>
                <span className="text-xs font-body text-muted-foreground">{formatDate(comment.created_at)}</span>
              </div>
              <p className="font-body text-sm text-blog-body leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          No comments yet. Be the first to comment!
        </p>
      )}

      {/* Comment form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-display text-lg font-semibold text-blog-heading mb-4">Leave a Comment</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Name *</label>
              <input
                {...register('name')}
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Email *</label>
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Comment *</label>
            <textarea
              {...register('content')}
              rows={4}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
            {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
}
