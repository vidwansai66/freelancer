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
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR                                          */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-xl shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 p-6 border-b border-border">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold text-foreground tracking-tight">
              Studio Admin
            </h2>
            <span className="text-[10px] text-primary font-medium">Control Center</span>
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-primary text-white font-semibold shadow-glow'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="truncate">
              <p className="text-xs font-bold text-foreground truncate">
                {admin?.fullName || 'Studio Admin'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-muted-foreground hover:text-rose-400 p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-secondary hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground border border-border transition-colors"
          >
            <span>Live Website</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Authenticated as:{' '}
              <strong className="text-foreground font-medium">{admin?.role || 'Administrator'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-lg border border-border"
            >
              <ExternalLink className="h-3 w-3" /> View Website
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
            >
              <LogOut className="h-3 w-3" /> Sign Out
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-card border-b border-border p-4 max-h-[80vh] overflow-y-auto space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary text-white font-semibold'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Viewport Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
