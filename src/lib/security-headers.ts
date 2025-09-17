import { NextResponse } from 'next/server';

// Güvenlik başlıkları konfigürasyonu
const SECURITY_HEADERS = {
  // XSS koruması
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Strict Transport Security (HTTPS için)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Güvenlik başlıklarını response'a ekleme
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// CORS konfigürasyonu
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// CORS başlıklarını ekleme
export function addCORSHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Güvenli cookie ayarları
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7 // 7 gün
};

// Güvenli response oluşturma
export function createSecureResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Güvenlik başlıklarını ekle
  addSecurityHeaders(response);
  
  // CORS başlıklarını ekle
  addCORSHeaders(response);
  
  return response;
}

// Hata response'u oluşturma
export function createErrorResponse(
  error: string, 
  status: number = 500, 
  code?: string
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  );
  
  addSecurityHeaders(response);
  return response;
}

// Güvenli redirect
export function createSecureRedirect(url: string, status: number = 302): NextResponse {
  const response = NextResponse.redirect(url, { status });
  addSecurityHeaders(response);
  return response;
}

// Güvenlik middleware
export function withSecurity(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      const response = await handler(request, ...args);
      
      // Response'a güvenlik başlıklarını ekle
      if (response instanceof NextResponse) {
        addSecurityHeaders(response);
      }
      
      return response;
    } catch (error) {
      console.error('Security middleware error:', error);
      return createErrorResponse(
        'Internal server error',
        500,
        'INTERNAL_ERROR'
      );
    }
  };
}