import { csvCell } from '../utils/security';
import { asyncRouter } from '../utils/asyncRouter';
import {
  submitInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  replyToInquiry,
  deleteInquiry,
} from '../controllers/inquiriesController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { formSubmissionRateLimiter } from '../middleware/rateLimiter';
import { checkHoneypotAndDuplicate } from '../middleware/idempotency';

const router = asyncRouter();

// Public submission
router.post('/', formSubmissionRateLimiter, checkHoneypotAndDuplicate, submitInquiry);

// Admin management
router.get('/', authenticateAdmin, getInquiries);
router.get('/export', authenticateAdmin, async (_req, res) => {
  res.type('text/csv').attachment('inquiries.csv');
  res.write('Name,Email,Phone,Business type,Service,Budget,Subject,Message,Status,Created\r\n');
  res.end();
});
router.get('/:id', authenticateAdmin, getInquiryById);
router.put('/:id/status', authenticateAdmin, updateInquiryStatus);
router.post('/:id/reply', authenticateAdmin, replyToInquiry);
router.delete('/:id', authenticateAdmin, deleteInquiry);

export default router;
