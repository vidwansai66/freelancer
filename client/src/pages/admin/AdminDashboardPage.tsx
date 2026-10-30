import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  FileSpreadsheet,
  Calendar,
  Briefcase,
  Layers,
  Star,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { DashboardStats } from '../../types';
import { dashboardApi } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadStats = () => {
    setLoading(true);
    setError(false);
    dashboardApi
      .getStats()
      .then((data) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FEDAB8] border border-[#F8C89A] text-[#203C3D] font-black text-xs animate-pulse">
          <Activity className="h-4 w-4 text-[#203C3D] animate-spin" />
          Aggregating live database statistics...
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        role="alert"
        className="rounded-3xl border-2 border-[#FEDAB8] bg-white p-10 text-center shadow-xl max-w-lg mx-auto"
      >
        <div className="h-12 w-12 rounded-2xl bg-[#203C3D] text-[#FEDAB8] flex items-center justify-center mx-auto mb-4 border border-[#FEDAB8]/40">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-black text-[#111E1F]">Dashboard data is taking longer to load</h1>
        <p className="mt-2 text-xs font-bold text-[#4D6768]">
          Your requests and database records are still safely stored. Please retry loading.
        </p>
        <button
          type="button"
          onClick={loadStats}
          className="mt-5 rounded-xl bg-[#203C3D] hover:bg-[#162A2B] px-6 py-2.5 text-xs font-black text-[#FEDAB8] transition-all shadow-md shadow-[#203C3D]/20"
        >
          Retry Dashboard
        </button>
      </div>
    );
  }

  const kpi = stats?.kpi;
  const activity = stats?.recentActivity;

  return (
    <div className="space-y-8">
      {/* Top Welcome Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#203C3D]/15 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#203C3D] tracking-tight">
              Live Operations Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#FEDAB8] text-[#203C3D] border border-[#F8C89A] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#203C3D] animate-ping" />
              Live Active
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#4D6768] mt-1">
            Real-time database metrics, customer inquiries, appointment bookings, and proposal pipelines.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#203C3D] hover:bg-[#162A2B] text-[#FEDAB8] border border-[#FEDAB8]/30 text-xs font-black transition-all shadow-sm"
        >
          <Activity className="h-3.5 w-3.5 text-[#FEDAB8]" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Inquiries */}
        <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-5 shadow-sm hover:shadow-lg hover:border-[#203C3D]/40 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#203C3D]">
              Inquiries
            </span>
            <div className="p-2.5 rounded-xl bg-[#203C3D] text-[#FEDAB8] border border-[#FEDAB8]/30 group-hover:scale-105 transition-transform">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-4xl font-black text-[#111E1F] tracking-tight">
              {kpi?.inquiries.total || 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-[#203C3D]/10">
              <span className="rounded-full bg-[#FEDAB8] text-[#203C3D] border border-[#F8C89A] px-2.5 py-0.5 text-[11px] font-black">
                {kpi?.inquiries.new || 0} New Unread
              </span>
              <Link
                to="/admin/inquiries"
                className="text-[#203C3D] hover:text-[#8A4C12] font-black text-xs inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
              >
                Manage →
              </Link>
            </div>
          </div>
        </div>

        {/* Quotations Pipeline */}
        <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-5 shadow-sm hover:shadow-lg hover:border-[#203C3D]/40 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#203C3D]">
              Quotes Pipeline
            </span>
            <div className="p-2.5 rounded-xl bg-[#203C3D] text-[#FEDAB8] border border-[#FEDAB8]/30 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-4xl font-black text-[#111E1F] tracking-tight">
              {kpi?.quotations.total || 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-[#203C3D]/10">
              <span className="text-[#4D6768] text-[11px] font-bold">
                {kpi?.quotations.new || 0} new ·{' '}
                <span className="text-[#111E1F] font-black">
                  ${(kpi?.quotations.pipelineValue || 0).toLocaleString()}
                </span>
              </span>
              <Link
                to="/admin/quotations"
                className="text-[#203C3D] hover:text-[#8A4C12] font-black text-xs inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
              >
                Pipeline →
              </Link>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-5 shadow-sm hover:shadow-lg hover:border-[#203C3D]/40 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#203C3D]">
              Appointments
            </span>
            <div className="p-2.5 rounded-xl bg-[#203C3D] text-[#FEDAB8] border border-[#FEDAB8]/30 group-hover:scale-105 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-4xl font-black text-[#111E1F] tracking-tight">
              {kpi?.appointments.confirmed || 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-[#203C3D]/10">
              <span className="rounded-full bg-[#FEDAB8] text-[#203C3D] border border-[#F8C89A] px-2.5 py-0.5 text-[11px] font-black">
                {kpi?.appointments.today || 0} Today
              </span>
              <Link
                to="/admin/appointments"
                className="text-[#203C3D] hover:text-[#8A4C12] font-black text-xs inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
              >
                Calendar →
              </Link>
            </div>
          </div>
        </div>

        {/* Active Customer Chats */}
        <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-5 shadow-sm hover:shadow-lg hover:border-[#203C3D]/40 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#203C3D]">
              Customer Chats
            </span>
            <div className="p-2.5 rounded-xl bg-[#203C3D] text-[#FEDAB8] border border-[#FEDAB8]/30 group-hover:scale-105 transition-transform">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-4xl font-black text-[#111E1F] tracking-tight">
              {kpi?.content.activeChats || 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-[#203C3D]/10">
              <span className="text-[#4D6768] text-[11px] font-bold">
                {kpi?.content.pendingReviews || 0} pending review
              </span>
              <Link
                to="/admin/chats"
                className="text-[#203C3D] hover:text-[#8A4C12] font-black text-xs inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
              >
                Live Chat →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Database Content Stats Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          to="/admin/services"
          className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-4 hover:border-[#203C3D]/40 hover:bg-[#FFF7EF] transition-all flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#203C3D] text-[#FEDAB8]">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-black text-[#203C3D]">Services</span>
          </div>
          <span className="text-sm font-black text-[#203C3D] bg-[#FEDAB8] border border-[#F8C89A] px-2.5 py-0.5 rounded-lg">
            {kpi?.content.services || 0}
          </span>
        </Link>
        <Link
          to="/admin/portfolio"
          className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-4 hover:border-[#203C3D]/40 hover:bg-[#FFF7EF] transition-all flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#203C3D] text-[#FEDAB8]">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-black text-[#203C3D]">Projects</span>
          </div>
          <span className="text-sm font-black text-[#203C3D] bg-[#FEDAB8] border border-[#F8C89A] px-2.5 py-0.5 rounded-lg">
            {kpi?.content.projects || 0}
          </span>
        </Link>
        <Link
          to="/admin/testimonials"
          className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-4 hover:border-[#203C3D]/40 hover:bg-[#FFF7EF] transition-all flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#203C3D] text-[#FEDAB8]">
              <Star className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-black text-[#203C3D]">Reviews</span>
          </div>
          <span className="text-sm font-black text-[#203C3D] bg-[#FEDAB8] border border-[#F8C89A] px-2.5 py-0.5 rounded-lg">
            {kpi?.content.testimonials || 0}
          </span>
        </Link>
        <Link
          to="/admin/blog"
          className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-4 hover:border-[#203C3D]/40 hover:bg-[#FFF7EF] transition-all flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#203C3D] text-[#FEDAB8]">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-black text-[#203C3D]">Articles</span>
          </div>
          <span className="text-sm font-black text-[#203C3D] bg-[#FEDAB8] border border-[#F8C89A] px-2.5 py-0.5 rounded-lg">
            {kpi?.content.blogPosts || 0}
          </span>
        </Link>
      </div>

      {/* Three Column Activity Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest Inquiries Table */}
        <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#203C3D]/10">
              <h2 className="text-sm font-black text-[#203C3D] flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#203C3D] text-[#FEDAB8]">
                  <Inbox className="h-3.5 w-3.5" />
                </div>
                Latest Inquiries
              </h2>
              <Link
                to="/admin/inquiries"
                className="text-xs font-black text-[#203C3D] hover:text-[#8A4C12] underline underline-offset-2"
              >
                View all →
              </Link>
            </div>

            {activity?.inquiries && activity.inquiries.length > 0 ? (
              <div className="divide-y divide-[#203C3D]/10">
                {activity.inquiries.map((inq) => (
                  <div key={inq._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="truncate">
                      <p className="font-black text-[#111E1F] text-xs truncate">{inq.name}</p>
                      <p className="text-[11px] font-bold text-[#4D6768] truncate">{inq.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          inq.status === 'new'
                            ? 'bg-[#FEDAB8] text-[#203C3D] border border-[#F8C89A]'
                            : inq.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-[#EDF3F3] text-[#203C3D] border border-[#203C3D]/20'
                        }`}
                      >
                        {inq.status}
                      </span>
                      <Link
                        to="/admin/inquiries"
                        className="p-1 rounded-lg bg-[#FAF7F4] hover:bg-[#203C3D] hover:text-[#FEDAB8] text-[#203C3D] transition-colors"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-[#4D6768] py-6 text-center">
                No inquiries logged yet.
              </p>
            )}
          </div>
        </div>

        {/* Latest Quotation Requests */}
        <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#203C3D]/10">
              <h2 className="text-sm font-black text-[#203C3D] flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#203C3D] text-[#FEDAB8]">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </div>
                Latest Quotations
              </h2>
              <Link
                to="/admin/quotations"
                className="text-xs font-black text-[#203C3D] hover:text-[#8A4C12] underline underline-offset-2"
              >
                View all →
              </Link>
            </div>

            {activity?.quotations && activity.quotations.length > 0 ? (
              <div className="divide-y divide-[#203C3D]/10">
                {activity.quotations.map((quote) => (
                  <Link
                    key={quote._id}
                    to="/admin/quotations"
                    className="flex items-center justify-between gap-3 py-3 text-xs hover:bg-[#FFF7EF] rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-black text-[#111E1F] text-xs">
                        {quote.name}
                      </span>
                      <span className="block truncate text-[11px] font-bold text-[#4D6768]">
                        {quote.projectType} · {quote.email}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#FEDAB8] text-[#203C3D] border border-[#F8C89A] px-2 py-0.5 text-[10px] font-black">
                      {quote.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-xs font-bold text-[#4D6768]">
                No quotation requests yet.
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-2xl border-2 border-[#203C3D]/15 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#203C3D]/10">
              <h2 className="text-sm font-black text-[#203C3D] flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#203C3D] text-[#FEDAB8]">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                Upcoming Calls
              </h2>
              <Link
                to="/admin/appointments"
                className="text-xs font-black text-[#203C3D] hover:text-[#8A4C12] underline underline-offset-2"
              >
                View calendar →
              </Link>
            </div>

            {activity?.appointments && activity.appointments.length > 0 ? (
              <div className="divide-y divide-[#203C3D]/10">
                {activity.appointments.map((app) => (
                  <div key={app._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="truncate">
                      <p className="font-black text-[#111E1F] text-xs truncate">{app.clientName}</p>
                      <p className="text-[11px] font-bold text-[#4D6768] truncate">
                        {app.appointmentDate} at {app.startTime} ({app.serviceType})
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black shrink-0 ${
                        app.status === 'confirmed'
                          ? 'bg-[#203C3D] text-[#FEDAB8] border border-[#FEDAB8]/30'
                          : app.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-[#FEDAB8] text-[#203C3D] border border-[#F8C89A]'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-[#4D6768] py-6 text-center">
                No upcoming appointments booked.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
