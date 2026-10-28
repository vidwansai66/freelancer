import filesRoutes from './filesRoutes';
import clientProjectsRoutes from './clientProjectsRoutes';
import { apiValidation } from '../middleware/apiValidation';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { asyncRouter } from '../utils/asyncRouter';
import authRoutes from './authRoutes';
import servicesRoutes from './servicesRoutes';
import projectsRoutes from './projectsRoutes';
import pricingRoutes from './pricingRoutes';
import inquiriesRoutes from './inquiriesRoutes';
import quotationsRoutes from './quotationsRoutes';
import appointmentsRoutes from './appointmentsRoutes';
import testimonialsRoutes from './testimonialsRoutes';
import blogRoutes from './blogRoutes';
import faqRoutes from './faqRoutes';
import chatRoutes from './chatRoutes';
import dashboardRoutes from './dashboardRoutes';
import settingsRoutes from './settingsRoutes';
import zohoRoutes from './zohoRoutes';

const router = asyncRouter();
router.use(apiValidation);
router.use('/files', filesRoutes);
router.use('/client-projects', clientProjectsRoutes);

router.get('/notifications', authenticateAdmin, async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  res.json({
    success: true,
    data: [],
    meta: { page, limit, total: 0, totalPages: 1 },
  });
});

router.use('/auth', authRoutes);
router.use('/services', servicesRoutes);
router.use('/projects', projectsRoutes);
router.use('/pricing', pricingRoutes);
router.use('/inquiries', inquiriesRoutes);
router.use('/quotations', quotationsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/testimonials', testimonialsRoutes);
router.use('/blog', blogRoutes);
router.use('/faqs', faqRoutes);
router.use('/chat', chatRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/zoho', zohoRoutes);

export default router;
