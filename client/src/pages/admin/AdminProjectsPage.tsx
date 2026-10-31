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
  Eye,
  ArrowUp,
  ArrowDown,
  Globe,
  FileText,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Project } from '../../types';
import { projectsApi } from '../../services/api';
import { UploadField, Pagination as ListPages } from '../../components/common/Forms';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listPages, setListPages] = useState(1);
  const [listSearch, setListSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'core' | 'media' | 'story' | 'seo'>('core');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [industry, setIndustry] = useState('');
  const [clientName, setClientName] = useState('');
  const [resultStat, setResultStat] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [objectives, setObjectives] = useState('');
  const [challenges, setChallenges] = useState('');
  const [solutions, setSolutions] = useState('');
  const [results, setResults] = useState('');
  const [technologiesText, setTechnologiesText] = useState('React, TypeScript, Tailwind CSS');
  const [servicesDeliveredText, setServicesDeliveredText] = useState('Web Design, Full-Stack Development');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isFeatured, setIsFeatured] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    projectsApi
      .getAll({
        page: listPage,
        limit: 50,
        search: listSearch || undefined,
        status: statusFilter === 'all' ? 'all' : statusFilter,
      })
      .then((res) => {
        setProjects(res.data || []);
        setListPages(res.meta?.totalPages || res.totalPages || 1);
      })
      .catch((err) => console.error('Failed to load projects:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [listPage, listSearch, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setActiveTab('core');
    setTitle('');
    setSlug('');
    setCategory('Web Application');
    setIndustry('');
    setClientName('');
    setResultStat('');
    setLiveUrl('');
    setFeaturedImage('');
    setImageMode('upload');
    setGalleryImages([]);
    setSummary('');
    setObjectives('');
    setChallenges('');
    setSolutions('');
    setResults('');
    setTechnologiesText('React, TypeScript, Tailwind CSS');
    setServicesDeliveredText('Web Design, Full-Stack Development');
    setSeoTitle('');
    setSeoDescription('');
    setStatus('published');
    setIsFeatured(true);
    setErrorMessage('');
    setSuccessMessage('');
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p._id);
    setActiveTab('core');
    setTitle(p.title || '');
    setSlug(p.slug || '');
    setCategory(p.category || 'Web Application');
    setIndustry(p.industry || '');
    setClientName(p.clientName || p.title || '');
    setResultStat(p.resultStat || '');
    setLiveUrl(p.liveUrl || '');
    setFeaturedImage(p.featuredImage || '');
    setImageMode(
      p.featuredImage?.startsWith('data:') || p.featuredImage?.startsWith('/api/files/')
        ? 'upload'
        : 'url',
    );
    setGalleryImages(Array.isArray(p.galleryImages) ? p.galleryImages : []);
    setSummary(p.summary || '');
    setObjectives(p.objectives || '');
    setChallenges(p.challenges || '');
    setSolutions(p.solutions || '');
    setResults(p.results || '');
    setTechnologiesText(Array.isArray(p.technologies) ? p.technologies.join(', ') : 'React, TypeScript');
    setServicesDeliveredText(
      Array.isArray(p.servicesDelivered) ? p.servicesDelivered.join(', ') : 'Web Design, Full-Stack Development',
    );
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setStatus(p.status === 'draft' ? 'draft' : 'published');
    setIsFeatured(p.isFeatured !== false);
    setErrorMessage('');
    setSuccessMessage('');
    setModalOpen(true);
  };

  const handleSave = async (intendedStatus?: 'published' | 'draft') => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim()) {
      setActiveTab('core');
      setErrorMessage('Please enter a Project Title.');
      return;
    }

    if (!featuredImage.trim()) {
      setActiveTab('media');
      setErrorMessage('Please upload a project screenshot or provide an image link.');
      return;
    }

    let cleanLiveUrl = liveUrl.trim();
    if (cleanLiveUrl && !/^https?:\/\//i.test(cleanLiveUrl)) {
      cleanLiveUrl = `https://${cleanLiveUrl}`;
    }

    const effectiveStatus = intendedStatus || status;

    const techArray = technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const servicesArray = servicesDeliveredText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const generatedMarkdown = [
      `### ${title.trim()}`,
      summary.trim(),
      objectives.trim() ? `#### Project Objectives\n${objectives.trim()}` : '',
      challenges.trim() ? `#### The Challenges\n${challenges.trim()}` : '',
      solutions.trim() ? `#### The Solution\n${solutions.trim()}` : '',
      results.trim() ? `#### Measurable Results\n${results.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const payload: any = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim() || 'Web Application',
      industry: industry.trim() || undefined,
      clientName: clientName.trim() || title.trim(),
      resultStat: resultStat.trim() || undefined,
      summary: summary.trim() || undefined,
      objectives: objectives.trim() || undefined,
      challenges: challenges.trim() || undefined,
      solutions: solutions.trim() || undefined,
      results: results.trim() || undefined,
      featuredImage: featuredImage.trim(),
      galleryImages: galleryImages.length > 0 ? galleryImages : [featuredImage.trim()],
      liveUrl: cleanLiveUrl,
      githubUrl: '',
      technologies: techArray.length > 0 ? techArray : ['Web Studio', 'React'],
      servicesDelivered: servicesArray.length > 0 ? servicesArray : ['Full-Stack Development'],
      caseStudyMarkdown: generatedMarkdown,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      status: effectiveStatus,
      isFeatured,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await projectsApi.update(editingId, payload);
      } else {
        await projectsApi.create(payload);
      }
      setSuccessMessage(
        effectiveStatus === 'published'
          ? 'Case study published successfully to the website!'
          : 'Case study saved as private draft.',
      );
      setTimeout(() => {
        setModalOpen(false);
        fetchProjects();
      }, 500);
    } catch (err: any) {
      console.error('Case study save error:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to save case study to database. Please review your input.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublishStatus = async (p: Project) => {
    const nextStatus = p.status === 'draft' ? 'published' : 'draft';
    try {
      await projectsApi.update(p._id, { status: nextStatus });
      fetchProjects();
    } catch (err: any) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleFeatured = async (p: Project) => {
    try {
      await projectsApi.update(p._id, { isFeatured: !p.isFeatured });
      fetchProjects();
    } catch (err: any) {
      alert('Failed to update featured state: ' + (err.response?.data?.error || err.message));
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const copy = [...projects];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const orders = copy.map((p, idx) => ({ id: p._id, orderIndex: idx }));
    try {
      await projectsApi.reorder(orders);
      fetchProjects();
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  const handleDelete = async (id: string, titleName: string) => {
    if (window.confirm(`Permanently delete "${titleName}"? This cannot be undone.`)) {
      try {
        await projectsApi.delete(id);
        fetchProjects();
      } catch (err: any) {
        alert('Delete failed: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#203C3D]/15 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#203C3D] tracking-tight">
            Case Studies &amp; Portfolio CMS
          </h1>
          <p className="text-xs font-bold text-[#4D6768] mt-1">
            Manage agency portfolio entries, publish client case studies, and organize homepage showcase.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#203C3D] hover:bg-[#162A2B] px-5 py-2.5 text-xs font-black text-[#FEDAB8] transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 text-[#FEDAB8]" />
          <span>Add New Case Study</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex rounded-xl bg-[#203C3D]/10 p-1 gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              statusFilter === 'all'
                ? 'bg-[#203C3D] text-[#FEDAB8] shadow-xs'
                : 'text-[#203C3D] hover:bg-white/60'
            }`}
          >
            All Entries ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              statusFilter === 'published'
                ? 'bg-[#203C3D] text-[#FEDAB8] shadow-xs'
                : 'text-[#203C3D] hover:bg-white/60'
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              statusFilter === 'draft'
                ? 'bg-[#203C3D] text-[#FEDAB8] shadow-xs'
                : 'text-[#203C3D] hover:bg-white/60'
            }`}
          >
            Drafts
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            placeholder="Search by title, client, or category..."
            className="w-full rounded-xl border-2 border-[#203C3D]/20 bg-white px-3.5 py-2 text-xs font-bold text-[#111E1F] focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#203C3D] mx-auto" />
            <p className="text-xs font-bold text-[#4D6768] mt-2">Loading case studies from database...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="h-12 w-12 rounded-2xl bg-[#FEDAB8] text-[#203C3D] flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-[#111E1F]">No case studies found</h3>
            <p className="text-xs font-bold text-[#4D6768] mt-1 max-w-sm mx-auto">
              {listSearch ? 'No projects match your search.' : 'Create your first agency case study to showcase on the live website.'}
            </p>
            <button
              onClick={openCreate}
              className="mt-4 rounded-xl bg-[#203C3D] text-[#FEDAB8] px-4 py-2 text-xs font-black inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Case Study
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#203C3D] text-[#FEDAB8] text-[11px] font-black uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-14">Order</th>
                  <th className="py-3 px-4">Case Study</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Result Metric</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203C3D]/10">
                {projects.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-[#FBF9F6] transition-colors">
                    {/* Order Controls */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveOrder(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 rounded-md text-[#203C3D] hover:bg-[#FEDAB8] disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveOrder(idx, 'down')}
                          disabled={idx === projects.length - 1}
                          title="Move Down"
                          className="p-1 rounded-md text-[#203C3D] hover:bg-[#FEDAB8] disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Thumbnail and Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.featuredImage}
                          alt={p.title}
                          className="h-12 w-16 rounded-lg object-cover border border-[#203C3D]/20 bg-black/5 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div>
                          <p className="font-black text-[#111E1F] text-xs sm:text-sm">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.clientName && p.clientName !== p.title && (
                              <span className="text-[10px] text-[#4D6768] font-bold">Client: {p.clientName}</span>
                            )}
                            {p.liveUrl && (
                              <a
                                href={p.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-[#203C3D] hover:text-[#8A4C12] inline-flex items-center gap-0.5 underline"
                              >
                                <span>Demo</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-[#EDF3F3] text-[#203C3D] font-black px-2.5 py-1 rounded-lg border border-[#203C3D]/15 text-[10px]">
                        {p.category}
                      </span>
                    </td>

                    {/* Metric */}
                    <td className="py-3.5 px-4 font-bold text-[#111E1F] whitespace-nowrap">
                      {p.resultStat ? (
                        <span className="text-[#203C3D] font-black bg-[#FEDAB8]/60 px-2.5 py-1 rounded-lg border border-[#F8C89A] text-[10px]">
                          {p.resultStat}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Publication Status Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => togglePublishStatus(p)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black transition-all border ${
                          p.status === 'draft'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {p.status === 'draft' ? '● Draft (Private)' : '✓ Published'}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black transition-all border ${
                          p.isFeatured
                            ? 'bg-[#FEDAB8] text-[#203C3D] border-[#F8C89A] hover:bg-[#F8C89A]'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                        }`}
                        title="Click to toggle homepage showcase"
                      >
                        {p.isFeatured ? '★ Featured' : 'Standard'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <a
                        href={`/portfolio/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[#203C3D] p-2 transition-all border border-zinc-200"
                        title="View Public Page"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-xl bg-[#203C3D] hover:bg-[#152829] text-[#FEDAB8] p-2 transition-all shadow-sm"
                        title="Edit Case Study"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id, p.title)}
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
      {/* CASE STUDY EDITOR MODAL (Tabs, Validation, Persistence)  */}
      {/* ======================================================== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Case Study Editor"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#142627]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            data-lenis-prevent
            className="w-full max-w-2xl rounded-3xl bg-white border-2 border-[#FEDAB8] shadow-2xl flex flex-col max-h-[92vh] my-auto overscroll-contain"
          >
            {/* Header */}
            <div className="p-5 px-6 border-b border-[#203C3D]/10 bg-[#203C3D] text-[#FEDAB8] flex items-center justify-between shrink-0 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FEDAB8] text-[#203C3D]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-[#FEDAB8]">
                    {editingId ? 'Edit Case Study' : 'Create New Case Study'}
                  </h3>
                  <p className="text-[10px] font-bold text-[#FEDAB8]/70">
                    Saves directly to persistent storage. Available immediately on client website.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-[#FEDAB8]/80 hover:text-[#FEDAB8] hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#203C3D]/10 bg-[#FBF9F6] px-6 pt-2 shrink-0 overflow-x-auto gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('core')}
                className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'core'
                    ? 'border-[#203C3D] text-[#203C3D]'
                    : 'border-transparent text-[#4D6768] hover:text-[#203C3D]'
                }`}
              >
                1. Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'media'
                    ? 'border-[#203C3D] text-[#203C3D]'
                    : 'border-transparent text-[#4D6768] hover:text-[#203C3D]'
                }`}
              >
                2. Screenshot &amp; Media
                {featuredImage && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('story')}
                className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'story'
                    ? 'border-[#203C3D] text-[#203C3D]'
                    : 'border-transparent text-[#4D6768] hover:text-[#203C3D]'
                }`}
              >
                3. Case Study Story
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'seo'
                    ? 'border-[#203C3D] text-[#203C3D]'
                    : 'border-transparent text-[#4D6768] hover:text-[#203C3D]'
                }`}
              >
                4. Publishing &amp; SEO
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 overscroll-contain">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-900 text-xs font-black flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-2 animate-in fade-in">
                  <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* TAB 1: BASIC INFO */}
              {activeTab === 'core' && (
                <div className="space-y-4 animate-in fade-in">
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
                        if (!editingId && !slug) {
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)/g, ''),
                          );
                        }
                      }}
                      placeholder="e.g. Bean & Bloom Coffee, Farrow & Ball"
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>

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
                        placeholder="e.g. E-Commerce, Web Application, SaaS"
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                        Industry (Optional)
                      </label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. Retail, FinTech, Hospitality"
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                        Client / Brand Name
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Bean & Bloom Roasters"
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                        Key Outcome Metric
                      </label>
                      <input
                        type="text"
                        value={resultStat}
                        onChange={(e) => setResultStat(e.target.value)}
                        placeholder="e.g. Online orders up 40%, 3.5x conversion"
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                      Live Website / Demo URL
                    </label>
                    <input
                      type="text"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="e.g. https://www.farrow-ball.com or farrow-ball.com"
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2.5 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SCREENSHOT & MEDIA */}
              {activeTab === 'media' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="rounded-2xl border-2 border-dashed border-[#203C3D]/30 p-4 bg-[#FBF9F6] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#203C3D] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-[#203C3D]" /> Primary Project Screenshot *
                      </span>
                      {featuredImage && (
                        <span className="text-[10px] font-black text-[#203C3D] bg-[#FEDAB8] px-2.5 py-0.5 rounded-full border border-[#F8C89A]">
                          ✓ Screenshot Ready
                        </span>
                      )}
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="flex rounded-xl bg-[#203C3D]/10 p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                          imageMode === 'upload'
                            ? 'bg-[#203C3D] text-[#FEDAB8] shadow-xs'
                            : 'text-[#203C3D] hover:bg-white/60'
                        }`}
                      >
                        Upload from Computer
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                          imageMode === 'url'
                            ? 'bg-[#203C3D] text-[#FEDAB8] shadow-xs'
                            : 'text-[#203C3D] hover:bg-white/60'
                        }`}
                      >
                        Or Paste Image Link
                      </button>
                    </div>

                    {imageMode === 'upload' ? (
                      <div className="pt-1">
                        <UploadField
                          label="Choose screenshot file"
                          visibility="public"
                          currentName={
                            featuredImage
                              ? featuredImage.startsWith('data:')
                                ? 'Screenshot compressed & attached'
                                : 'Existing image attached'
                              : ''
                          }
                          onUploaded={(file) => {
                            setFeaturedImage(file.dataUrl || file.url);
                            if (errorMessage) setErrorMessage('');
                          }}
                        />
                      </div>
                    ) : (
                      <div className="pt-1 space-y-1">
                        <label className="block text-[11px] font-bold text-[#4D6768]">Image Link / URL:</label>
                        <input
                          type="text"
                          value={featuredImage}
                          onChange={(e) => {
                            setFeaturedImage(e.target.value.trim());
                            if (errorMessage) setErrorMessage('');
                          }}
                          placeholder="https://images.unsplash.com/... or /images/..."
                          className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                        />
                      </div>
                    )}

                    {/* Active Image Preview */}
                    {featuredImage && (
                      <div className="mt-2 relative rounded-xl overflow-hidden border-2 border-[#203C3D]/20 shadow-sm bg-black/5">
                        <img
                          src={featuredImage}
                          alt="Screenshot preview"
                          className="h-36 w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#203C3D] bg-white/95 px-2 py-0.5 rounded-md shadow-xs">
                            Active Preview
                          </span>
                          <button
                            type="button"
                            onClick={() => setFeaturedImage('')}
                            className="text-[10px] font-black text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 px-2 py-0.5 rounded-md shadow-xs transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CASE STUDY STORY */}
              {activeTab === 'story' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                      Short Summary / Elevator Pitch
                    </label>
                    <textarea
                      rows={2}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Brief 1-2 sentence overview of the project and its value proposition..."
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                        Technologies Used
                      </label>
                      <input
                        type="text"
                        value={technologiesText}
                        onChange={(e) => setTechnologiesText(e.target.value)}
                        placeholder="React, TypeScript, Tailwind CSS, Vite"
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                        Services Delivered
                      </label>
                      <input
                        type="text"
                        value={servicesDeliveredText}
                        onChange={(e) => setServicesDeliveredText(e.target.value)}
                        placeholder="UI/UX Design, Frontend, API Integration"
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                      Project Objectives
                    </label>
                    <textarea
                      rows={2}
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                      placeholder="What were the core goals the client approached us to achieve?"
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                        The Challenges
                      </label>
                      <textarea
                        rows={3}
                        value={challenges}
                        onChange={(e) => setChallenges(e.target.value)}
                        placeholder="Technical, UX, or conversion bottlenecks encountered..."
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                        The Solution &amp; Engineering
                      </label>
                      <textarea
                        rows={3}
                        value={solutions}
                        onChange={(e) => setSolutions(e.target.value)}
                        placeholder="How Teja Web Studio engineered the final product..."
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                      Measurable Results &amp; Business Impact
                    </label>
                    <textarea
                      rows={2}
                      value={results}
                      onChange={(e) => setResults(e.target.value)}
                      placeholder="Conversion uplifts, performance benchmarks, speed scores..."
                      className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: PUBLISHING & SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Publication Status Selector */}
                  <div className="p-4 rounded-2xl border-2 border-[#203C3D]/15 bg-[#FBF9F6] space-y-2">
                    <label className="block text-xs font-black text-[#203C3D] uppercase tracking-wider">
                      Publication Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all ${
                          status === 'published'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-black'
                            : 'border-zinc-200 bg-white text-zinc-600 font-bold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status_radio"
                          checked={status === 'published'}
                          onChange={() => setStatus('published')}
                          className="accent-emerald-600"
                        />
                        <div>
                          <p className="text-xs">✓ Published (Live)</p>
                          <p className="text-[10px] text-zinc-500">Visible on public portfolio</p>
                        </div>
                      </label>
                      <label
                        className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-2.5 transition-all ${
                          status === 'draft'
                            ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-black'
                            : 'border-zinc-200 bg-white text-zinc-600 font-bold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status_radio"
                          checked={status === 'draft'}
                          onChange={() => setStatus('draft')}
                          className="accent-amber-600"
                        />
                        <div>
                          <p className="text-xs">● Draft (Private)</p>
                          <p className="text-[10px] text-zinc-500">Hidden from public visitors</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Homepage Featured Toggle */}
                  <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-[#203C3D]/15 bg-white">
                    <input
                      type="checkbox"
                      id="isFeaturedToggle"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#203C3D]"
                    />
                    <label htmlFor="isFeaturedToggle" className="text-xs font-black text-[#203C3D] cursor-pointer">
                      ★ Showcase on Home Page (Featured Project)
                    </label>
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-black text-[#203C3D] mb-1 uppercase tracking-wider">
                      URL Slug
                    </label>
                    <div className="flex items-center rounded-xl border-2 border-[#203C3D]/25 bg-white px-3 py-2">
                      <span className="text-xs text-[#7A9394] font-bold select-none">/portfolio/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="bean-bloom-coffee"
                        className="w-full text-xs text-[#111E1F] font-bold focus:outline-none ml-1 bg-transparent"
                      />
                    </div>
                  </div>

                  {/* SEO Metadata */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-black text-[#203C3D] uppercase tracking-wider">
                          SEO Meta Title
                        </label>
                        <span className="text-[10px] font-bold text-[#7A9394]">{seoTitle.length}/60 chars</span>
                      </div>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder={`${title || 'Project'} — Web Case Study | Teja Web Studio`}
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-black text-[#203C3D] uppercase tracking-wider">
                          SEO Meta Description
                        </label>
                        <span className="text-[10px] font-bold text-[#7A9394]">
                          {seoDescription.length}/160 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="High-performance website designed and engineered by Teja Web Studio..."
                        className="w-full rounded-xl border-2 border-[#203C3D]/25 bg-white px-3.5 py-2 text-xs text-[#111E1F] font-bold focus:outline-none focus:border-[#203C3D] focus:ring-2 focus:ring-[#FEDAB8]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 px-6 border-t border-[#203C3D]/10 bg-[#FBF9F6] flex flex-wrap items-center justify-between gap-2 shrink-0 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="rounded-xl px-4 py-2 text-xs font-black text-[#4D6768] hover:text-[#203C3D] transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={submitting}
                  className="rounded-xl border-2 border-[#203C3D]/30 bg-white hover:bg-zinc-50 px-4 py-2.5 text-xs font-black text-[#203C3D] transition-all disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#203C3D] hover:bg-[#162A2B] px-5 py-2.5 text-xs font-black text-[#FEDAB8] transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FEDAB8]" />
                      <span>Persisting to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#FEDAB8]" />
                      <span>{editingId ? 'Update & Publish' : 'Publish Case Study'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminProjectsPage;
