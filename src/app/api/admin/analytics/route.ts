import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const metric = searchParams.get('metric') || 'overview';

    // Demo analitik verileri
    const analyticsData = {
      overview: {
        totalRestaurants: 1247,
        activeRestaurants: 1189,
        totalUsers: 3421,
        totalRevenue: 2847390,
        monthlyRevenue: 189650,
        growthRate: 12.5
      },
      revenue: {
        daily: [
          { date: '2024-03-01', amount: 6234 },
          { date: '2024-03-02', amount: 7891 },
          { date: '2024-03-03', amount: 9123 },
          { date: '2024-03-04', amount: 8456 },
          { date: '2024-03-05', amount: 7234 }
        ],
        monthly: [
          { month: 'Ocak', amount: 156789 },
          { month: 'Şubat', amount: 178234 },
          { month: 'Mart', amount: 189650 }
        ]
      },
      restaurants: {
        byStatus: [
          { status: 'Aktif', count: 1189 },
          { status: 'Beklemede', count: 23 },
          { status: 'Askıya Alınmış', count: 12 },
          { status: 'İptal Edilmiş', count: 23 }
        ]
      },
      users: {
        byRole: [
          { role: 'Müdür', count: 456 },
          { role: 'Personel', count: 1234 },
          { role: 'Kasa', count: 567 },
          { role: 'Garson', count: 890 },
          { role: 'Mutfak', count: 274 }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData[metric as keyof typeof analyticsData] || analyticsData.overview,
      dateRange,
      metric
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}