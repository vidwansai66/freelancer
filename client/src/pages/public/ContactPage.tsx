import { useSettings } from '../../context/SettingsContext';
import { Field } from '../../components/common/Forms';
import React, { useState } from 'react';
import { Mail, MessageCircle, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { inquiriesApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    service: '',
    budget: '',
    subject: '',
    message: '',
    _hp_company: '', // Honeypot anti-spam
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = requestKey;
      await inquiriesApi.submit({
        ...formData,
        idempotencyKey,
      });
      setSuccess(true);
      setRequestKey(crypto.randomUUID());
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessType: '',
        service: '',
        budget: '',
        subject: '',
        message: '',
        _hp_company: '',
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to submit inquiry. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Contact Teja Web Studio"
        description="Have a question or looking for a website quote? Contact Teja Web Studio for direct consultation and project planning."
      />
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Get in Touch
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Let's Discuss Your Next Project
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Have a question, need a website quote, or looking for an expedited build? Send a note
            and receive a direct reply within 24 hours.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-5 items-start">
          {/* Contact Details & Direct Connect (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-7 space-y-6">
              <h2 className="text-lg font-bold text-white">Direct Connect</h2>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Email Address</span>
                  <a
                    href={'mailto:' + settings.contactEmail}
                    className="text-sm font-semibold text-white hover:text-primary transition-colors"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#25D366]/20 text-[#25D366]">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">WhatsApp Direct Chat</span>
                  <a
                    href="https://wa.me/919490955048?text=Hello%20Teja%20Web%20Studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-foreground hover:text-[#25D366] transition-colors"
                  >
                    +91 94909 55048
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Response Time</span>
                  <span className="text-sm font-medium text-white">Under 24 hours (Mon - Fri)</span>
                </div>
              </div>
            </div>

            {/* Quick Assurance */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Our Promise
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We never outsource your development. You work directly with the architect building
                your site from the first message to final DNS launch.
              </p>
            </div>
          </div>

          {/* Inquiry Form (3 cols) */}
          <div className="md:col-span-3 rounded-3xl border border-border bg-card p-8 md:p-10">
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-white">Message Received!</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you for reaching out. We have saved your inquiry. We'll be in touch within
                  24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 rounded-full bg-secondary px-6 py-2 text-xs font-semibold text-white hover:bg-muted"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-white mb-2">Send an Inquiry</h2>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Field
                  label="Business type"
                  value={formData.businessType}
                  onChange={(value) => setFormData({ ...formData, businessType: value })}
                />
                <Field
                  label="Required service"
                  value={formData.service}
                  onChange={(value) => setFormData({ ...formData, service: value })}
                />
                <Field
                  label="Budget"
                  value={formData.budget}
                  onChange={(value) => setFormData({ ...formData, budget: value })}
                />
                {/* Honeypot field (hidden from genuine users) */}
                <input
                  type="text"
                  name="_hp_company"
                  value={formData._hp_company}
                  onChange={(e) => setFormData({ ...formData, _hp_company: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="block text-xs font-medium text-white mb-1.5"
                      htmlFor="ContactPage-field-0"
                    >
                      Your Full Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      id="ContactPage-field-0"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium text-white mb-1.5"
                      htmlFor="ContactPage-field-1"
                    >
                      Email Address <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      id="ContactPage-field-1"
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className="block text-xs font-medium text-white mb-1.5"
                      htmlFor="ContactPage-field-2"
                    >
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      id="ContactPage-field-2"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium text-white mb-1.5"
                      htmlFor="ContactPage-field-3"
                    >
                      Subject <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="New website for consulting business"
                      value={formData.subject}
                      id="ContactPage-field-3"
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-white mb-1.5"
                    htmlFor="ContactPage-field-4"
                  >
                    Your Message / Requirements <span className="text-primary">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about what you want your website to achieve, any reference websites you like, and your estimated timeline..."
                    value={formData.message}
                    id="ContactPage-field-4"
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary p-3.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="glow-card inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-semibold text-white shadow-glow hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
