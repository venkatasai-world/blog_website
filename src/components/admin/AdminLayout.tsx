import { useEffect, useState, ReactNode } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard, FileText, Tag, Navigation, MessageSquare, Mail,
  LogOut, Menu, X, ChevronRight, PenSquare
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/posts/new', label: 'New Post', icon: PenSquare },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/navigation', label: 'Navigation', icon: Navigation },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Set up auth listener BEFORE getSession to avoid lock races
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setIsAdmin(false);
        return;
      }
      // Use setTimeout to avoid deadlock inside the auth callback
      setTimeout(async () => {
        const { data } = await supabase.rpc('is_admin');
        setIsAdmin(data === true);
      }, 0);
    });

    // Then restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setIsAdmin(false); return; }
      supabase.rpc('is_admin').then(({ data }) => setIsAdmin(data === true));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/admin/login" replace />;
  }

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href) && href !== '/admin';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
        {/* Brand */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="block">
            <h2 className="font-display text-base font-bold text-blog-heading leading-snug">VenkataSai Merugu</h2>
            <p className="text-xs font-body text-muted-foreground">Admin Panel</p>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-2.5 px-3 py-2 text-sm font-body rounded-md transition-colors duration-150
                ${isActive(href, exact)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-body text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs font-body text-muted-foreground">
            <span>Admin</span>
            {location.pathname !== '/admin' && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground capitalize">
                  {location.pathname.split('/').filter(Boolean).slice(1).join(' / ')}
                </span>
              </>
            )}
          </nav>

          <Link
            to="/"
            target="_blank"
            className="text-xs font-body text-muted-foreground hover:text-primary transition-colors"
          >
            View Blog ↗
          </Link>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
