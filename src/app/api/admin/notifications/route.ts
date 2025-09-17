import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';

    // Demo bildirimler
    const notifications = [
      {
        id: '1',
        type: 'payment_error',
        title: 'Ödeme Hatası',
        message: 'Restaurant "Pizza Palace" ödeme işleminde hata yaşadı',
        timestamp: new Date().toISOString(),
        status: 'unread',
        restaurantId: 'rest-1',
        restaurantName: 'Pizza Palace'
      },
      {
        id: '2',
        type: 'new_restaurant',
        title: 'Yeni Restaurant',
        message: 'Yeni restaurant kaydı: "Burger King"',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'read',
        restaurantId: 'rest-2',
        restaurantName: 'Burger King'
      },
      {
        id: '3',
        type: 'system_alert',
        title: 'Sistem Uyarısı',
        message: 'Sunucu yükü yüksek seviyelerde',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'unread'
      }
    ];

    return NextResponse.json({
      success: true,
      notifications,
      total: notifications.length
    });

  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, restaurantId } = body;

    // Yeni bildirim oluştur
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      status: 'unread',
      restaurantId
    };

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}