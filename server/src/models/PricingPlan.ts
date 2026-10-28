export interface IPricingPlan {
  id: string;
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
  createdAt: Date;
}
