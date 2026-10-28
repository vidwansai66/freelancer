import { useSettings } from '../../context/SettingsContext';
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  return (
    <footer className="border-t border-border bg-card/40 pt-16 pb-12 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 pb-12 border-b border-border">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span>
                {settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt=""
                    className="h-8 w-8 object-contain inline mr-2"
                  />
                )}
                {settings.studioName}
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">{settings.footerText}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Accepting new client projects</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/track" className="hover:text-primary">
                  Track your project
                </Link>
              </li>
              <li>
                <Link to="/manage-booking" className="hover:text-primary">
                  Manage your booking
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  Services & Offerings
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-primary transition-colors">
                  Portfolio & Results
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary transition-colors">
                  Transparent Pricing
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-primary transition-colors">
                  Client Testimonials
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">
                  Articles & Strategy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Work & Connect */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Start Here
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/quote" className="hover:text-primary transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-primary transition-colors">
                  Book 30-Min Call
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-primary transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Direct Inquiry Form
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${(settings.whatsappNumber || '919490955048').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp Direct Chat
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Legal */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Guarantees
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>100% Code Ownership</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                <span>Revision Guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>Secure SSL & Performance</span>
              </li>
              <li className="pt-2">
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                {' • '}
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-5 py-4">
          {Object.entries(settings.socialLinks || {})
            .filter(([, url]) => url)
            .map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" className="underline">
                {name}
              </a>
            ))}
        </div>
        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.studioName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <span className="text-border">|</span>
            <Link
              to="/admin/login"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Lock className="h-3 w-3" /> Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
