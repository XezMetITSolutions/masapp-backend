import { NextRequest, NextResponse } from 'next/server';

// Rate limiting konfigürasyonu
interface RateLimitConfig {
  windowMs: number; // Zaman penceresi (ms)
  maxRequests: number; // Maksimum istek sayısı
}

// Basit rate limit store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
export function createRateLimit(config: RateLimitConfig) {
  return (handler: Function) => {
    return async (request: NextRequest, ...args: any[]) => {
      const ip = getClientIP(request);
      const key = `rate_limit:${ip}`;
      
      const now = Date.now();
      const record = rateLimitStore.get(key);

      // Rate limit kontrolü
      if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
      } else if (record.count >= config.maxRequests) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(config.windowMs / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
            }
          }
        );
      } else {
        record.count++;
      }
      
      return handler(request, ...args);
    };
  };
}

// IP adresini güvenli şekilde alma
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return '127.0.0.1'; // Fallback
}

// Önceden tanımlanmış rate limit middleware'leri
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 100
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 5
});

export const searchRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  maxRequests: 30
});

export const adminRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  maxRequests: 200
});

// Rate limit bilgilerini response'a ekleme
export function addRateLimitHeaders(
  response: NextResponse, 
  config: RateLimitConfig,
  remaining: number
): void {
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
}