import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, MessageSquare, ArrowRight } from 'lucide-react';
import { FAQ } from '../../types';
import { faqApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [openIndices, setOpenIndices] = useState<Record<string, boolean>>({ '0': true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faqApi
      .getActive()
      .then((data) => setFaqs(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'General', 'Pricing', 'Process', 'Technical'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat =
      selectedCategory === 'All' || faq.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleIndex = (id: string) => {
    setOpenIndices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.slice(0, 10).map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : undefined;

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Frequently Asked Questions (FAQ)"
        description="Common questions answered about custom website development, turnaround times, SEO optimization, and pricing."
        jsonLd={faqSchema}
      />
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Help Center
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">Frequently Asked Questions</h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Find immediate answers regarding delivery timelines, pricing, code ownership, technical
            setup, and post-launch maintenance.
          </p>
        </div>

        {/* Search & Categories */}
        <div className="space-y-4 mb-10 pb-6 border-b border-border">
          <div className="relative max-w-md mx-auto">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-secondary text-muted-foreground hover:text-white border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading FAQs...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            No questions found matching your filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openIndices[faq._id];
              return (
                <div
                  key={faq._id}
                  className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleIndex(faq._id)}
                    className="w-full flex items-center justify-between p-6 text-left font-semibold text-white hover:text-primary transition-colors text-sm"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Questions Card */}
        <div className="mt-16 rounded-3xl border border-border bg-card p-8 md:p-10 text-center flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Still have questions about your project?</h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-md">
            Click the live chat box in the bottom corner or book a 30-minute discovery consultation
            to talk through your requirements.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/book"
              className="glow-card rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-glow"
            >
              Book a Call
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-border bg-secondary px-6 py-2.5 text-xs font-semibold text-white hover:bg-muted"
            >
              Send Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
