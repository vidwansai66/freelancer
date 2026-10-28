import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ArrowUpRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden transition-colors duration-300">
      {/* Background Grid & Atmospheric Emerald Glows */}
      <div className="hero-grid absolute inset-0 pointer-events-none" />
      <div className="ambient-glow bg-emerald-500/20 top-1/4 left-1/4 h-80 w-80" />
      <div className="ambient-glow bg-primary/20 bottom-1/4 right-1/4 h-80 w-80" />

      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-primary/25 bg-card/90 backdrop-blur-xl p-8 md:p-10 shadow-2xl relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground mb-4 group"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              Teja<span className="text-primary font-black">.</span>Studio
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Administrator Portal</h1>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Secure Enterprise Workspace</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email-input"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Admin Email
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tejastudio.com"
                className="w-full rounded-xl border border-border bg-secondary/80 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password-input"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-border bg-secondary/80 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-shimmer group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-semibold text-white shadow-glow hover:bg-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 mt-3"
          >
            {loading ? (
              <span>Authenticating Secure Session...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border/60 pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
};
