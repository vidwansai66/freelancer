import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe,
  Smartphone,
  Zap,
  Search,
  Code,
  Rocket,
  Star,
  ChevronDown,
  Calendar,
  Sparkles,
  Layers,
  Shield,
} from 'lucide-react';
import { Service, Project, PricingPlan, FAQ, Testimonial } from '../../types';
import { servicesApi, projectsApi, pricingApi, faqApi, testimonialsApi } from '../../services/api';
import { SpotlightCard } from '../../components/common/SpotlightCard';
import { HeroVisualOrbit } from '../../components/common/HeroVisualOrbit';
import { AgencyMarquee } from '../../components/common/AgencyMarquee';
import { Seo } from '../../components/common/Seo';

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-6 w-6" />,
  Smartphone: <Smartphone className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Search: <Search className="h-6 w-6" />,
  Code: <Code className="h-6 w-6" />,
  Rocket: <Rocket className="h-6 w-6" />,
};

export const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servData, projData, priceData, faqData, testData] = await Promise.all([
          servicesApi.getAll().catch(() => []),
          projectsApi
            .getAll({ limit: 3 })
            .then((res) => res.data)
            .catch(() => []),
          pricingApi.getAll().catch(() => []),
          faqApi.getActive().catch(() => []),
          testimonialsApi.getApproved().catch(() => []),
        ]);

        setServices(servData || []);
        setProjects(projData || []);
        setPricing(priceData || []);
        setFaqs(faqData || []);
        setTestimonials(testData || []);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="relative overflow-hidden">
      <Seo
        title="Teja Web Studio — Simple, Affordable Websites for Small Businesses"
        description="High-performance, modern, and affordable websites for businesses and startups. Launched in days, not months."
      />
      {/* ======================================================== */}
      {/* 1. HERO SECTION: CINEMATIC FIRST VIEWPORT                */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        {/* Subtle geometric grid background */}
        <div className="hero-grid absolute inset-0 pointer-events-none" />

        {/* Ambient atmospheric green radial glows */}
        <div className="ambient-glow bg-emerald-500/20 top-16 left-1/4 h-96 w-96" />
        <div className="ambient-glow bg-primary/20 top-40 right-1/4 h-80 w-80" />
        <div className="ambient-glow bg-emerald-600/15 -bottom-16 left-1/2 -translate-x-1/2 h-72 w-72" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Typography & CTAs */}
            <div className="text-center lg:text-left lg:col-span-7 space-y-6">
              {/* Top Interactive Pill Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/80 backdrop-blur-md px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase shadow-sm hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-default group">
                <span className="status-beacon flex h-2 w-2 rounded-full bg-primary" />
                <span className="group-hover:text-primary transition-colors">
                  Official &bull; Freelance Web Studio
                </span>
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] lowercase font-mono">
                  v2.0
                </span>
              </div>

              {/* Main Headline with Staggered Word / Line Reveals */}
              <h1 className="text-4xl font-extrabold leading-[1.12] md:text-5xl lg:text-6xl tracking-tight text-foreground">
                High-performance digital experiences,{' '}
                <span className="text-gradient">engineered to convert</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed font-normal mx-auto lg:mx-0">
                We design and build lightning-fast, beautifully responsive websites and autonomous systems for ambitious businesses — built with modern full-stack standards and delivered in days.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-3.5 sm:flex-row lg:justify-start pt-2">
                <Link
                  to="/quote"
                  className="btn-shimmer group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:bg-primary-hover active:scale-95"
                >
                  <span>Start Your Project</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-card hover:border-primary/40 hover:shadow-sm active:scale-95"
                >
                  Explore Portfolio
                </Link>
              </div>

              {/* Verified Trust Metric Note */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>100% Code Ownership</span>
                </div>
                <span>&bull;</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <span>Sub-second load times</span>
                </div>
              </div>
            </div>

            {/* Right Column: Zenlio-Inspired Interactive Node Orbit Diagram */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroVisualOrbit />
            </div>
          </div>

          {/* 3 Interactive Metric Summary Cards */}
          <div className="mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 border-t border-border/70 pt-10">
            <SpotlightCard className="p-5 text-center sm:text-left">
              <div className="font-display text-3xl font-black text-primary md:text-4xl">25+</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm font-medium">
                Production websites delivered
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                Crafted with React, Node.js &amp; scalable cloud APIs.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-5 text-center sm:text-left">
              <div className="font-display text-3xl font-black text-primary md:text-4xl">
                3–5 days
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm font-medium">
                Average staging delivery
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                Rapid turnaround without sacrificing code craft.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-5 text-center sm:text-left">
              <div className="font-display text-3xl font-black text-primary md:text-4xl">100%</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm font-medium">
                Verified client satisfaction
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                Transparent revisions &amp; lifetime code handover.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. INFINITE CAPABILITY MARQUEE                           */}
      {/* ======================================================== */}
      <AgencyMarquee />

      {/* ======================================================== */}
      {/* 3. SERVICES SECTION: BESPOKE DIGITAL OFFERINGS           */}
      {/* ======================================================== */}
      <section id="services" className="border-t border-border py-20 md:py-28 bg-card/25 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Specialized Solutions
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl text-foreground">
              Everything your business needs to excel online
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Tailored web applications, landing pages, and automated systems built for performance and growth.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <SpotlightCard key={service._id} className="p-7">
                <Link to={`/services/${service.slug}`} className="block h-full group">
                  <div className="mb-4 inline-flex rounded-xl bg-secondary p-3 text-primary group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                    {iconMap[service.icon] || <Globe className="h-6 w-6" />}
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    {service.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.shortDescription}
                  </p>
                  {service.startingPrice > 0 && (
                    <div className="mt-6 pt-3 border-t border-border/60 text-xs font-semibold text-primary flex items-center justify-between">
                      <span>Starting from ${service.startingPrice}</span>
                      <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                        Learn more &rarr;
                      </span>
                    </div>
                  )}
                </Link>
              </SpotlightCard>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
            >
              Explore detailed service specifications and deliverables{' '}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. RECENT WORK / PORTFOLIO SECTION                       */}
      {/* ======================================================== */}
      <section id="work" className="border-t border-border py-20 md:py-28 relative overflow-hidden transition-colors duration-300">
        <div className="ambient-glow bg-emerald-600/10 -top-10 right-10 h-80 w-80" />

        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Proven Deliverables
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl text-foreground">
              Websites that drive measurable impact
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              A curated selection of client solutions engineered for high speed, conversion, and elegance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {projects.map((project) => (
              <SpotlightCard key={project._id} className="overflow-hidden flex flex-col">
                <Link
                  to={`/portfolio/${project.slug}`}
                  className="flex flex-col h-full group"
                >
                  <div className="overflow-hidden aspect-video bg-secondary relative">
                    <img
                      src={project.featuredImage}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                        {project.category}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        {project.title}
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {project.resultStat}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-1.5 pt-3 border-t border-border/60">
                      {project.technologies.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-secondary/80 border border-border/50 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              View All Case Studies &amp; Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. PRICING PACKAGES SECTION                              */}
      {/* ======================================================== */}
      <section id="pricing" className="border-t border-border py-20 md:py-28 bg-card/15">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Transparent Pricing
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl text-foreground">
              Simple, transparent packages
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              One-time investment. Zero hidden fees. You own 100% of the code forever.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-stretch">
            {pricing.map((plan) => {
              const isPopular = plan.isPopular;
              return (
                <SpotlightCard
                  key={plan._id}
                  className={`p-8 flex flex-col justify-between ${
                    isPopular
                      ? 'border-primary/50 shadow-emerald ring-1 ring-primary/30'
                      : ''
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-0.5 text-[11px] font-bold text-white shadow-md uppercase tracking-wider">
                      {plan.badge || 'MOST POPULAR'}
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="mt-6 font-display text-4xl font-extrabold text-foreground">
                      ${plan.price}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {plan.billingCycle}
                      </span>
                    </div>

                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border/50">
                    <Link
                      to={`/quote?package=${encodeURIComponent(plan.name)}`}
                      className={`block w-full rounded-full py-3 text-center text-xs font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                        isPopular
                          ? 'btn-shimmer bg-primary text-white shadow-glow'
                          : 'border border-border bg-card text-foreground hover:bg-secondary hover:border-primary/30'
                      }`}
                    >
                      {plan.ctaText || 'Get Started'}
                    </Link>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/pricing"
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              View detailed side-by-side feature comparison table &amp; custom project calculator &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. PROCESS WORKFLOW SECTION                              */}
      {/* ======================================================== */}
      <section id="process" className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Proven Delivery Process
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl text-foreground">
              From concept to live launch in 3 steps
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              A streamlined, collaborative journey built to launch your digital platform seamlessly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <SpotlightCard className="p-8">
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-extrabold text-primary/35">01</span>
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-mono">
                  PHASE 1
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Discovery &amp; Strategy</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                We align on your brand identity, primary conversion goals, and target audience to architect the optimal site hierarchy and technical roadmap.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-8">
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-extrabold text-primary/35">02</span>
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-mono">
                  PHASE 2
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Bespoke Build &amp; Polish</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                You receive a private staging link within 3 to 5 days. Together we fine-tune responsive layouts, typography, animations, and content copy.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-8">
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-extrabold text-primary/35">03</span>
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-mono">
                  PHASE 3
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">Launch &amp; Scaling</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Your production website goes live on global edge CDN with secure SSL, automated forms, SEO tagging, and continuous post-launch support.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. TESTIMONIALS & REVIEWS SECTION                        */}
      {/* ======================================================== */}
      {testimonials.length > 0 && (
        <section className="border-t border-border py-20 md:py-28 bg-card/20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold tracking-widest text-primary uppercase">
                Client Trust
              </p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl text-foreground">
                Loved by founders and business leaders
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((item) => (
                <SpotlightCard
                  key={item._id}
                  className="p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs italic text-muted-foreground leading-relaxed">
                      "{item.reviewText}"
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.clientName}
                        className="h-9 w-9 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                        {item.clientName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.clientName}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {item.company} &bull; {item.role}
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link to="/reviews" className="text-xs font-semibold text-primary hover:underline">
                Read all verified client feedback or submit your review &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 8. FREQUENTLY ASKED QUESTIONS SECTION                    */}
      {/* ======================================================== */}
      {faqs.length > 0 && (
        <section className="border-t border-border py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold tracking-widest text-primary uppercase">FAQs</p>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl text-foreground">
                Answers to common questions
              </h2>
            </div>

            <div className="space-y-3.5">
              {faqs.slice(0, 5).map((faq, idx) => (
                <div
                  key={faq._id}
                  className="rounded-2xl border border-border bg-card/80 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        openFaqIndex === idx ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/faqs"
                className="text-xs text-muted-foreground hover:text-primary underline"
              >
                Browse all FAQs categorized by process, pricing, and technical setup &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 9. CALL TO ACTION BANNER                                 */}
      {/* ======================================================== */}
      <section
        id="contact"
        className="border-t border-border py-20 md:py-28 bg-gradient-to-b from-card/40 to-background relative overflow-hidden"
      >
        <div className="ambient-glow bg-primary/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80" />

        <div className="relative mx-auto max-w-3xl px-6 text-center z-10">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            <span>Ready for your digital transformation?</span>
          </div>
          <h2 className="text-3xl font-extrabold md:text-5xl text-foreground">
            Let's build a website that{' '}
            <span className="text-gradient">delivers real growth</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground leading-relaxed">
            Tell us about your project vision and get a tailored timeline and quotation within 24 hours.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              to="/quote"
              className="btn-shimmer group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-semibold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              <span>Request a Free Quote</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-95"
            >
              <Calendar className="h-4 w-4 text-primary" /> Book 30-Min Discovery Call
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
