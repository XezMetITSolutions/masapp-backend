import { NextRequest, NextResponse } from 'next/server';

// Demo admin kullanıcıları
const DEMO_ADMINS = [
  {
    id: 'admin-1',
    email: 'admin@masapp.com',
    password: 'admin123', // Demo için basit şifre
    name: 'Süper Admin',
    role: 'super_admin',
    status: 'active',
  },
  {
    id: 'admin-2',
    email: 'support@masapp.com',
    password: 'admin123',
    name: 'Destek Admin',
    role: 'super_admin',
    status: 'active',
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt for:', email);

    // Input validasyonu
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const admin = DEMO_ADMINS.find(a => a.email === email);
    if (!admin) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Şifre doğrulama (demo için basit)
    if (password !== admin.password) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Demo JWT token (gerçek uygulamada jwt.sign kullanılacak)
    const accessToken = `demo-token-${admin.id}-${Date.now()}`;
    const refreshToken = `demo-refresh-${admin.id}-${Date.now()}`;

    // Response oluştur
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        status: admin.status,
      },
      accessToken,
      refreshToken,
      expiresIn: '24h'
    });

    // Cookie'lerde token'ları sakla
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 gün
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 gün
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}