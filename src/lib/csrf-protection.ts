import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// CSRF token oluşturma
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF token'ı cookie'de saklama
export function setCSRFToken(response: NextResponse): string {
  const token = generateCSRFToken();
  
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 saat
  });
  
  return token;
}

// CSRF token'ı request'ten alma
export function getCSRFToken(request: NextRequest): string | null {
  return request.cookies.get('csrf-token')?.value || null;
}

// CSRF token doğrulama
export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = getCSRFToken(request);
  const headerToken = request.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Basit token karşılaştırması
  return cookieToken === headerToken;
}

// CSRF middleware
export function csrfMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // GET, HEAD, OPTIONS istekleri için CSRF kontrolü yapma
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request, ...args);
    }
    
    // CSRF token doğrulama
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
    
    return handler(request, ...args);
  };
}

// CSRF token'ı response'a ekleme
export function addCSRFTokenToResponse(response: NextResponse, token: string): void {
  response.headers.set('x-csrf-token', token);
}

// API endpoint'ler için CSRF koruması
export function withCSRFProtection(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // CSRF token doğrulama
      if (!validateCSRFToken(request)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'CSRF token validation failed',
            code: 'CSRF_ERROR'
          },
          { status: 403 }
        );
      }
      
      return await handler(request, ...args);
    } catch (error) {
      console.error('CSRF protection error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  };
}