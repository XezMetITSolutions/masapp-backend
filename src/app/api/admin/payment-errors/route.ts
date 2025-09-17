import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo ödeme hataları
    const paymentErrors = [
      {
        id: '1',
        restaurantId: 'rest-1',
        restaurantName: 'Pizza Palace',
        errorType: 'insufficient_funds',
        errorMessage: 'Yetersiz bakiye',
        amount: 150.50,
        timestamp: new Date().toISOString(),
        status: 'pending',
        resolvedAt: null
      },
      {
        id: '2',
        restaurantId: 'rest-2',
        restaurantName: 'Burger King',
        errorType: 'card_declined',
        errorMessage: 'Kart reddedildi',
        amount: 89.75,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'resolved',
        resolvedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: '3',
        restaurantId: 'rest-3',
        restaurantName: 'Sushi Master',
        errorType: 'network_error',
        errorMessage: 'Ağ bağlantı hatası',
        amount: 234.25,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'pending',
        resolvedAt: null
      }
    ];

    // Filtreleme
    let filteredErrors = paymentErrors;
    if (status !== 'all') {
      filteredErrors = paymentErrors.filter(error => error.status === status);
    }

    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedErrors = filteredErrors.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      errors: paginatedErrors,
      pagination: {
        page,
        limit,
        total: filteredErrors.length,
        totalPages: Math.ceil(filteredErrors.length / limit)
      }
    });

  } catch (error) {
    console.error('Payment errors error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}