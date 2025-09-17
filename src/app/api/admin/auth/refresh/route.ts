import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token bulunamadı' },
        { status: 401 }
      );
    }

    // Demo için basit token yenileme
    const newAccessToken = `demo-token-refreshed-${Date.now()}`;

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: '24h'
    });

    // Yeni access token'ı cookie'ye kaydet
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 gün
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}