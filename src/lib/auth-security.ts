import crypto from 'crypto';

// JWT güvenlik ayarları
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Basit token oluşturma (jsonwebtoken olmadan)
export function createSecureToken(payload: any): { accessToken: string; refreshToken: string } {
  const timestamp = Date.now();
  const randomId = crypto.randomUUID();
  
  // Basit demo token'lar
  const accessToken = `demo-access-${payload.userId}-${timestamp}-${randomId}`;
  const refreshToken = `demo-refresh-${payload.userId}-${timestamp}-${randomId}`;

  return { accessToken, refreshToken };
}

// Basit token doğrulama
export function verifyToken(token: string): any {
  try {
    // Demo için basit token kontrolü
    if (token.startsWith('demo-access-') || token.startsWith('demo-token-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        return {
          userId: parts[2],
          iat: Date.now(),
          exp: Date.now() + (24 * 60 * 60 * 1000), // 24 saat
          role: 'super_admin'
        };
      }
    }
    throw new Error('Invalid token format');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Token yenileme
export function refreshToken(refreshToken: string): { accessToken: string; refreshToken: string } {
  try {
    if (refreshToken.startsWith('demo-refresh-')) {
      const parts = refreshToken.split('-');
      if (parts.length >= 3) {
        return createSecureToken({ userId: parts[2] });
      }
    }
    throw new Error('Invalid refresh token');
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

// Token blacklist (logout için)
const tokenBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

// Güvenli şifre hash'leme
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Şifre doğrulama
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === hashToVerify;
}

// Rate limiting için IP tracking
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

// Güvenli random string oluşturma
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// CSRF token oluşturma
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF token doğrulama
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
}