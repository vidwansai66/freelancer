import React from 'react';
import { Sparkles } from 'lucide-react';

export const AgencyMarquee: React.FC = () => {
  const items = [
    'Custom Web Systems',
    'Lightning Load Speeds',
    'Next.js & React FullStack',
    'Bespoke Motion Design',
    'Enterprise SEO & Discovery',
    'Autonomous Workflows',
    'Conversion UX Architecture',
    '100% Code Ownership',
    'Sub-Second Edge Delivery',
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-border/80 bg-card/60 backdrop-blur-md py-4 select-none">
      {/* Side gradient fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="marquee-track flex items-center gap-8">
        {/* Double the list for seamless continuous infinite loop */}
        {items.concat(items).map((item, index) => (
          <div key={index} className="flex items-center gap-6 whitespace-nowrap">
            <span className="text-xs md:text-sm font-semibold tracking-wider uppercase text-foreground/85 transition-colors hover:text-primary">
              {item}
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
