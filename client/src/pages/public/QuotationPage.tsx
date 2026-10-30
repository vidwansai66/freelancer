import { UploadField, Field } from '../../components/common/Forms';
import { servicesApi } from '../../services/api';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { quotationsApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const QuotationPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [requestKey] = useState(() => crypto.randomUUID());
  const [attachments, setAttachments] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<string[]>([]);
  useEffect(() => {
    servicesApi
      .getAll()
      .then((services: any[]) => setCatalog(services.map((service) => service.title)));
  }, []);
  const initialPackage = searchParams.get('package') || '';
  const initialEstimated = searchParams.get('est') ? Number(searchParams.get('est')) : 0;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    businessType: '',
    projectType:
      searchParams.get('service') ||
      (initialPackage ? `${initialPackage} Website Package` : 'Brand New Small Business Website'),
    budgetRange:
      initialPackage === 'Premium'
        ? '$899 - $1,500'
        : initialPackage === 'Business'
          ? '$449 - $899'
          : '$199 - $449',
    timeline: 'Within 5–7 Days',
    requiredFeatures: ['Mobile-First Responsive Design', 'Basic SEO Setup'],
    description: initialEstimated
      ? `Estimated scope calculated from pricing estimator: ~$${initialEstimated}.`
      : '',
    _hp_company: '', // Honeypot
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectTypes = [
    'Brand New Small Business Website',
    'Website Redesign & Speed Optimization',
    'High-Converting Landing Page',
    'E-Commerce & Digital Storefront',
    'Custom Web Application / Portal',
  ];

  const budgetRanges = [
    '$199 - $449 (Starter / 1-Page)',
    '$449 - $899 (Business Standard)',
    '$899 - $1,500 (Growth / Custom)',
    '$1,500+ (Full Web Application)',
  ];

  const timelines = [
    'Within 5–7 Days (Standard Sprint)',
    'Within 1–2 Weeks',
    'Within 1 Month',
    'Flexible / Planning Ahead',
  ];

  const availableFeatures = [
    'Mobile-First Responsive Design',
    'Interactive Contact & Lead Forms',
    'Online Appointment Booking Calendar',
    'Google Maps & Local Search SEO',
    'Blog / Articles CMS Section',
    'E-Commerce Cart & Payments',
    'Customer Live Chat Box Integration',
    'Multi-Language Support',
  ];

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.requiredFeatures.includes(feature);
      return {
        ...prev,
        requiredFeatures: exists
          ? prev.requiredFeatures.filter((f) => f !== feature)
          : [...prev.requiredFeatures, feature],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.description.trim()) {
      setError('Please provide your name, email, and a brief description of your project.');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = requestKey;
      await quotationsApi.submit({
        ...formData,
        attachments: attachments.map((file) => ({ fileId: file.fileId, token: file.token })),
        estimatedQuote: initialEstimated,
        idempotencyKey,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to submit quotation. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Request a Custom Website Proposal"
        description="Tell us about your business goals and technical requirements to receive a detailed website quotation with fixed turnaround and pricing."
      />
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Project Discovery
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Request a Tailored Website Proposal
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Fill in your project requirements below. You will receive a detailed proposal breakdown
            with fixed pricing and guaranteed launch milestones within 24 hours.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-white">Proposal Request Received!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you, <span className="text-white font-medium">{formData.name}</span>! We have
                queued your request for review and saved the contact email{' '}
                <span className="text-white font-medium">{formData.email}</span>.
              </p>
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  Expected proposal delivery: Within 24 business hours.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <Field
                label="Business type"
                value={formData.businessType}
                onChange={(value) => setFormData({ ...formData, businessType: value })}
              />
              <UploadField
                label="Project brief or attachment"
                visibility="private"
                onUploaded={(file) => setAttachments((previous) => [...previous, file].slice(0, 5))}
              />
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.map((file, index) => (
                    <div
                      key={file.fileId}
                      className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-1.5 text-xs text-foreground shadow-xs"
                    >
                      <span className="font-medium truncate max-w-[200px]">{file.filename}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((previous) => previous.filter((_, i) => i !== index))
                        }
                        className="text-muted-foreground hover:text-rose-500 transition-colors p-0.5"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Honeypot field */}
              <input
                type="text"
                name="_hp_company"
                value={formData._hp_company}
                onChange={(e) => setFormData({ ...formData, _hp_company: e.target.value })}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Section 1: Project Type */}
              <div>
                <label
                  className="block text-xs font-bold text-white uppercase tracking-wider mb-3"
                  htmlFor="QuotationPage-field-0"
                >
                  1. What type of website do you need?
                </label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[...new Set([formData.projectType, ...catalog, ...projectTypes])].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData({ ...formData, projectType: type })}
                      className={`text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${
                        formData.projectType === type
                          ? 'border-primary bg-primary/10 text-white font-semibold'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Budget & Timeline */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="QuotationPage-field-0"
                    className="block text-xs font-bold text-white uppercase tracking-wider mb-3"
                  >
                    2. Approximate Budget Range
                  </label>
                  <select
                    value={formData.budgetRange}
                    id="QuotationPage-field-0"
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary px-3.5 py-3 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {budgetRanges.map((b) => (
                      <option key={b} value={b} className="bg-card text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-bold text-white uppercase tracking-wider mb-3"
                    htmlFor="QuotationPage-field-1"
                  >
                    3. Desired Target Launch
                  </label>
                  <select
                    value={formData.timeline}
                    id="QuotationPage-field-1"
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary px-3.5 py-3 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {timelines.map((t) => (
                      <option key={t} value={t} className="bg-card text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 3: Feature Checklist */}
              <div>
                <label
                  className="block text-xs font-bold text-white uppercase tracking-wider mb-3"
                  htmlFor="QuotationPage-field-2"
                >
                  4. Select Desired Features &amp; Modules
                </label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {availableFeatures.map((feat) => {
                    const checked = formData.requiredFeatures.includes(feat);
                    return (
                      <button
                        type="button"
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all ${
                          checked
                            ? 'border-primary/60 bg-primary/10 text-white font-medium'
                            : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? 'bg-primary border-primary text-white'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Contact & Project Details */}
              <div className="space-y-4 pt-4 border-t border-border">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  5. Contact Details &amp; Project Description
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="QuotationPage-field-2"
                      className="block text-xs text-muted-foreground mb-1"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      id="QuotationPage-field-2"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs text-muted-foreground mb-1"
                      htmlFor="QuotationPage-field-3"
                    >
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      id="QuotationPage-field-3"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="block text-xs text-muted-foreground mb-1"
                      htmlFor="QuotationPage-field-4"
                    >
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Roasters"
                      value={formData.company}
                      id="QuotationPage-field-4"
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs text-muted-foreground mb-1"
                      htmlFor="QuotationPage-field-5"
                    >
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      id="QuotationPage-field-5"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs text-muted-foreground mb-1"
                    htmlFor="QuotationPage-field-6"
                  >
                    Describe your project &amp; any design links you love *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="We run a boutique coffee shop and need an online ordering and table reservation website..."
                    value={formData.description}
                    id="QuotationPage-field-6"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary p-3.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-card inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-xs font-semibold text-white shadow-glow hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating &amp; Submitting Proposal...</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Submit Proposal Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
