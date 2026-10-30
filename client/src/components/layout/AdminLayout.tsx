import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  FileSpreadsheet,
  Calendar,
  Briefcase,
  Layers,
  DollarSign,
  Star,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { admin, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Protected route check
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    {
      label: 'Client Projects',
      path: '/admin/client-projects',
      icon: <Briefcase className="h-4 w-4" />,
    },
    { label: 'Notifications', path: '/admin/notifications', icon: <Inbox className="h-4 w-4" /> },
    ...(admin?.role === 'superadmin'
      ? [{ label: 'Admin Accounts', path: '/admin/users', icon: <Settings className="h-4 w-4" /> }]
      : []),
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Inquiries', path: '/admin/inquiries', icon: <Inbox className="h-4 w-4" /> },
    {
      label: 'Quotations',
      path: '/admin/quotations',
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
    { label: 'Appointments', path: '/admin/appointments', icon: <Calendar className="h-4 w-4" /> },
    { label: 'Customer Chats', path: '/admin/chats', icon: <MessageSquare className="h-4 w-4" /> },
    { label: 'Services', path: '/admin/services', icon: <Layers className="h-4 w-4" /> },
    { label: 'Portfolio', path: '/admin/portfolio', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Pricing Plans', path: '/admin/pricing', icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Testimonials', path: '/admin/testimonials', icon: <Star className="h-4 w-4" /> },
    { label: 'Blog CMS', path: '/admin/blog', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'FAQs', path: '/admin/faqs', icon: <HelpCircle className="h-4 w-4" /> },
    ...(admin?.role === 'superadmin'
      ? [{ label: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-portal min-h-screen flex bg-[#203C3D] text-[#111E1F]">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (Slate Gray #203C3D & Peach Fuzz #FEDAB8)*/}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#2C5051] bg-[#203C3D] shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 p-6 border-b border-[#2C5051]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEDAB8] text-[#203C3D] shadow-sm">
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
          </span>
          <div>
            <h2 className="font-display text-sm font-black text-white tracking-tight">
              Studio Admin
            </h2>
            <span className="text-[10px] text-[#FEDAB8] font-black uppercase tracking-wider">
              Control Center
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  active
                    ? 'bg-[#FEDAB8] text-[#203C3D] shadow-md shadow-[#FEDAB8]/20'
                    : 'text-[#E0EBEA] hover:text-[#FEDAB8] hover:bg-[#2A4D4E]'
                }`}
              >
                <span className={active ? 'text-[#203C3D]' : 'text-[#FEDAB8]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-[#2C5051] bg-[#1A3132]">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="truncate">
              <p className="text-xs font-black text-white truncate">
                {admin?.fullName || 'Studio Admin'}
              </p>
              <p className="text-[10px] text-[#FEDAB8]/90 font-bold truncate">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-[#E0EBEA] hover:text-rose-300 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#142627] hover:bg-[#0E1A1A] text-xs text-[#FEDAB8] hover:text-white font-black border border-[#FEDAB8]/30 transition-all shadow-sm"
          >
            <span>Live Website</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F6F4F0]">
        {/* Top Header */}
        <header className="h-16 border-b border-[#2C5051] bg-[#203C3D] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-[#FEDAB8] hover:bg-white/10"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-xs text-[#E0EBEA] hidden sm:inline font-bold">
              Authenticated as:{' '}
              <strong className="text-[#FEDAB8] font-black bg-[#1A3132] px-2.5 py-0.5 rounded-full border border-[#FEDAB8]/30 ml-1">
                {admin?.role || 'Administrator'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-[#203C3D] hover:text-black font-black flex items-center gap-1.5 bg-[#FEDAB8] hover:bg-[#FDD0A5] px-4 py-2 rounded-xl border border-[#F8C89A] transition-all shadow-sm hover:scale-[1.02]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Website
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-200 hover:text-white font-black flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/50 px-3.5 py-2 rounded-xl border border-rose-500/30 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-[#203C3D] border-b border-[#2C5051] p-4 max-h-[80vh] overflow-y-auto space-y-1 shadow-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black ${
                  location.pathname === item.path
                    ? 'bg-[#FEDAB8] text-[#203C3D] font-black'
                    : 'text-[#E0EBEA] hover:bg-[#2A4D4E] hover:text-[#FEDAB8]'
                }`}
              >
                <span className={location.pathname === item.path ? 'text-[#203C3D]' : 'text-[#FEDAB8]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Viewport Workspace Outlet */}
        <main className="admin-workspace flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
