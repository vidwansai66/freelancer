import { useSettings } from '../../context/SettingsContext';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', path: '/services' },
    { label: 'Work', path: '/portfolio' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-3 inset-x-0 z-50 px-4 md:px-6 transition-all duration-300">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-300 ${
          isScrolled
            ? 'border border-primary/25 bg-background/85 shadow-lg shadow-black/10 backdrop-blur-xl'
            : 'border border-border/60 bg-background/60 shadow-sm backdrop-blur-md'
        }`}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-base md:text-lg font-bold tracking-tight text-foreground group"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-glow">
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
          </span>
          <span className="text-foreground tracking-tight font-extrabold flex items-center">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="" className="h-6 w-6 object-contain inline mr-2" />
            )}
            {settings.studioName || 'Teja Studio'}
            <span className="text-primary font-black text-xl leading-none">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  active
                    ? 'text-primary bg-primary/10 border border-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="flex items-center gap-2.5 ml-3 pl-3 border-l border-border/80">
            <Link
              to="/book"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-border bg-card/80 text-foreground hover:border-primary/40 hover:text-primary transition-all active:scale-95"
            >
              Book Call
            </Link>
            <Link
              to="/quote"
              className="btn-shimmer group inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-glow transition-all duration-300 hover:bg-primary-hover active:scale-95"
            >
              <span>Start Project</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border border-border"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="mx-auto mt-2 max-w-md rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl px-6 py-6 md:hidden animate-fade-in shadow-2xl"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold transition-colors py-1 px-2 rounded-lg ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Book a Free Discovery Call
              </Link>
              <Link
                to="/quote"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-shimmer w-full text-center rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-glow"
              >
                Request a Custom Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
