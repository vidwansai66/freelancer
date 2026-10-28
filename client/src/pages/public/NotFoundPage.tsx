import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Seo } from '../../components/common/Seo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-24 px-6 text-center">
      <Seo title="Page Not Found (404)" noindex={true} />
      <div className="max-w-md space-y-6">
        <div className="font-display text-8xl font-black text-primary/40">404</div>
        <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or the link is broken.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/"
            className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
          >
            <Home className="h-4 w-4" /> Return to Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-6 py-2.5 text-xs font-semibold text-white hover:bg-muted"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};
