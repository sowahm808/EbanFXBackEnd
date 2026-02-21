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

  it('accepts lowercase bearer scheme', async () => {
    const req: any = { headers: { authorization: 'bearer ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });



  it('accepts raw token in authorization header', async () => {
    const req: any = { headers: { authorization: 'ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts token from x-id-token header', async () => {
    const req: any = { headers: { 'x-id-token': 'ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts token from id-token header', async () => {
    const req: any = { headers: { 'id-token': 'ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts token from x-firebase-auth header', async () => {
    const req: any = { headers: { 'x-firebase-auth': 'ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts bearer token from x-access-token header', async () => {
    const req: any = { headers: { 'x-access-token': 'Bearer ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts token from cookie', async () => {
    const req: any = { headers: { cookie: '__session=ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts bearer-prefixed token from cookie', async () => {
    const req: any = { headers: { cookie: '__session=Bearer%20ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts quoted bearer token from x-access-token header', async () => {
    const req: any = { headers: { 'x-access-token': '"Bearer ok"' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts token from x-auth-token header', async () => {
    const req: any = { headers: { 'x-auth-token': 'ok' }, query: {} };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts token from query string', async () => {
    const req: any = { headers: {}, query: { token: 'ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });

  it('accepts idToken from query string', async () => {
    const req: any = { headers: {}, query: { idToken: 'Bearer ok' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.uid).toBe('abc');
  });
});
