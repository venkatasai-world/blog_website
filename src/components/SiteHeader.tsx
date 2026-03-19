import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavItems } from '@/hooks/useNavItems';

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navItems } = useNavItems();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      {/* Brand */}
      <div className="container mx-auto px-4 pt-6 pb-3 text-center">
        <Link to="/" className="group inline-block">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-blog-heading tracking-tight leading-tight transition-opacity group-hover:opacity-80">
            VenkataSai Merugu
          </h1>
          <p className="font-body text-sm md:text-base text-muted-foreground mt-1 tracking-widest uppercase">
            AI Engineer &amp; Tech Enthusiast
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="border-t border-border">
        <div className="container mx-auto px-4">
          {/* Desktop nav */}
          <ul className="hidden md:flex items-center justify-center gap-1 py-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`
                    relative px-3 py-2 text-sm font-medium font-body transition-colors duration-200 rounded-md
                    ${isActive(item.href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center justify-between py-2">
            <span className="text-sm font-body text-muted-foreground">Menu</span>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <ul className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      block px-3 py-2 text-sm font-body rounded-md transition-colors duration-200
                      ${isActive(item.href)
                        ? 'text-primary bg-primary/5 font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
