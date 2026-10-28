export interface ServiceItem {
  _id: string;
  isPublished: boolean;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  deliverables: string[];
  startingPrice: number;
  isFeatured: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface ProjectItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string;
  resultStat: string;
  featuredImage: string;
  galleryImages: string[];
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  caseStudyMarkdown?: string;
  isFeatured: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface PricingPlanItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  description: string;
  badge?: string;
  isPopular: boolean;
  features: string[];
  ctaText: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface TestimonialItem {
  _id: string;
  clientName: string;
  company: string;
  role: string;
  avatarUrl: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface StudioSettings {
  _id: string;
  studioName: string;
  tagline: string;
  contactEmail: string;
  whatsappNumber: string;
  footerText: string;
  brandColor: string;
  timeZone: string;
  cancellationHours: number;
  businessHours: {
    start: string;
    end: string;
    workDays: number[];
  };
  slotDurationMinutes: number;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  };
}

export const servicesData: ServiceItem[] = [
  {
    _id: "srv-business-websites",
    isPublished: true,
    title: "Business Websites",
    slug: "business-websites",
    shortDescription: "A clean, professional site that tells your story and turns visitors into loyal customers.",
    fullDescription: "Comprehensive custom websites engineered specifically for small businesses, consulting practices, and growing brands. Includes responsive layouts, high performance, and conversion-centered design.",
    icon: "Globe",
    deliverables: [
      "Tailored multi-page UI architecture",
      "Mobile-responsive layout on all screen sizes",
      "Interactive contact and lead capture forms",
      "Google Analytics and tag manager setup"
    ],
    startingPrice: 449,
    isFeatured: true,
    orderIndex: 1,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-mobile-first-design",
    isPublished: true,
    title: "Mobile-First Design",
    slug: "mobile-first-design",
    shortDescription: "Every site looks perfect on phones, tablets, and desktops — where your customers are.",
    fullDescription: "Over 70% of web traffic originates on mobile devices. We build mobile-first with touch-friendly navigation, adaptive layouts, and instantaneous rendering.",
    icon: "Smartphone",
    deliverables: [
      "Fluid grid layouts and responsive typography",
      "Optimized assets for fast cellular load times",
      "Touch-optimized drawer navigation",
      "Cross-browser mobile compatibility testing"
    ],
    startingPrice: 299,
    isFeatured: true,
    orderIndex: 2,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-fast-and-optimized",
    isPublished: true,
    title: "Fast & Optimized",
    slug: "fast-and-optimized",
    shortDescription: "Lightning-fast loading speeds that keep visitors engaged and improve your ranking.",
    fullDescription: "Sub-second load times engineered with modern tooling, modern CSS, lightweight bundles, and caching strategies. Boost your Google Core Web Vitals to the top tier.",
    icon: "Zap",
    deliverables: [
      "Next-gen image formatting (WebP/AVIF)",
      "Code-splitting and asset minification",
      "Sub-1.5s Largest Contentful Paint (LCP)",
      "95+ Google PageSpeed score target"
    ],
    startingPrice: 199,
    isFeatured: true,
    orderIndex: 3,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-seo-basics-included",
    isPublished: true,
    title: "SEO Basics Included",
    slug: "seo-basics-included",
    shortDescription: "Built-in search optimization so local customers can actually find you on Google.",
    fullDescription: "Technical and on-page search engine optimization built right into your templates, semantic tags, Open Graph meta previews, XML sitemaps, and robots configuration.",
    icon: "Search",
    deliverables: [
      "Structured JSON-LD schema markup",
      "Dynamic Open Graph social preview cards",
      "XML Sitemap & Robots.txt configuration",
      "Google Search Console indexing integration"
    ],
    startingPrice: 199,
    isFeatured: true,
    orderIndex: 4,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-landing-pages",
    isPublished: true,
    title: "Landing Pages",
    slug: "landing-pages",
    shortDescription: "High-converting single pages for product launches, campaigns, and promotions.",
    fullDescription: "High-impact landing pages crafted with compelling visual hierarchy, persuasive social proof sections, and frictionless call-to-action triggers.",
    icon: "Code",
    deliverables: [
      "A/B test ready conversion layout",
      "Lead capture modal and CRM integration",
      "Frictionless booking or purchase trigger",
      "Instant 5-day delivery turnaround"
    ],
    startingPrice: 199,
    isFeatured: true,
    orderIndex: 5,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-quick-launch",
    isPublished: true,
    title: "Quick Launch",
    slug: "quick-launch",
    shortDescription: "From first call to live website in as little as 5–7 days. No endless waiting.",
    fullDescription: "Agile design-to-production pipeline ensuring rapid turnaround without cutting corners on design polish or code quality.",
    icon: "Rocket",
    deliverables: [
      "Discovery sprint within 24 hours",
      "Interactive live staging preview on day 3",
      "Feedback and refinement on day 5",
      "Domain DNS pointing and SSL launch on day 7"
    ],
    startingPrice: 349,
    isFeatured: true,
    orderIndex: 6,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-portfolio-websites",
    isPublished: true,
    title: "Portfolio Websites",
    slug: "portfolio-websites",
    shortDescription: "Showcase your work with an accessible, responsive personal portfolio.",
    fullDescription: "Bespoke digital portfolios engineered for creative professionals, photographers, consultants, and engineers who need to stand out.",
    icon: "Globe",
    deliverables: [
      "Custom project gallery grid",
      "Filterable case study views",
      "Direct contact call to action",
      "Responsive layout on all devices"
    ],
    startingPrice: 199,
    isFeatured: false,
    orderIndex: 7,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-e-commerce-websites",
    isPublished: true,
    title: "E-commerce Websites",
    slug: "e-commerce-websites",
    shortDescription: "Product catalogs, checkout integration and storefront design.",
    fullDescription: "High-performance digital storefronts with seamless cart experience, payment gateways, and inventory showcasing.",
    icon: "Globe",
    deliverables: [
      "Product showcase catalog",
      "Secure payment checkout integration",
      "Order notification alerts",
      "Mobile-optimized shopping cart"
    ],
    startingPrice: 599,
    isFeatured: false,
    orderIndex: 8,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-website-redesign",
    isPublished: true,
    title: "Website Redesign",
    slug: "website-redesign",
    shortDescription: "Refresh your website design, usability and performance.",
    fullDescription: "Transform slow, dated websites into cutting-edge, mobile-first conversion engines with sub-second speeds and modern aesthetics.",
    icon: "Globe",
    deliverables: [
      "Complete visual UI overhaul",
      "PageSpeed 95+ optimization",
      "Content migration & SEO redirect preservation",
      "Modern brand aesthetic integration"
    ],
    startingPrice: 349,
    isFeatured: false,
    orderIndex: 9,
    createdAt: "2026-10-27T13:13:45.028Z"
  },
  {
    _id: "srv-website-maintenance",
    isPublished: true,
    title: "Website Maintenance",
    slug: "website-maintenance",
    shortDescription: "Updates, backups, content changes and ongoing website support.",
    fullDescription: "Stress-free ongoing website maintenance, security patches, regular backups, and rapid on-demand content edits.",
    icon: "Globe",
    deliverables: [
      "Scheduled uptime & performance monitoring",
      "Same-day minor content updates",
      "Security patches & dependency maintenance",
      "Monthly performance & analytics summary"
    ],
    startingPrice: 99,
    isFeatured: false,
    orderIndex: 10,
    createdAt: "2026-10-27T13:13:45.028Z"
  }
];

export const projectsData: ProjectItem[] = [
  {
    _id: "prj-bean-and-bloom",
    title: "Bean & Bloom",
    slug: "bean-and-bloom",
    category: "Coffee Shop & Bakery",
    clientName: "Bean & Bloom Roasters",
    resultStat: "Online orders up 40% in first month",
    featuredImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
    ],
    liveUrl: "https://example.com/bean-bloom",
    githubUrl: "",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Stripe"],
    caseStudyMarkdown: "### The Challenge\nBean & Bloom had an outdated website that was difficult to navigate on mobile devices and did not support digital ordering.\n\n### The Solution\nWe designed and built a warm, modern, mobile-first website complete with digital menu exploration, table reservations, and an online coffee bean subscription store.\n\n### The Outcome\nOnline pick-up orders increased by 40% within the first 30 days, and mobile visitors stayed on the site 3.2x longer.",
    isFeatured: true,
    orderIndex: 1,
    createdAt: "2026-10-27T13:13:45.087Z"
  },
  {
    _id: "prj-verde-fitness",
    title: "Verde Fitness Studio",
    slug: "verde-fitness",
    category: "Fitness Studio & Gym",
    clientName: "Verde Fitness Studio",
    resultStat: "120+ new member sign-ups from the site",
    featuredImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
    ],
    liveUrl: "https://example.com/verde-fitness",
    githubUrl: "",
    technologies: ["React", "Vite", "Tailwind CSS", "Calendar API"],
    caseStudyMarkdown: "### The Challenge\nVerde Fitness was losing prospective members because booking a free trial class required calling during gym hours.\n\n### The Solution\nWe implemented an interactive class timetable with 1-click trial booking, instructor spotlights, and automated SMS/email reminders.\n\n### The Outcome\nDirect online sign-ups surged by over 120 members in the first quarter with 98% class capacity.",
    isFeatured: true,
    orderIndex: 2,
    createdAt: "2026-10-27T13:13:45.087Z"
  },
  {
    _id: "prj-prestige-real-estate",
    title: "Prestige Real Estate",
    slug: "prestige-real-estate",
    category: "Agency Website",
    clientName: "Prestige Realty Group",
    resultStat: "3x more consultation bookings",
    featuredImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ],
    liveUrl: "https://example.com/prestige-realty",
    githubUrl: "",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Mapbox"],
    caseStudyMarkdown: "### The Challenge\nPrestige Real Estate needed a high-end web presence that conveyed luxury and made scheduling property viewings effortless.\n\n### The Solution\nWe built an immersive property gallery with filtering by neighborhood and price, video walkthrough embeds, and instant agent WhatsApp connect.\n\n### The Outcome\nConsultation inquiries tripled within 60 days, with average lead value increasing by 28%.",
    isFeatured: true,
    orderIndex: 3,
    createdAt: "2026-10-27T13:13:45.087Z"
  }
];

export const pricingPlansData: PricingPlanItem[] = [
  {
    _id: "prc-starter",
    name: "Starter",
    slug: "starter",
    price: 199,
    billingCycle: "one-time",
    description: "Perfect for getting your business online fast with high credibility.",
    badge: "",
    isPopular: false,
    features: [
      "1-page modern responsive website",
      "Mobile-friendly design",
      "Contact and inquiry form",
      "Basic SEO setup and meta tags",
      "Delivered in 5 days",
      "1 revision round included"
    ],
    ctaText: "Get Started",
    orderIndex: 1,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.100Z"
  },
  {
    _id: "prc-business",
    name: "Business",
    slug: "business",
    price: 449,
    billingCycle: "one-time",
    description: "Most popular for small businesses and service providers ready to grow.",
    badge: "MOST POPULAR",
    isPopular: true,
    features: [
      "Up to 5 custom-designed pages",
      "Tailored brand identity styling",
      "Contact and booking request forms",
      "Google Maps and social link integration",
      "Comprehensive SEO optimization",
      "Delivered in 7 days",
      "3 revision rounds included",
      "1 month of free ongoing support"
    ],
    ctaText: "Get Started",
    orderIndex: 2,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.100Z"
  },
  {
    _id: "prc-premium",
    name: "Premium",
    slug: "premium",
    price: 899,
    billingCycle: "one-time",
    description: "For businesses ready to expand with full content management and analytics.",
    badge: "GROWTH SUITE",
    isPopular: false,
    features: [
      "Up to 10 custom pages",
      "Premium bespoke design system",
      "Blog / articles section with CMS",
      "Advanced SEO and conversion analytics",
      "Speed and Core Web Vitals optimization",
      "Delivered in 10 days",
      "Unlimited revisions",
      "3 months of free maintenance & support"
    ],
    ctaText: "Get Started",
    orderIndex: 3,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.100Z"
  }
];

export const faqsData: FAQItem[] = [
  {
    _id: "faq-1",
    question: "How long does it take to build my website?",
    answer: "Our average delivery time is 5 to 7 days for Starter and Business packages. Premium packages take roughly 10 days from receipt of all initial assets.",
    category: "General",
    orderIndex: 1,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.123Z"
  },
  {
    _id: "faq-2",
    question: "Are there any hidden monthly fees or subscriptions?",
    answer: "None whatsoever. All our package prices are one-time payments. You own your code and domain 100%. The only recurring cost is your standard domain and hosting provider (typically $3-$8/month), which we help you set up.",
    category: "Pricing",
    orderIndex: 2,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.124Z"
  },
  {
    _id: "faq-3",
    question: "Will my website work properly on mobile phones and tablets?",
    answer: "Yes! Every website is built mobile-first. We test extensively across iOS and Android smartphones, iPads, and standard desktop screens to guarantee a seamless layout.",
    category: "Technical",
    orderIndex: 3,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.124Z"
  },
  {
    _id: "faq-4",
    question: "Can I request edits or revisions during the build?",
    answer: "Absolutely. Every package includes dedicated revision rounds where you review the interactive staging link and we make adjustments before launching publicly.",
    category: "Process",
    orderIndex: 4,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.124Z"
  },
  {
    _id: "faq-5",
    question: "Do you help with SEO so customers can find me on Google?",
    answer: "Yes, basic technical SEO (meta titles, descriptions, schema tags, sitemap, and fast performance scores) is included in every project we launch.",
    category: "Technical",
    orderIndex: 5,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.124Z"
  },
  {
    _id: "faq-6",
    question: "What if I need updates or changes after the site launches?",
    answer: "Our Business and Premium packages include free post-launch support. Beyond that, we offer low-cost on-demand update packages or easy maintenance retainers.",
    category: "Process",
    orderIndex: 6,
    isActive: true,
    createdAt: "2026-10-27T13:13:45.124Z"
  }
];

export const testimonialsData: TestimonialItem[] = [
  {
    _id: "tst-sarah",
    clientName: "Sarah Jenkins",
    company: "Bean & Bloom Roasters",
    role: "Owner & Head Roaster",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText: "Teja made getting our website live effortless. Delivered in 6 days and our online coffee orders were up 40% in our first month. Highly recommended!",
    isApproved: true,
    isFeatured: true,
    createdAt: "2026-10-27T13:13:45.138Z"
  },
  {
    _id: "tst-marcus",
    clientName: "Marcus Vance",
    company: "Verde Fitness Studio",
    role: "Managing Director",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText: "We gained over 120 new member sign-ups in our first 90 days. The design looks ultra-premium and works flawlessly on phones.",
    isApproved: true,
    isFeatured: true,
    createdAt: "2026-10-27T13:13:45.138Z"
  },
  {
    _id: "tst-elena",
    clientName: "Elena Rostova",
    company: "Prestige Realty Group",
    role: "Principal Broker",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText: "Our consultation bookings tripled after launching our new site. The speed, typography, and WhatsApp integration are top-notch.",
    isApproved: true,
    isFeatured: true,
    createdAt: "2026-10-27T13:13:45.138Z"
  }
];

export const blogPostsData: BlogPostItem[] = [
  {
    _id: "blg-mobile-first",
    title: "5 Reasons Your Small Business Website Needs to Be Mobile-First in 2026",
    slug: "5-reasons-small-business-mobile-first",
    summary: "Over 70% of potential customers visit your site from their phone. Here is why desktop-first design is quietly killing your conversions.",
    content: "## Why Mobile Optimization Matters More Than Ever\nWhen customers search for local services, they are holding a smartphone in their hand. If your site takes more than 3 seconds to load or requires pinch-zooming to read, 53% of those visitors leave immediately.\n\n### Key Benefits of Mobile-First Development\n1. **Faster Load Speeds**: Clean, stripped-down styles keep mobile data transfer low.\n2. **Higher Google Rankings**: Google strictly uses mobile-first indexing to rank search results.\n3. **Frictionless Action Triggers**: Tap-to-call and WhatsApp click-to-chat connect customers instantly.",
    coverImage: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80",
    author: "Teja Web Studio",
    tags: ["Web Design", "Mobile-First", "Small Business"],
    readTimeMinutes: 4,
    isPublished: true,
    publishedAt: "2026-10-27T13:13:45.163Z",
    createdAt: "2026-10-27T13:13:45.166Z"
  },
  {
    _id: "blg-local-inquiries",
    title: "How a Modern Website Directly Increases Local Inquiries and Sales",
    slug: "how-modern-website-increases-local-inquiries",
    summary: "Your website is your 24/7 digital storefront. Discover the small design tweaks that turn passive window shoppers into paying clients.",
    content: "## Turning Visitors Into Customers\nA high-converting website isn't just about flashy visuals — it's about clarity and credibility. When visitors land on your page, they need to know:\n- Who you are and what problem you solve\n- Why they can trust you (social proof and real reviews)\n- Exactly what step to take next (clear, high-contrast calls to action)",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    author: "Teja Web Studio",
    tags: ["Conversion Rate", "Strategy", "ROI"],
    readTimeMinutes: 5,
    isPublished: true,
    publishedAt: "2026-10-27T13:13:45.163Z",
    createdAt: "2026-10-27T13:13:45.166Z"
  }
];

export const studioSettingsData: StudioSettings = {
  _id: "settings-default",
  studioName: "Teja Web Studio",
  tagline: "Simple, Affordable Websites for Small Businesses",
  contactEmail: "hello@tejastudio.com",
  whatsappNumber: "919490955048",
  footerText: "Bespoke websites for startups and small businesses.",
  brandColor: "#10b981",
  timeZone: "Asia/Kolkata",
  cancellationHours: 24,
  businessHours: {
    start: "09:00",
    end: "18:00",
    workDays: [1, 2, 3, 4, 5]
  },
  slotDurationMinutes: 30,
  socialLinks: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    dribbble: "https://dribbble.com"
  }
};
