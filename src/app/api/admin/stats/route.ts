import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth-security';

export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Demo: Dashboard istatistikleri
    const stats = {
      totalRestaurants: 24,
      activeRestaurants: 21,
      pendingRestaurants: 2,
      suspendedRestaurants: 1,
      totalOrders: 1842,
      monthlyRevenue: 124000,
      totalUsers: 156,
      activeUsers: 142,
      revenueGrowth: 18,
      orderGrowth: 23,
      userGrowth: 12,
      restaurantGrowth: 12,
      systemHealth: {
        uptime: '99.9%',
        responseTime: '120ms',
        errorRate: '0.1%',
        activeConnections: 45
      },
      recentActivity: [
        {
          id: '1',
          type: 'restaurant_added',
          message: 'Yeni restoran eklendi: Lezzet Durağı',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'user_registered',
          message: 'Yeni kullanıcı kaydı: Ahmet Yılmaz',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          status: 'info'
        },
        {
          id: '3',
          type: 'subscription_renewed',
          message: 'Abonelik yenilendi: Deniz Restaurant',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'payment_failed',
          message: 'Ödeme hatası: Köfte Evi',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'error'
        }
      ],
      topRestaurants: [
        { id: 'rest-1', name: 'Pizza Palace', revenue: 45000, orders: 1250, growth: 15 },
        { id: 'rest-2', name: 'Burger King', revenue: 38000, orders: 987, growth: 8 },
        { id: 'rest-3', name: 'Coffee Corner', revenue: 32000, orders: 890, growth: 22 },
        { id: 'rest-4', name: 'Sushi Master', revenue: 28000, orders: 756, growth: -5 },
        { id: 'rest-5', name: 'Steak House', revenue: 25000, orders: 654, growth: 12 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}





