import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Project } from '../../types';
import { projectsApi, api } from '../../services/api';
import { UploadField, Pagination as ListPages } from '../../components/common/Forms';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listPages, setListPages] = useState(1);
  const [listSearch, setListSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Simplified Modal State (Only important and useful parameters)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [clientName, setClientName] = useState('');
  const [resultStat, setResultStat] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    api
      .get('/projects', { params: { page: listPage, limit: 20, search: listSearch } })
      .then((res) => {
        setProjects(res.data.data || []);
        setListPages(res.data.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [listPage, listSearch]);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Web Application');
    setClientName('');
    setResultStat('Online orders up 40%');
    setFeaturedImage(
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    );
    setLiveUrl('https://example.com');
    setIsFeatured(true);
    setErrorMessage('');
    setSuccessMessage('');
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p._id);
    setTitle(p.title);
    setCategory(p.category || 'Web Application');
    setClientName(p.clientName || p.title);
    setResultStat(p.resultStat || '');
    setFeaturedImage(p.featuredImage);
    setLiveUrl(p.liveUrl || '');
    setIsFeatured(p.isFeatured !== false);
    setErrorMessage('');
    setSuccessMessage('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter a Project Title.');
      return;
    }

    if (!featuredImage.trim()) {
      setErrorMessage('Please provide a Project Screenshot or Image URL.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      category: category.trim() || 'Web Application',
      clientName: clientName.trim() || title.trim(),
      resultStat: resultStat.trim() || 'Live in Production',
      featuredImage: featuredImage.trim(),
      galleryImages: [featuredImage.trim()],
      liveUrl: liveUrl.trim(),
      githubUrl: '',
      technologies: ['Web Studio', 'React'],
      caseStudyMarkdown: `### ${title.trim()}\n\n${resultStat.trim() || 'Modern interactive website built for exceptional user performance.'}`,
      isFeatured,
    };

    try {
      if (editingId) {
        await projectsApi.update(editingId, payload);
      } else {
        await projectsApi.create(payload);
      }
      setSuccessMessage('Case study saved successfully!');
      setTimeout(() => {
        setModalOpen(false);
        fetchProjects();
      }, 400);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error || err.message || 'Failed to save case study. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this case study?')) {
      try {
        await projectsApi.delete(id);
        fetchProjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#203C3D]/15 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#203C3D] tracking-tight">
              Portfolio &amp; Case Studies
            </h1>
            <span className="bg-[#FEDAB8] text-[#203C3D] text-[11px] font-black px-2.5 py-0.5 rounded-full border border-[#F8C89A]">
              {projects.length} Works
            </span>
          </div>
          <p className="text-xs font-bold text-[#4D6768] mt-1">
            Manage your showcase projects, live screenshot previews, and outcome stats.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203C3D] hover:bg-[#162A2B] px-5 py-2.5 text-xs font-black text-[#FEDAB8] shadow-md shadow-[#203C3D]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4 text-[#FEDAB8]" /> Add Case Study
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search projects by title, category, or client..."
          value={listSearch}
          onChange={(e) => {
            setListSearch(e.target.value);
            setListPage(1);
          }}
          className="w-full bg-white border-2 border-[#203C3D]/20 rounded-xl px-4 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8] shadow-sm transition-all"
        />
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#203C3D] font-black animate-pulse">
            Loading case studies...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center text-xs font-bold text-[#4D6768]">
            No case studies found. Click &quot;Add Case Study&quot; to publish your first showcase!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#203C3D] text-[#FEDAB8] font-black uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Project &amp; Screenshot</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Key Outcome</th>
                  <th className="py-3.5 px-5">Showcase</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203C3D]/10">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FFF7EF] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.featuredImage}
                          alt={p.title}
                          className="h-12 w-16 rounded-xl object-cover border border-[#203C3D]/15 bg-[#FAF7F2] shrink-0"
                        />
                        <div>
                          <p className="font-black text-[#111E1F] text-sm">{p.title}</p>
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[#203C3D] hover:text-[#8A4C12] hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>{p.liveUrl.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="h-3 w-3 text-[#203C3D]" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="bg-[#EDF3F3] text-[#203C3D] font-black px-2.5 py-1 rounded-lg border border-[#203C3D]/15 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#111E1F]">
                      {p.resultStat ? (
                        <span className="text-[#203C3D] font-black bg-[#FEDAB8]/60 px-2.5 py-1 rounded-lg border border-[#F8C89A]">
                          {p.resultStat}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          p.isFeatured
                            ? 'bg-[#FEDAB8] text-[#203C3D] border border-[#F8C89A]'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {p.isFeatured ? '★ Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-xl bg-[#203C3D] hover:bg-[#152829] text-[#FEDAB8] p-2 transition-all shadow-sm"
                        title="Edit Case Study"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="rounded-xl bg-rose-100 hover:bg-rose-500 hover:text-white text-rose-800 p-2 transition-all border border-rose-200"
                        title="Delete Case Study"
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

      <ListPages page={listPage} totalPages={listPages} onChange={setListPage} />

      {/* ======================================================== */}
      {/* SIMPLIFIED CASE STUDY MODAL (Fixed header, smooth scroll) */}
      {/* ======================================================== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Case Study Modal"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#142627]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            data-lenis-prevent
            className="w-full max-w-lg rounded-3xl bg-white border-2 border-[#FEDAB8] shadow-2xl flex flex-col max-h-[90vh] my-auto overscroll-contain"
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col h-full max-h-[90vh] min-h-0"
            >
              {/* Sticky Header with Title and Close Button */}
              <div className="p-5 px-6 border-b border-[#203C3D]/10 bg-[#203C3D] text-[#FEDAB8] flex items-center justify-between shrink-0 rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#FEDAB8] text-[#203C3D]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-black tracking-tight text-[#FEDAB8]">
                    {editingId ? 'Edit Case Study' : 'Add New Case Study'}
                  </h3>
                </div>
                <button
                  type="button"
                  data-dialog-close
                  aria-label="Close"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-xl text-[#FEDAB8]/80 hover:text-[#FEDAB8] hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Form Body with min-h-0 and overscroll-contain */}
              <div
                data-lenis-prevent
                className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 overscroll-contain"
              >
                {/* Validation / Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-900 text-xs font-black flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-2 animate-in fade-in">
                    <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Project Title */}
                <div>
                  <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter project title..."
                    className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                  />
                </div>

                {/* Category & Outcome in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. E-Commerce, SaaS, Mobile"
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                      Key Outcome / Metric
                    </label>
                    <input
                      type="text"
                      value={resultStat}
                      onChange={(e) => setResultStat(e.target.value)}
                      placeholder="e.g. Online orders up 40%"
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>
                </div>

                {/* Screenshot / Project Image */}
                <div className="rounded-2xl border-2 border-dashed border-[#203C3D]/30 p-4 bg-[#FBF9F6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#203C3D] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#203C3D]" /> Project Screenshot / Image *
                    </span>
                    {featuredImage && (
                      <span className="text-[10px] font-black text-[#203C3D] bg-[#FEDAB8] px-2 py-0.5 rounded-md">
                        Preview Ready
                      </span>
                    )}
                  </div>

                  <UploadField
                    label="Upload image from computer"
                    onUploaded={(file) => {
                      setFeaturedImage(file.url);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />

                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-[#4D6768] mb-1">
                      Or paste Image / Screenshot URL:
                    </label>
                    <input
                      type="url"
                      required
                      value={featuredImage}
                      onChange={(e) => {
                        setFeaturedImage(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>

                  {featuredImage && (
                    <div className="mt-2">
                      <img
                        src={featuredImage}
                        alt="Screenshot preview"
                        className="h-28 w-full object-cover rounded-xl border border-[#203C3D]/20 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Live Project URL */}
                <div>
                  <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                    Live Website / Demo URL
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://yourclientwebsite.com"
                    className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                  />
                </div>

                {/* Feature on Homepage Toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`h-5 w-5 rounded-md flex items-center justify-center border-2 transition-all ${
                      isFeatured
                        ? 'bg-[#203C3D] border-[#203C3D] text-[#FEDAB8]'
                        : 'bg-white border-[#203C3D]/40'
                    }`}
                  >
                    {isFeatured && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-xs font-black text-[#203C3D]">
                    Showcase on Home Page (Featured Project)
                  </span>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 px-6 border-t border-[#203C3D]/10 bg-[#FAF7F4] flex items-center justify-end gap-3 shrink-0 rounded-b-3xl">
                <button
                  type="button"
                  data-dialog-close
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-black text-[#203C3D] hover:bg-[#203C3D]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#203C3D] hover:bg-[#162A2B] px-6 py-2.5 text-xs font-black text-[#FEDAB8] shadow-md shadow-[#203C3D]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#FEDAB8]" />
                      Saving...
                    </>
                  ) : editingId ? (
                    'Update Case Study'
                  ) : (
                    'Save Case Study'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
