import { asyncRouter } from '../utils/asyncRouter';
import { loginAdmin, getCurrentAdmin, updateAdminProfile } from '../controllers/authController';
import { authenticateAdmin, requireSuperadmin } from '../middleware/authMiddleware';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { env } from '../config/env';

const router = asyncRouter();

router.post('/logout', (_req, res) => {
  res.clearCookie('studio_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/users', authenticateAdmin, requireSuperadmin, async (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'superadmin',
        email: env.DEFAULT_ADMIN_EMAIL,
        fullName: env.DEFAULT_ADMIN_NAME,
        role: 'superadmin',
      },
    ],
  });
});

router.post('/login', loginRateLimiter, loginAdmin);
router.get('/me', authenticateAdmin, getCurrentAdmin);
router.put('/profile', authenticateAdmin, updateAdminProfile);

export default router;
