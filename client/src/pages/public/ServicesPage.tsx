import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Smartphone, Zap, Search, Code, Rocket, ArrowRight, Check } from 'lucide-react';
import { Service } from '../../types';
import { servicesApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Search: <Search className="h-6 w-6" />,
  Code: <Code className="h-6 w-6" />,
  Rocket: <Rocket className="h-6 w-6" />,
};

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesApi
      .getAll()
      .then((data) => setServices(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Web Design & Development Services"
        description="Custom web development, mobile-first responsive design, ultra-fast performance optimization, and search engine integration for growing businesses."
      />
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Our Expertise
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Full-Stack Web Design &amp; Engineering Services
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Every website is custom engineered from scratch for high conversion rates, ultra-low
            load times, and effortless client management.
          </p>
        </div>

        {/* Services Detailed Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service._id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-card group"
            >
              <div>
                <div className="mb-5 inline-flex rounded-xl bg-secondary p-3 text-primary group-hover:bg-primary/20 transition-colors">
                  {iconMap[service.icon] || <Globe className="h-6 w-6" />}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Deliverables checklist */}
                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="mt-6 space-y-2 border-t border-border/50 pt-5">
                    <p className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                      What's Included:
                    </p>
                    {service.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-muted-foreground"
                      >
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-5 border-t border-border/50 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] text-muted-foreground">Starting from</span>
                  <span className="font-display text-lg font-bold text-white">
                    ${service.startingPrice}
                  </span>
                </div>
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors"
                >
                  Learn More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 rounded-3xl border border-border bg-card/60 p-10 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white">
            Need a customized scope or technical integration?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We build specialized web apps, custom API bridges, and booking engines tailored to your
            exact workflow.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/quote"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow"
            >
              Request Custom Proposal
            </Link>
            <Link
              to="/book"
              className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
            >
              Book Discovery Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
