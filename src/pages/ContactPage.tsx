import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Loader2, Mail, MapPin, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (error) {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
      return;
    }

    // Send email notification to blog owner
    const { error: fnError } = await supabase.functions.invoke('send-contact-email', {
      body: { name: data.name, email: data.email, message: data.message },
    });

    if (fnError) {
      console.error('Edge function failed to send email:', fnError);
    }

    setSubmitted(true);
    reset();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="bg-card border-b border-border py-12">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold text-blog-heading mb-2">Get in Touch</h1>
            <p className="font-body text-muted-foreground">Have a question or want to collaborate? Drop me a message!</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-blog-heading">Email</p>
                  <a href="mailto:merugusai112233@gmail.com" className="text-sm font-body text-muted-foreground hover:text-primary transition-colors">
                    merugusai112233@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-blog-heading">Focus Areas</p>
                  <p className="text-sm font-body text-muted-foreground">AI, ML, Automation, Web Dev</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              {submitted ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-blog-heading mb-2">Message Sent!</h3>
                  <p className="font-body text-muted-foreground text-sm mb-4">
                    Thanks for reaching out. I'll get back to you soon at your email address.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm font-body text-primary hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <div>
                      <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Message *</label>
                      <textarea
                        {...register('message')}
                        rows={5}
                        placeholder="Tell me about your project, question, or idea..."
                        className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                      />
                      {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send Message
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
