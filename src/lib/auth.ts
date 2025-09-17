// Basit auth utilities

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  restaurantId?: string;
  iat: number;
  exp: number;
}

// Basit JWT Token oluşturma
export function generateTokens(user: any): AuthTokens {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  const accessToken = `demo-access-${user.id}-${timestamp}-${randomId}`;
  const refreshToken = `demo-refresh-${user.id}-${timestamp}-${randomId}`;

  return { accessToken, refreshToken };
}

// Basit JWT Token doğrulama
export function verifyToken(token: string): JWTPayload | null {
  try {
    // Demo için basit token kontrolü
    if (token.startsWith('demo-access-') || token.startsWith('demo-token-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        return {
          userId: parts[2],
          email: 'admin@masapp.com',
          role: 'super_admin',
          iat: Date.now(),
          exp: Date.now() + (24 * 60 * 60 * 1000), // 24 saat
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Basit şifre hashleme
export async function hashPassword(password: string): Promise<string> {
  // Demo için basit hash
  return `demo-hash-${password}-${Date.now()}`;
}

// Basit şifre doğrulama
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Demo için basit kontrol
  return hashedPassword.includes(password);
}

// Token'dan kullanıcı bilgilerini çıkarma
export function getUserFromToken(token: string): JWTPayload | null {
  return verifyToken(token);
}

// Rol kontrolü
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Admin rolü kontrolü
export function isAdmin(userRole: string): boolean {
  return userRole === 'super_admin';
}

// Restoran sahibi/admin kontrolü
export function isRestaurantUser(userRole: string): boolean {
  return ['restaurant_owner', 'restaurant_admin'].includes(userRole);
}

// Token süresi kontrolü
export function isTokenExpired(token: string): boolean {
  const payload = verifyToken(token);
  if (!payload) return true;
  
  const now = Date.now();
  return payload.exp < now;
}

// Güvenli şifre oluşturma
export function generateSecurePassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// 2FA kod oluşturma
export function generate2FACode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email doğrulama
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Güçlü şifre kontrolü
export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}