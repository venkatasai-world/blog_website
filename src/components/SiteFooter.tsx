import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg font-semibold text-blog-heading mb-2">VenkataSai Merugu</h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              AI Engineer &amp; Tech Enthusiast sharing knowledge on AI, ML, Programming, and Automation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-sm font-semibold text-blog-heading uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-1.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-body text-sm font-semibold text-blog-heading uppercase tracking-wider mb-3">Connect</h4>
            <div className="flex gap-3 mb-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-200"
                aria-label="Twitter / X"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:merugusai112233@gmail.com"
                className="p-2 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm font-body text-muted-foreground">
              merugusai112233@gmail.com
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm font-body text-muted-foreground">
            © 2026 VenkataSai Merugu. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-xs font-body text-muted-foreground">
              AI Engineer &amp; Tech Enthusiast
            </p>
            <Link
              to="/admin/login"
              className="text-xs font-body text-muted-foreground/40 hover:text-primary transition-colors duration-200 border border-border/40 hover:border-primary/50 px-2 py-0.5 rounded"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
