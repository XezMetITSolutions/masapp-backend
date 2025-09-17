import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Cookie'den access token'ı al
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Demo kullanıcı bilgilerini döndür
    const user = {
      id: 'admin-1',
      email: 'admin@masapp.com',
      name: 'Süper Admin',
      role: 'super_admin',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
    };

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}