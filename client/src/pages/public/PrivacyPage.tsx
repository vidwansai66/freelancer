import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Seo } from '../../components/common/Seo';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Privacy Policy"
        description="Privacy policy and data handling practices at Teja Web Studio. Learn how your project inquiries and contact information are protected."
      />
      <div className="mx-auto max-w-3xl px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Legal Notice
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              When you submit a contact inquiry, quotation request, or appointment booking through
              Teja Web Studio, we collect only the personal information you explicitly provide: your
              name, email address, phone number, and project brief description.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. How We Use Your Data</h2>
            <p>We use your submitted details exclusively to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Respond directly to your project inquiry or proposal request</li>
              <li>Schedule and confirm your discovery video consultation</li>
              <li>Send transaction receipts and calendar meeting links</li>
            </ul>
            <p>
              We do not sell, rent, or distribute your email or personal information to third-party
              marketing brokers under any circumstances.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Data Retention &amp; Security</h2>
            <p>
              Information is stored in secure cloud database instances protected by strict access
              controls and encrypted over transport using HTTPS/TLS. You may request deletion of
              your contact records at any time by contacting hello@tejastudio.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
