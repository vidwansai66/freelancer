import React, { useEffect, useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Testimonial } from '../../types';
import { testimonialsApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Review submission state
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testimonialsApi
      .getApproved()
      .then((data) => setReviews(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientName.trim() || !company.trim() || !reviewText.trim()) {
      setError('Please provide your name, company, and review message.');
      return;
    }

    setSubmitting(true);
    try {
      await testimonialsApi.submit({
        clientName: clientName.trim(),
        company: company.trim(),
        role: role.trim() || 'Client',
        rating,
        reviewText: reviewText.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Client Reviews & Testimonials"
        description="Read verified client feedback and testimonials from business owners who partnered with Teja Web Studio for their custom websites."
      />
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Client Trust
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Client Reviews &amp; Testimonials
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Real feedback from business owners and founders who launched their websites with Teja
            Web Studio.
          </p>

          <div className="mt-8 flex justify-center items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-white">
              {reviews.length
                ? (
                    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
                  ).toFixed(1)
                : '—'}{' '}
              / 5.0 Average Rating
            </span>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                setModalOpen(true);
                setSubmitted(false);
              }}
              className="glow-card inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all"
            >
              <MessageSquarePlus className="h-4 w-4" /> Share Your Experience
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading reviews...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="rounded-2xl border border-border bg-card p-7 flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground italic">
                    "{rev.reviewText}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-3">
                  {rev.avatarUrl ? (
                    <img
                      src={rev.avatarUrl}
                      alt={rev.clientName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                      {rev.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.clientName}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      {rev.company} • {rev.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Review Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-muted-foreground hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                  <h3 className="text-xl font-bold text-white">Thank You for Your Feedback!</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your review has been submitted for administrative moderation and will appear
                    publicly once approved.
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="mt-4 rounded-full bg-secondary px-6 py-2 text-xs font-semibold text-white hover:bg-muted"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Submit a Client Review</h3>

                  {error && (
                    <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-[11px] text-muted-foreground mb-1"
                      htmlFor="ReviewsPage-field-0"
                    >
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      id="ReviewsPage-field-0"
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-[11px] text-muted-foreground mb-1"
                        htmlFor="ReviewsPage-field-1"
                      >
                        Company / Project *
                      </label>
                      <input
                        type="text"
                        required
                        value={company}
                        id="ReviewsPage-field-1"
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Bean & Bloom"
                        className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-[11px] text-muted-foreground mb-1"
                        htmlFor="ReviewsPage-field-2"
                      >
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={role}
                        id="ReviewsPage-field-2"
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Founder"
                        className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[11px] text-muted-foreground mb-1"
                      htmlFor="ReviewsPage-field-3"
                    >
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            star <= rating
                              ? 'border-amber-400 bg-amber-400/20 text-amber-400'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="ReviewsPage-field-3"
                      className="block text-[11px] text-muted-foreground mb-1"
                    >
                      Review Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reviewText}
                      id="ReviewsPage-field-3"
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="How was your experience working with Teja Web Studio? What were your project outcomes?"
                      className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="glow-card w-full rounded-full bg-primary py-3 text-xs font-semibold text-white shadow-glow hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Post Review for Moderation'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
