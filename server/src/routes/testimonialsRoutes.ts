import { asyncRouter } from '../utils/asyncRouter';
import {
  getApprovedTestimonials,
  submitReview,
  getAllTestimonialsAdmin,
  toggleApproveTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialsController';
import { contentStore } from '../services/contentStore';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';

const router = asyncRouter();

router.post('/admin', authenticateAdmin, async (req, res) => {
  const review = contentStore.addTestimonial(req.body);
  res.status(201).json({ success: true, data: review });
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const review = contentStore.updateTestimonial(req.params.id, req.body);
  if (!review) return void res.status(404).json({ success: false, error: 'Review not found.' });
  res.json({ success: true, data: review });
});

// Public routes
router.get('/', getApprovedTestimonials);
router.post('/', formSubmissionRateLimiter, submitReview);

// Admin protected routes
router.get('/admin/all', authenticateAdmin, getAllTestimonialsAdmin);
router.put('/:id/approve', authenticateAdmin, toggleApproveTestimonial);
router.delete('/:id', authenticateAdmin, deleteTestimonial);

export default router;
