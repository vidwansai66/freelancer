import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { Service } from '../../types';
import { servicesApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      servicesApi
        .getBySlug(slug)
        .then((data) => setService(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <p className="text-muted-foreground animate-pulse">Loading service specifications...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-40 pb-24 text-center">
        <Seo title="Service Not Found" noindex={true} />
        <h1 className="text-2xl font-bold text-white">Service Not Found</h1>
        <p className="mt-2 text-muted-foreground">The requested service could not be located.</p>
        <Link to="/services" className="mt-4 inline-block text-primary hover:underline">
          ← Back to all services
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <Seo
        title={`${service.title} | Web Studio Services`}
        description={service.shortDescription || service.fullDescription.slice(0, 155)}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": service.title,
          "description": service.shortDescription || service.fullDescription,
          "provider": {
            "@type": "ProfessionalService",
            "name": "Teja Web Studio"
          }
        }}
      />
      <div className="mx-auto max-w-4xl px-6">
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>

        {/* Hero Banner */}
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border">
            <div>
              <span className="inline-block rounded-full bg-primary/20 text-primary px-3 py-1 text-xs font-semibold uppercase mb-3">
                Service Specification
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white">{service.title}</h1>
              <p className="mt-3 text-base text-muted-foreground max-w-xl">
                {service.shortDescription}
              </p>
            </div>
            {service.startingPrice > 0 && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center shrink-0">
                <span className="text-xs text-muted-foreground block">Starting Price</span>
                <span className="text-3xl font-display font-bold text-white">
                  ${service.startingPrice}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  One-time payment
                </span>
              </div>
            )}
          </div>

          {/* Full Description & Scope */}
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">
                Service Scope &amp; Architecture
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {service.fullDescription || service.shortDescription}
              </p>
            </div>

            {/* Deliverables */}
            {service.deliverables && service.deliverables.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Core Deliverables</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {service.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantees Box */}
            <div className="grid gap-4 sm:grid-cols-3 pt-6 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>5–7 Days Turnaround</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Code Ownership</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Mobile &amp; SEO Ready</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-4 pt-6">
              <Link
                to={`/quote?service=${encodeURIComponent(service.title)}`}
                className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-glow hover:scale-105 transition-all"
              >
                Request Quote for this Service <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={`/book?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-8 py-3 text-sm font-semibold text-white hover:bg-muted transition-colors"
              >
                <Calendar className="h-4 w-4 text-primary" /> Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
