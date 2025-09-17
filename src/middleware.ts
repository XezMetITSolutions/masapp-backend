import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin sayfalarını koru - Basit kontrol
  if (pathname.startsWith('/admin')) {
    // Admin sayfalarına direkt erişim sağla (demo için)
    return NextResponse.next();
  }
  
  // Business sayfalarını koru
  if (pathname.startsWith('/business')) {
    // Login sayfası hariç
    if (pathname === '/business/login') {
      return NextResponse.next();
    }
    
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.redirect(new URL('/business/login', request.url));
    }
    
    // Demo token kontrolü
    if (accessToken.startsWith('demo-token-') || accessToken === 'demo-access-token') {
      return NextResponse.next();
    }
    
    // Diğer token'lar için basit kontrol
    if (accessToken.length > 10) {
      return NextResponse.next();
    }
    
    // Geçersiz token
    return NextResponse.redirect(new URL('/business/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/business/:path*',
  ],
};