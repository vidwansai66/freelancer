import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Seo } from '../../components/common/Seo';

export const TermsPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Terms of Service"
        description="Terms of service, delivery policies, payment milestones, and code ownership conditions for clients of Teja Web Studio."
      />
      <div className="mx-auto max-w-3xl px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Client Terms
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Engagement &amp; Scope of Work</h2>
            <p>
              Teja Web Studio provides freelance web design, frontend engineering, backend API
              development, and deployment services based on mutually agreed quotation packages or
              custom proposals.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              2. Delivery Timelines &amp; Review Rounds
            </h2>
            <p>
              Average project turnaround ranges between 5 to 10 days depending on the selected
              package tier. Client feedback during designated review rounds must be communicated
              promptly to maintain scheduled launch dates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">
              3. Intellectual Property &amp; Code Ownership
            </h2>
            <p>
              Upon receipt of final milestone payment, full ownership of custom design layouts,
              frontend components, and code assets transfers entirely to the client. The client owns
              all deliverables with no recurring licensing fees to the studio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Post-Launch Maintenance</h2>
            <p>
              Free bug-fix and adjustment support is included according to package specifications
              (up to 3 months). Beyond the agreed support period, maintenance retainers are
              available upon request.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
