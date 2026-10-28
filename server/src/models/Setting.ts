export interface ISetting {
  id: string;
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
  createdAt: Date;
}
