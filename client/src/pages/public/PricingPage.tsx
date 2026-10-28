import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, HelpCircle, Calculator, Sparkles } from 'lucide-react';
import { PricingPlan } from '../../types';
import { pricingApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Project Cost Estimator state
  const [pageCount, setPageCount] = useState<number>(3);
  const [hasEcommerce, setHasEcommerce] = useState<boolean>(false);
  const [hasCms, setHasCms] = useState<boolean>(false);
  const [isExpedited, setIsExpedited] = useState<boolean>(false);

  useEffect(() => {
    pricingApi
      .getAll()
      .then((data) => setPlans(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Compute estimated quote
  const calculateEstimate = () => {
    let base = 199;
    if (pageCount > 1) {
      base += (pageCount - 1) * 60;
    }
    if (hasEcommerce) base += 250;
    if (hasCms) base += 150;
    if (isExpedited) base += 120;
    return base;
  };

  const comparisonFeatures = [
    {
      name: 'Custom Mobile-First UI',
      starter: '1 Page',
      business: 'Up to 5 Pages',
      premium: 'Up to 10 Pages',
    },
    { name: 'Delivery Turnaround', starter: '5 Days', business: '7 Days', premium: '10 Days' },
    { name: 'Revisions Included', starter: '1 Round', business: '3 Rounds', premium: 'Unlimited' },
    { name: 'Lead Capture & Contact Form', starter: true, business: true, premium: true },
    { name: 'Appointment Scheduler Engine', starter: false, business: true, premium: true },
    { name: 'Google Maps & Local SEO', starter: false, business: true, premium: true },
    { name: 'Blog / Articles CMS Section', starter: false, business: false, premium: true },
    {
      name: 'Advanced Core Web Vitals Optimization',
      starter: false,
      business: true,
      premium: true,
    },
    { name: 'Free Post-Launch Support', starter: 'None', business: '1 Month', premium: '3 Months' },
    { name: 'Full Code Ownership', starter: true, business: true, premium: true },
  ];

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Web Design Pricing & Packages"
        description="Transparent, fixed-price website development packages. Starter, Business, and Custom tiers with zero hidden fees and full code ownership."
      />
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Transparent Investment
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Simple, Honest Pricing. Zero Hidden Fees.
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            One-time payment packages. You own all design files and code forever. No lock-in
            contracts or monthly agency retainers.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3 items-stretch mb-20">
          {plans.map((plan) => {
            const isPopular = plan.isPopular;
            return (
              <div
                key={plan._id}
                className={`relative flex flex-col justify-between rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                  isPopular
                    ? 'glow-card border-primary/60 bg-card shadow-glow-lg'
                    : 'border-border bg-card'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-md">
                    {plan.badge || 'MOST POPULAR'}
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                  <div className="mt-6 font-display text-4xl font-bold text-white">
                    ${plan.price}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      {plan.billingCycle}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    to={`/quote?package=${encodeURIComponent(plan.name)}`}
                    className={`block w-full rounded-full py-3 text-center text-xs font-semibold transition-transform hover:scale-105 active:scale-95 ${
                      isPopular
                        ? 'bg-primary text-white shadow-glow'
                        : 'border border-border bg-secondary text-white hover:bg-muted'
                    }`}
                  >
                    Select {plan.name} Package
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE ESTIMATOR                                    */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 rounded-xl bg-primary/20 text-primary">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Custom Scope Estimator</h2>
              <p className="text-xs text-muted-foreground">
                Adjust options to see an instant approximate cost for custom scopes.
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              {/* Pages slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-white mb-2">
                  <span>Number of Unique Pages:</span>
                  <span className="text-primary font-bold">{pageCount} Pages</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full accent-primary bg-secondary h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1 Page (Landing)</span>
                  <span>5 Pages (Standard)</span>
                  <span>12 Pages (Enterprise)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/50 cursor-pointer hover:bg-secondary">
                  <span className="text-xs font-medium text-white">
                    E-Commerce &amp; Product Checkout
                  </span>
                  <input
                    type="checkbox"
                    checked={hasEcommerce}
                    onChange={(e) => setHasEcommerce(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/50 cursor-pointer hover:bg-secondary">
                  <span className="text-xs font-medium text-white">
                    Blog CMS &amp; Custom Admin Editor
                  </span>
                  <input
                    type="checkbox"
                    checked={hasCms}
                    onChange={(e) => setHasCms(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/50 cursor-pointer hover:bg-secondary">
                  <span className="text-xs font-medium text-white">
                    Expedited 72-Hour Express Launch
                  </span>
                  <input
                    type="checkbox"
                    checked={isExpedited}
                    onChange={(e) => setIsExpedited(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Estimated Quote Result Card */}
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-8 text-center flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Estimated Investment
                </span>
                <div className="mt-3 font-display text-5xl font-bold text-white">
                  ${calculateEstimate()}
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Includes responsive design, technical SEO, and post-launch verification.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  to={`/quote?pages=${pageCount}&ecommerce=${hasEcommerce}&cms=${hasCms}&expedited=${isExpedited}&est=${calculateEstimate()}`}
                  className="glow-card inline-flex items-center justify-center gap-2 w-full rounded-full bg-primary py-3 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
                >
                  Lock In This Quote <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DETAILED COMPARISON MATRIX TABLE                         */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="p-6 md:p-8 border-b border-border">
            <h2 className="text-xl font-bold text-white">Complete Feature Comparison</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed breakdown of deliverables across every package.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-4 px-6">Deliverable</th>
                  <th className="py-4 px-6 text-center">Starter ($199)</th>
                  <th className="py-4 px-6 text-center bg-primary/10 text-primary font-bold">
                    Business ($449)
                  </th>
                  <th className="py-4 px-6 text-center">Premium ($899)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-foreground">{row.name}</td>
                    <td className="py-3.5 px-6 text-center text-muted-foreground">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center font-medium bg-primary/5 text-foreground">
                      {typeof row.business === 'boolean' ? (
                        row.business ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        row.business
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center text-muted-foreground">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        row.premium
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
