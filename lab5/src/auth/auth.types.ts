export type RequestUser = {
  userId?: string;
  firebaseUid: string;
  role: 'USER' | 'ADMIN';
  email?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
