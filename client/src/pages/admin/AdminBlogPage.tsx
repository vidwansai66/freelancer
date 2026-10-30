import { Field as ListSearch, Pagination as ListPages } from '../../components/common/Forms';
import { api } from '../../services/api';
import { Field, UploadField } from '../../components/common/Forms';
import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, BookOpen, Clock } from 'lucide-react';
import { BlogPost } from '../../types';
import { blogApi } from '../../services/api';

export const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [listPage, setListPage] = useState(1),
    [listPages, setListPages] = useState(1),
    [listSearch, setListSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [seoTitle, setSeoTitle] = useState(''),
    [seoDescription, setSeoDescription] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('Teja Web Studio');
  const [tagsText, setTagsText] = useState('');
  const [readTimeMinutes, setReadTimeMinutes] = useState<number>(5);
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    api
      .get('/blog/admin/all', { params: { page: listPage, limit: 20, search: listSearch } })
      .then((res) => {
        setPosts(res.data.data || []);
        setListPages(res.data.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchPosts();
  }, [listPage, listSearch]);

  const openCreate = () => {
    setEditingId(null);
    setSeoTitle('');
    setSeoDescription('');
    setTitle('');
    setSummary('');
    setContent('## Introduction\n\nWrite your article content here...');
    setCoverImage(
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80',
    );
    setAuthor('Teja Web Studio');
    setTagsText('Web Design, Strategy, Small Business');
    setReadTimeMinutes(5);
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditingId(p._id);
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setTitle(p.title);
    setSummary(p.summary);
    setContent(p.content);
    setCoverImage(p.coverImage || '');
    setAuthor(p.author || 'Teja Web Studio');
    setTagsText(p.tags ? p.tags.join(', ') : '');
    setReadTimeMinutes(p.readTimeMinutes || 5);
    setIsPublished(p.isPublished);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) return;

    setSubmitting(true);
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      seoTitle,
      seoDescription,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      coverImage: coverImage.trim(),
      author: author.trim(),
      tags,
      readTimeMinutes: Number(readTimeMinutes),
      isPublished,
    };

    try {
      if (editingId) {
        await blogApi.update(editingId, payload);
      } else {
        await blogApi.create(payload);
      }
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this article?')) {
      try {
        await blogApi.delete(id);
        fetchPosts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <ListSearch
        label="Search records"
        value={listSearch}
        onChange={(value) => {
          setListSearch(value);
          setListPage(1);
        }}
      />
      <ListPages page={listPage} totalPages={listPages} onChange={setListPage} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog &amp; Articles CMS</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Publish insightful articles, tutorials, and strategy guides.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" /> New Article
        </button>
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading articles...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Author</th>
                  <th className="py-3.5 px-5">Read Time</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Published Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-white">{post.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-sm">
                        {post.summary}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">{post.author}</td>
                    <td className="py-4 px-5 text-muted-foreground">{post.readTimeMinutes} min</td>
                    <td className="py-4 px-5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          post.isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(post)}
                        className="rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white p-2 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white p-2 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Article Editor Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit record"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto"
        >
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative my-8">
            <button
              data-dialog-close
              aria-label="Close"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit Article' : 'Write New Article'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <UploadField
                label="Article cover image"
                currentName={coverImage ? 'Cover image attached' : ''}
                onUploaded={(file) => setCoverImage(file.dataUrl || file.url)}
              />
              <Field label="SEO title" value={seoTitle} onChange={setSeoTitle} />
              <Field label="SEO description" value={seoDescription} onChange={setSeoDescription} />
              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminBlogPage-field-0"
                >
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  id="AdminBlogPage-field-0"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="5 Reasons Your Business Needs a Fast Site..."
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminBlogPage-field-1"
                >
                  Summary / Excerpt *
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  id="AdminBlogPage-field-1"
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief 1-2 sentence teaser for cards and search snippets..."
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminBlogPage-field-2"
                  >
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    id="AdminBlogPage-field-2"
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1"
                    htmlFor="AdminBlogPage-field-3"
                  >
                    Estimated Read Time (Mins)
                  </label>
                  <input
                    type="number"
                    value={readTimeMinutes}
                    id="AdminBlogPage-field-3"
                    onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminBlogPage-field-4"
                >
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  id="AdminBlogPage-field-4"
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Web Design, Speed, SEO"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminBlogPage-field-5"
                >
                  Article Content (Markdown) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  id="AdminBlogPage-field-5"
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none font-mono"
                ></textarea>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <span>Publish Article Immediately (Visible to Public)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  data-dialog-close
                  aria-label="Close"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="glow-card rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
