import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, MessageSquare, Mail, Tag, PenSquare, Eye } from 'lucide-react';

interface Stats {
  posts: number;
  comments: number;
  messages: number;
  categories: number;
  unreadMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [postsRes, commentsRes, messagesRes, catsRes, unreadRes, recentRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('posts').select('id, title, slug, views, is_published, created_at').order('created_at', { ascending: false }).limit(5),
      ]);
      setStats({
        posts: postsRes.count ?? 0,
        comments: commentsRes.count ?? 0,
        messages: messagesRes.count ?? 0,
        categories: catsRes.count ?? 0,
        unreadMessages: unreadRes.count ?? 0,
      });
      setRecentPosts(recentRes.data ?? []);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Posts', value: stats?.posts, icon: FileText, href: '/admin/posts', color: 'text-blue-500 bg-blue-50' },
    { label: 'Comments', value: stats?.comments, icon: MessageSquare, href: '/admin/comments', color: 'text-green-500 bg-green-50' },
    { label: 'Messages', value: stats?.messages, icon: Mail, href: '/admin/messages', badge: stats?.unreadMessages, color: 'text-orange-500 bg-orange-50' },
    { label: 'Categories', value: stats?.categories, icon: Tag, href: '/admin/categories', color: 'text-purple-500 bg-purple-50' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-blog-heading">Dashboard</h1>
            <p className="font-body text-sm text-muted-foreground">Welcome back, VenkataSai!</p>
          </div>
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PenSquare className="h-4 w-4" />
            New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, href, badge, color }) => (
            <Link
              key={label}
              to={href}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-card transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {badge !== undefined && badge > 0 && (
                  <span className="text-xs font-body font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                    {badge} new
                  </span>
                )}
              </div>
              <div className="font-display text-2xl font-bold text-blog-heading">
                {value ?? '—'}
              </div>
              <div className="text-xs font-body text-muted-foreground mt-0.5">{label}</div>
            </Link>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display text-base font-semibold text-blog-heading">Recent Posts</h2>
            <Link to="/admin/posts" className="text-xs font-body text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPosts.length === 0 ? (
              <div className="p-8 text-center text-sm font-body text-muted-foreground">
                No posts yet. <Link to="/admin/posts/new" className="text-primary hover:underline">Create your first post.</Link>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium text-blog-heading truncate">{post.title}</p>
                    <p className="text-xs font-body text-muted-foreground mt-0.5">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </span>
                    <span className={`text-xs font-body px-2 py-0.5 rounded-full ${
                      post.is_published
                        ? 'text-green-700 bg-green-50'
                        : 'text-orange-700 bg-orange-50'
                    }`}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                    <Link
                      to={`/admin/posts/${post.id}/edit`}
                      className="text-xs font-body text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
