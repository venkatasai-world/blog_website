import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, Eye, EyeOff, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string;
  featured_image_url: string;
  is_published: boolean;
  published_at?: string;
}

const generateSlug = (title: string) =>
  title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [previewMode, setPreviewMode] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const [form, setForm] = useState<PostForm>({
    title: '',
    slug: '',
    content: '# Your Blog Title\n\nStart writing your blog post here...\n\n## Introduction\n\nWrite your introduction.\n\n## Main Content\n\nYour content goes here.\n\n```python\n# Code example\nprint("Hello, World!")\n```\n',
    excerpt: '',
    category_id: '',
    featured_image_url: '',
    is_published: false,
    published_at: '',
  });

  const fetchData = useCallback(async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    setCategories(cats ?? []);

    if (isEditing && id) {
      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt ?? '',
          category_id: data.category_id ?? '',
          featured_image_url: data.featured_image_url ?? '',
          is_published: data.is_published,
          published_at: data.published_at ? data.published_at.slice(0, 16) : '',
        });
      }
    }
  }, [id, isEditing]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const compressImage = (file: File, maxWidth = 1200, quality = 0.75): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Only use compressed version if it's smaller than original
              if (blob.size < file.size) {
                resolve(blob);
              } else {
                // Fallback: use original file as-is
                resolve(file.slice(0, file.size, file.type));
              }
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };
      img.src = url;
    });


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show instant local preview (separate from form URL to avoid blob in text input)
    const localPreview = URL.createObjectURL(file);
    setLocalPreviewUrl(localPreview);
    setUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      const path = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`;
      const { error } = await supabase.storage.from('blog-images').upload(path, compressed, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) {
        setLocalPreviewUrl('');
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      } else {
        const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path);
        URL.revokeObjectURL(localPreview);
        setLocalPreviewUrl('');
        setForm((prev) => ({ ...prev, featured_image_url: publicUrl }));
        toast({ title: 'Image uploaded! ✓' });
      }
    } catch (err) {
      setLocalPreviewUrl('');
      toast({ title: 'Upload failed', description: 'Try a different image.', variant: 'destructive' });
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    const newPublished = publish !== undefined ? publish : form.is_published;

    // Optimistically update UI immediately
    setForm((prev) => ({ ...prev, is_published: newPublished }));
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt,
      featured_image_url: form.featured_image_url,
      is_published: newPublished,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : (newPublished ? new Date().toISOString() : null),
      category_id: form.category_id || null,
    };

    if (isEditing) {
      const { error } = await supabase.from('posts').update(payload).eq('id', id!);
      if (error) {
        // Revert on failure
        setForm((prev) => ({ ...prev, is_published: form.is_published }));
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: newPublished ? 'Post published!' : 'Draft saved!' });
      }
    } else {
      // Navigate immediately, insert in background
      const tempId = crypto.randomUUID();
      navigate(`/admin/posts`);
      const { error } = await supabase.from('posts').insert({ ...payload, id: tempId });
      if (error) {
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: newPublished ? 'Post published!' : 'Draft saved!' });
      }
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/posts')}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl font-bold text-blog-heading">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              {previewMode ? <><EyeOff className="h-3.5 w-3.5" />Editor</> : <><Eye className="h-3.5 w-3.5" />Preview</>}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-medium border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-body font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Save className="h-3.5 w-3.5" />
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title */}
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post Title..."
              className="w-full px-4 py-3 font-display text-xl font-bold text-blog-heading border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:font-body placeholder:text-muted-foreground"
            />

            {/* Slug */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-body text-muted-foreground flex-shrink-0">Slug:</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-2 py-1 text-xs font-body border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors text-muted-foreground"
              />
            </div>

            {/* Content editor / preview */}
            {previewMode ? (
              <div className="border border-border rounded-lg p-6 min-h-[500px] blog-prose">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match;
                      return isInline ? (
                        <code className={className} {...props}>{children}</code>
                      ) : (
                        <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div">
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    },
                  }}
                >
                  {form.content}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post in Markdown..."
                className="w-full h-[500px] px-4 py-3 text-sm font-mono border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none leading-relaxed"
              />
            )}

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Excerpt (optional)</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                placeholder="Short description shown in post cards..."
                className="w-full px-3 py-2 text-sm font-body border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-body text-blog-heading">
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
                <button
                  onClick={() => setForm((prev) => ({ ...prev, is_published: !prev.is_published }))}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                    form.is_published ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                    form.is_published ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Publish Date */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">Publish Date</h3>
              <input
                type="datetime-local"
                value={form.published_at || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, published_at: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug">
                Leave blank to auto-set when publishing. Set a custom date for backdating posts.
              </p>
            </div>

            {/* Category */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">Category</h3>
              <select
                value={form.category_id}
                onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-body border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">Featured Image</h3>
              {(localPreviewUrl || form.featured_image_url) && (
                <div className="mb-3 rounded-md overflow-hidden border border-border aspect-video relative group">
                  <img src={localPreviewUrl || form.featured_image_url} alt="Featured" className="w-full h-full object-cover" />
                  {!uploadingImage && (
                    <button
                      type="button"
                      onClick={() => { setForm((prev) => ({ ...prev, featured_image_url: '' })); setLocalPreviewUrl(''); }}
                      className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  )}
                </div>
              )}
              <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-xs font-body border rounded-md transition-colors w-full justify-center ${uploadingImage ? 'border-primary text-primary bg-primary/5 cursor-wait' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary'}`}>
                {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploadingImage ? 'Compressing & uploading…' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={handleImageUpload} />
              </label>
              {uploadingImage && (
                <p className="mt-1.5 text-[10px] text-muted-foreground text-center">Compressing image for faster load…</p>
              )}
              <input
                type="text"
                value={form.featured_image_url}
                onChange={(e) => setForm((prev) => ({ ...prev, featured_image_url: e.target.value }))}
                placeholder="Or paste image URL"
                className="mt-2 w-full px-2 py-1.5 text-xs font-body border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            {/* Markdown hints */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">Markdown Quick Reference</h3>
              <div className="space-y-1 text-xs font-mono text-muted-foreground">
                {[
                  ['# Heading 1', '## Heading 2'],
                  ['**bold**', '*italic*'],
                  ['[link](url)', '![img](url)'],
                  ['```lang', 'code block'],
                  ['- list item', '1. ordered'],
                  ['> blockquote', '---'],
                ].map(([a, b], i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex-1">{a}</span>
                    <span className="flex-1">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
