import { asyncRouter } from '../utils/asyncRouter';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from '../controllers/projectsController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = asyncRouter();

// Public routes
router.get('/', getProjects);

// Admin protected routes (NOTE: specific routes like /reorder before /:slug or /:id)
router.put('/reorder', authenticateAdmin, reorderProjects);
router.post('/', authenticateAdmin, createProject);
router.put('/:id', authenticateAdmin, updateProject);
router.delete('/:id', authenticateAdmin, deleteProject);

// Public slug route (after /reorder)
router.get('/:slug', getProjectBySlug);

export default router;
