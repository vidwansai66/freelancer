import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Code2, Rocket, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const techStack = [
    {
      name: 'React 19',
      category: 'Frontend UI',
      desc: 'Component architecture with fast virtual DOM',
    },
    {
      name: 'TypeScript',
      category: 'Language',
      desc: 'Type-safe codebase with zero runtime surprises',
    },
    {
      name: 'Vite',
      category: 'Build Tool',
      desc: 'Lightning-fast compilation and optimized bundles',
    },
    {
      name: 'Tailwind CSS',
      category: 'Styling',
      desc: 'Responsive utility-first modern design system',
    },
    {
      name: 'Node.js & Express',
      category: 'Backend',
      desc: 'REST API micro-architecture with robust rate-limiting',
    },
    {
      name: 'Zoho CRM',
      category: 'Lead Management',
      desc: 'Zero-cost CRM integration for automated contact and lead synchronization',
    },
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Studio Founded',
      desc: 'Started helping local businesses replace clunky builders with modern high-speed code.',
    },
    {
      year: '2024',
      title: '5-Day Launch Pipeline',
      desc: 'Standardized our agile design-to-production sprint reducing average delivery from 4 weeks to 5 days.',
    },
    {
      year: '2025',
      title: 'Full-Stack Expansion',
      desc: 'Integrated real-time customer chat, automated email dispatch, and conflict-free booking systems.',
    },
    {
      year: '2026',
      title: '25+ Websites & 100% Satisfaction',
      desc: 'Continued delivery of high-performing web platforms for small businesses nationwide.',
    },
  ];

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            About Teja Web Studio
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            We Build Websites That Turn Visitors Into Clients
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            No endless meetings. No bloated agency markup. Just clean, modern, and high-converting
            web solutions tailored to small business growth.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid gap-10 md:grid-cols-2 items-center rounded-3xl border border-border bg-card p-8 md:p-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Why Teja Web Studio Was Started</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Too many small business owners get stuck between two frustrating extremes: paying
                traditional digital agencies $5,000+ for slow delivery, or wrestling with confusing
                DIY builders that result in sluggish, generic websites.
              </p>
              <p>
                Teja Web Studio was built to offer the sweet spot: bespoke custom websites with
                premium typography, fast loading times, and built-in lead generation, delivered in
                days for a transparent flat fee.
              </p>
              <p>
                Every project is handcrafted with modern technologies (React, TypeScript, Tailwind,
                and Node.js) to guarantee 95+ Google PageSpeed scores and seamless responsiveness on
                all smartphones.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-7 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Our Core Principles
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Speed Over Bloat</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We write clean, lightweight code without unnecessary plugins that slow your site
                    down.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Mobile-First By Default</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Over 70% of web traffic is mobile. We design for the smartphone screen first.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Complete Code Ownership</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You own 100% of your codebase, domain, and assets with no vendor lock-in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">
              Engineered with Modern Full-Stack Technologies
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Reliable, modern, and secure software stack powering every project.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
              >
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                  {tech.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{tech.name}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones / Journey */}
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Studio Journey &amp; Milestones
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-primary/40 space-y-2">
                <span className="text-xs font-mono font-bold text-primary">{m.year}</span>
                <h3 className="text-sm font-bold text-white">{m.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center rounded-3xl border border-primary/30 bg-primary/10 p-10">
          <h2 className="text-2xl font-bold text-white">
            Ready to bring your business vision to life?
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Schedule a free 30-minute discovery call or send over your project brief today.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/quote"
              className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-glow"
            >
              Request a Quote
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-border bg-card px-6 py-2.5 text-xs font-semibold text-white hover:bg-secondary"
            >
              Contact Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
