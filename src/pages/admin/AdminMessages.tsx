import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Mail, Trash2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    toast({ title: 'Message deleted' });
    fetchMessages();
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-blog-heading mb-6">Contact Messages</h1>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center font-body text-muted-foreground text-sm">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="p-10 text-center">
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-body text-muted-foreground text-sm">No messages yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((m) => (
                <div key={m.id} className={`p-4 ${!m.is_read ? 'bg-primary/3' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-body font-semibold text-blog-heading">{m.name}</span>
                        <a href={`mailto:${m.email}`} className="text-xs font-body text-primary hover:underline">{m.email}</a>
                        <span className="text-xs font-body text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
                        {!m.is_read && (
                          <span className="text-xs font-body font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-sm font-body text-blog-body leading-relaxed">{m.message}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!m.is_read && (
                        <button onClick={() => markRead(m.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" title="Mark as read">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => deleteMessage(m.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
