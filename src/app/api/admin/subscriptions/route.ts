import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo: Abonelik listesi
    const subscriptions = [
      {
        id: 'sub-1',
        restaurantId: 'rest-1',
        restaurantName: 'Pizza Palace',
        owner: 'Ahmet Yılmaz',
        email: 'ahmet@pizzapalace.com',
        plan: 'premium',
        status: 'active',
        amount: 4980,
        nextBillingDate: '2024-04-15',
        totalRevenue: 14940
      },
      {
        id: 'sub-2',
        restaurantId: 'rest-2',
        restaurantName: 'Burger King',
        owner: 'Mehmet Demir',
        email: 'mehmet@burgerking.com',
        plan: 'pro',
        status: 'active',
        amount: 2980,
        nextBillingDate: '2024-04-20',
        totalRevenue: 8940
      }
    ];

    // Filtreleme
    let filteredSubscriptions = subscriptions;
    if (status && status !== 'all') {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.status === status);
    }
    if (plan && plan !== 'all') {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.plan === plan);
    }

    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedSubscriptions,
      pagination: {
        page,
        limit,
        total: filteredSubscriptions.length,
        totalPages: Math.ceil(filteredSubscriptions.length / limit)
      }
    });

  } catch (error) {
    console.error('Subscriptions list error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}