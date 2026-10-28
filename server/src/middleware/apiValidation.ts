import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { validDate, minutes } from '../utils/bookingRules';
import { sendError } from '../utils/apiResponse';

const text = z.string().trim().max(1000);
const long = z.string().trim().max(30000);
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
const optionalEmail = z.union([email, z.literal('')]).optional();
const url = z.union([
  z
    .string()
    .url()
    .refine((value) => /^https?:\/\//.test(value), 'Use an HTTP or HTTPS URL'),
  z.literal(''),
]);
const image = z.union([url, z.string().regex(/^\/api\/files\/[a-zA-Z0-9_-]{1,64}$/)]);
const count = z.number().int().min(0).max(1000000);
const money = z.number().min(0).max(100000000);
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const date = z.string().refine(validDate, 'Invalid calendar date');
const stringList = z.array(text).max(100);
const token = z.string().trim().min(8).max(128);
const fileIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
const oid = fileIdSchema;
const attachments = z.array(z.object({ fileId: fileIdSchema, token })).max(5);
const objects: Record<string, z.ZodObject<any>> = {
  inquiries: z.object({
    name: text.min(1),
    email,
    phone: text.optional(),
    subject: text.min(1),
    message: long.min(1),
    businessType: text.optional(),
    service: text.optional(),
    budget: text.optional(),
    idempotencyKey: text.optional(),
    _hp_company: text.optional(),
  }),
  quotations: z.object({
    name: text.min(1),
    email,
    phone: text.optional(),
    company: text.optional(),
    businessType: text.optional(),
    projectType: text.min(1),
    budgetRange: text.min(1),
    timeline: text.min(1),
    requiredFeatures: stringList.optional(),
    description: long.min(1),
    estimatedQuote: money.optional(),
    attachments: attachments.optional(),
    idempotencyKey: text.optional(),
    _hp_company: text.optional(),
  }),
  services: z.object({
    title: text.min(1),
    slug: text.optional(),
    shortDescription: text.min(1),
    fullDescription: long.optional(),
    icon: text.optional(),
    deliverables: stringList.optional(),
    startingPrice: money.optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    orderIndex: count.optional(),
  }),
  projects: z.object({
    title: text.min(1),
    slug: text.optional(),
    category: text.min(1),
    clientName: text.min(1),
    resultStat: text.optional(),
    featuredImage: image,
    galleryImages: z.array(image).max(30).optional(),
    liveUrl: url.optional(),
    githubUrl: url.optional(),
    technologies: stringList.optional(),
    caseStudyMarkdown: long.optional(),
    isFeatured: z.boolean().optional(),
    orderIndex: count.optional(),
  }),
  pricing: z.object({
    name: text.min(1),
    slug: text.optional(),
    price: money,
    billingCycle: text.optional(),
    description: long.min(1),
    badge: text.optional(),
    isPopular: z.boolean().optional(),
    features: stringList.optional(),
    ctaText: text.optional(),
    orderIndex: count.optional(),
    isActive: z.boolean().optional(),
  }),
  blog: z.object({
    title: text.min(1),
    slug: text.optional(),
    summary: long.min(1),
    content: long.min(1),
    coverImage: image.optional(),
    author: text.optional(),
    tags: stringList.optional(),
    readTimeMinutes: z.number().int().min(1).max(120).optional(),
    isPublished: z.boolean().optional(),
    seoTitle: z.string().trim().max(120).optional(),
    seoDescription: z.string().trim().max(320).optional(),
  }),
  faqs: z.object({
    question: text.min(1),
    answer: long.min(1),
    category: text.optional(),
    orderIndex: count.optional(),
    isActive: z.boolean().optional(),
  }),
  testimonials: z.object({
    clientName: text.min(1),
    company: text.optional(),
    role: text.optional(),
    reviewText: long.min(1),
    rating: z.number().int().min(1).max(5),
    avatarUrl: image.optional(),
    isApproved: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
};
const settings = z.object({
  studioName: text.min(1),
  tagline: text,
  contactEmail: email,
  whatsappNumber: text,
  logoUrl: image.optional(),
  footerText: long.optional(),
  brandColor: z
    .string()
    .regex(/^#[a-fA-F0-9]{6}$/)
    .optional(),
  timeZone: z
    .string()
    .refine((value) => {
      try {
        new Intl.DateTimeFormat('en', { timeZone: value });
        return true;
      } catch {
        return false;
      }
    })
    .optional(),
  cancellationHours: z.number().int().min(0).max(168).optional(),
  businessHours: z
    .object({
      start: time,
      end: time,
      workDays: z.array(z.number().int().min(1).max(7)).min(1).max(7),
    })
    .refine(
      (value) => minutes(value.start) < minutes(value.end),
      'Closing time must follow opening time',
    ),
  slotDurationMinutes: z.number().int().min(15).max(120),
  socialLinks: z.object({
    github: url.optional(),
    linkedin: url.optional(),
    twitter: url.optional(),
    dribbble: url.optional(),
  }),
  pageSeo: z
    .record(
      z.object({ title: z.string().trim().max(120), description: z.string().trim().max(320) }),
    )
    .optional(),
});
const booking = z.object({
  clientName: text.min(1),
  clientEmail: email,
  clientPhone: text.optional(),
  serviceType: text.min(1),
  appointmentDate: date,
  startTime: time,
  endTime: time,
  notes: long.optional(),
  meetingLink: url.optional(),
  idempotencyKey: text.optional(),
});

export const apiValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Reject object-valued query parameters and bound list queries before any controller sees them.
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value !== 'string') throw new Error('Query parameters must be strings.');
      if (value.length > 500) throw new Error('Query parameter too long.');
      if (
        ['page', 'limit'].includes(key) &&
        (!/^\d+$/.test(value) ||
          Number(value) < 1 ||
          Number(value) > (key === 'limit' ? 100 : 100000))
      )
        throw new Error('Invalid pagination.');
    }
    const segments = req.path.split('/').filter(Boolean);
    const [module, id, action] = segments;
    if (
      id &&
      /^[a-zA-Z0-9_-]{1,64}$/i.test(id) === false &&
      ['PUT', 'DELETE'].includes(req.method) &&
      module !== 'chat' &&
      module !== 'auth'
    )
      throw new Error('Invalid record ID.');
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();
    let schema: z.ZodTypeAny | undefined;
    if (objects[module] && !id) schema = objects[module];
    if (objects[module] && id && req.method === 'PUT') schema = objects[module].partial();
    if (module === 'inquiries' && action === 'status')
      schema = z.object({ status: z.enum(['new', 'in_progress', 'resolved', 'archived']) });
    if (module === 'inquiries' && action === 'reply')
      schema = z.object({ replyMessage: long.min(1) });
    if (module === 'quotations' && id && req.method === 'PUT')
      schema = z.object({
        status: z.enum(['new', 'reviewing', 'quoted', 'accepted', 'declined']).optional(),
        estimatedQuote: money.optional(),
        notes: long.optional(),
        proposal: long.optional(),
      });
    if (module === 'testimonials' && id === 'admin') schema = objects.testimonials;
    if (module === 'testimonials' && action === 'approve')
      schema = z.object({ isApproved: z.boolean().optional(), isFeatured: z.boolean().optional() });
    if (module === 'settings') schema = settings;
    if (module === 'auth' && id === 'login')
      schema = z.object({ email, password: z.string().min(1).max(200) });
    if (module === 'auth' && id === 'profile')
      schema = z.object({
        email: email.optional(),
        fullName: text.min(1).optional(),
        currentPassword: z.string().max(200).optional(),
        newPassword: z.string().min(12).max(200).optional(),
      });
    if (module === 'auth' && id === 'users')
      schema = z.object({
        email,
        fullName: text.min(1),
        password: z.string().min(12).max(200),
        role: z.enum(['admin', 'superadmin']),
      });
    if (module === 'appointments' && !id) schema = booking;
    if (module === 'appointments' && id && req.method === 'PUT')
      schema = z.object({
        appointmentDate: date.optional(),
        startTime: time.optional(),
        endTime: time.optional(),
        status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).optional(),
        notes: long.optional(),
        meetingLink: url.optional(),
      });
    if (module === 'appointments' && id === 'manage')
      schema = z.object({
        token,
        action: z.enum(['view', 'cancel', 'reschedule']),
        appointmentDate: date.optional(),
        startTime: time.optional(),
        endTime: time.optional(),
      });
    if (module === 'files' && !id)
      schema = z.object({
        filename: z.string().min(1).max(150),
        mime: z.enum(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']),
        base64: z
          .string()
          .min(1)
          .max(7 * 1024 * 1024),
        visibility: z.enum(['public', 'private']).default('private'),
      });
    if (module === 'client-projects' && id === 'track') schema = z.object({ token });
    if (module === 'client-projects' && !id)
      schema = z.object({
        sourceType: z.string().optional(),
        sourceId: z.string().optional(),
        title: text.optional(),
        clientName: text.optional(),
        clientEmail: email.optional(),
        proposal: long.optional(),
        quoteAmount: money.optional(),
        meetingLink: url.optional(),
      });
    if (module === 'client-projects' && id && req.method === 'PUT')
      schema = z.object({
        status: z
          .enum(['inquiry', 'quotation', 'approved', 'in_progress', 'completed', 'cancelled'])
          .optional(),
        update: long.optional(),
        proposal: long.optional(),
        quoteAmount: money.optional(),
        documents: z.array(oid).max(20).optional(),
        meetingLink: url.optional(),
      });
    if (module === 'chat') {
      if (id === 'session')
        schema = z.object({
          sessionId: token,
          clientName: text.min(1),
          clientEmail: email,
        });
      else if (action === 'message' || segments[3] === 'reply')
        schema = z.object({
          message: long.min(1),
          clientName: text.optional(),
          clientEmail: optionalEmail,
        });
      else schema = z.object({});
    }
    if (schema) req.body = schema.parse(req.body);
    next();
  } catch (error) {
    sendError(
      res,
      error instanceof ZodError
        ? error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
        : (error as Error).message,
      400,
      'Validation failed',
    );
  }
};
