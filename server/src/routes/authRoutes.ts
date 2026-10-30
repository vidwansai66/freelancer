import { asyncRouter } from '../utils/asyncRouter';
import { loginAdmin, getCurrentAdmin, updateAdminProfile } from '../controllers/authController';
import { authenticateAdmin, requireSuperadmin } from '../middleware/authMiddleware';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { env } from '../config/env';
import { randomUUID } from 'crypto';

interface AdminUserRecord {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin';
}

const adminUsers: AdminUserRecord[] = [
  {
    id: 'superadmin',
    email: env.DEFAULT_ADMIN_EMAIL,
    fullName: env.DEFAULT_ADMIN_NAME,
    role: 'superadmin',
  },
];

const router = asyncRouter();

router.post('/logout', (_req, res) => {
  res.clearCookie('studio_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/users', authenticateAdmin, requireSuperadmin, async (_req, res) => {
  res.json({
    success: true,
    data: adminUsers,
  });
});

router.post('/users', authenticateAdmin, requireSuperadmin, async (req, res) => {
  const { email, fullName, role } = req.body;
  if (!email || !fullName) {
    res.status(400).json({ success: false, error: 'Email and full name are required.' });
    return;
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const existing = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    res.status(409).json({ success: false, error: 'An admin account with this email already exists.' });
    return;
  }
  const newUser: AdminUserRecord = {
    id: `adm-${randomUUID().slice(0, 8)}`,
    email: cleanEmail,
    fullName: String(fullName).trim(),
    role: role === 'superadmin' ? 'superadmin' : 'admin',
  };
  adminUsers.push(newUser);
  res.status(201).json({ success: true, data: newUser, message: 'Account created successfully.' });
});

router.post('/login', loginRateLimiter, loginAdmin);
router.get('/me', authenticateAdmin, getCurrentAdmin);
router.put('/profile', authenticateAdmin, updateAdminProfile);

export default router;
