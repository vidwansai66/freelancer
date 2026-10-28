import { asyncRouter } from '../utils/asyncRouter';
import {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} from '../controllers/servicesController';
import { contentStore } from '../services/contentStore';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/apiResponse';

const router = asyncRouter();

// Public routes
router.get('/', getServices);
router.get('/admin/all', authenticateAdmin, async (_req, res) => {
  const services = contentStore.getServices(true);
  sendSuccess(res, services, 'All services retrieved successfully.');
});
router.get('/:slug', getServiceBySlug);

// Admin protected routes
router.post('/', authenticateAdmin, createService);
router.put('/:id', authenticateAdmin, updateService);
router.delete('/:id', authenticateAdmin, deleteService);

export default router;
