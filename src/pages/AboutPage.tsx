import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Cpu, Globe, Shield, Code2 } from 'lucide-react';

const interests = [
  { icon: Cpu, label: 'Artificial Intelligence' },
  { icon: Code2, label: 'Machine Learning' },
  { icon: Globe, label: 'Web Development' },
  { icon: Shield, label: 'Automation' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="bg-card border-b border-border py-12">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5">
              <span className="font-display text-2xl font-bold text-primary">VM</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-blog-heading mb-2">VenkataSai Merugu</h1>
            <p className="font-body text-muted-foreground tracking-widest uppercase text-sm">AI Engineer &amp; Tech Enthusiast</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="font-display text-2xl font-semibold text-blog-heading mb-4">About Me</h2>
            <p className="font-body text-blog-body leading-relaxed text-lg">
              Hi, I'm VenkataSai Merugu, an AI Engineer and Tech Enthusiast passionate about Artificial Intelligence, Machine Learning, Web Development, and Automation. This website is where I share my knowledge, thoughts, and technical insights.
            </p>
          </div>

          <h3 className="font-display text-xl font-semibold text-blog-heading mb-4">Areas of Interest</h3>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {interests.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-body text-sm font-medium text-blog-heading">{label}</span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-display text-xl font-semibold text-blog-heading mb-3">Get in Touch</h3>
            <p className="font-body text-muted-foreground text-sm mb-4">
              Have a question, collaboration idea, or just want to chat about tech? I'd love to hear from you!
            </p>
            <a
              href="mailto:meruguvenkat67@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Send an Email
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
