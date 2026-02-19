import { requireAuth } from '../src/middleware/auth';

jest.mock('../src/config/firebase', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(async (t: string) => ({ uid: 'abc', email: 'a@b.com', role: t === 'ok' ? 'admin' : 'user' }))
  }
}));

describe('auth middleware', () => {
  it('rejects missing token', async () => {
    const req: any = { headers: {} };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepts valid token', async () => {
    const req: any = { headers: { authorization: 'Bearer ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });
});
