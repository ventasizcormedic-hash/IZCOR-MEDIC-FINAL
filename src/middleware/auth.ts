import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getUserRole } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  userRole?: string;
}

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

// The bundled production server (dist/server.cjs) never accepts the dev token,
// even when NODE_ENV is not set (as with `npm start`).
const isBundledServer = /dist[\\/]server\.cjs$/.test(process.argv[1] || '');
const devTokenAllowed =
  process.env.NODE_ENV === 'development' ||
  (!process.env.NODE_ENV && !isBundledServer);

const DEV_ADMIN_UID = 'dev-admin-uid';

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Already verified by an earlier middleware (e.g. the /api/admin guard).
  if (req.user) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (devTokenAllowed && token === 'dev-admin-token') {
    req.user = { uid: DEV_ADMIN_UID, email: 'admin@b2bmed.com' } as any;
    return next();
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/** Loads the caller's role from the users table (dev token counts as SUPER_ADMIN). */
export const resolveUserRole = async (req: AuthRequest): Promise<string> => {
  if (req.userRole) return req.userRole;
  if (devTokenAllowed && req.user?.uid === DEV_ADMIN_UID) {
    req.userRole = 'SUPER_ADMIN';
  } else {
    req.userRole = req.user ? await getUserRole(req.user.uid) : 'USER';
  }
  return req.userRole;
};

/** Must run after requireAuth: only ADMIN / SUPER_ADMIN users get through. */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = await resolveUserRole(req);
    if (!ADMIN_ROLES.includes(role)) {
      return res.status(403).json({ error: 'Acceso restringido: se requiere rol de administrador.' });
    }
    next();
  } catch (error) {
    console.error('Error resolving user role:', error);
    return res.status(500).json({ error: 'No se pudo verificar el rol del usuario.' });
  }
};
