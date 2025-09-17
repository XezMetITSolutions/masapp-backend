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
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo: Kullanıcı onayları listesi
    const userApprovals = [
      {
        id: 'app-1',
        userId: 'user-1',
        restaurantId: 'rest-1',
        restaurantName: 'Pizza Palace',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet.yilmaz@email.com',
        role: 'manager',
        position: 'Restoran Müdürü',
        status: 'pending',
        appliedAt: '2024-03-15T10:30:00Z',
        experience: '5 yıl restoran yönetimi deneyimi',
        expectedSalary: 15000
      },
      {
        id: 'app-2',
        userId: 'user-2',
        restaurantId: 'rest-2',
        restaurantName: 'Burger King',
        firstName: 'Mehmet',
        lastName: 'Demir',
        email: 'mehmet.demir@email.com',
        role: 'staff',
        position: 'Garson',
        status: 'approved',
        appliedAt: '2024-03-14T09:15:00Z',
        experience: '2 yıl hizmet sektörü deneyimi',
        expectedSalary: 8500
      }
    ];

    // Filtreleme
    let filteredApprovals = userApprovals;
    if (status && status !== 'all') {
      filteredApprovals = filteredApprovals.filter(a => a.status === status);
    }
    if (role && role !== 'all') {
      filteredApprovals = filteredApprovals.filter(a => a.role === role);
    }

    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApprovals = filteredApprovals.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedApprovals,
      pagination: {
        page,
        limit,
        total: filteredApprovals.length,
        totalPages: Math.ceil(filteredApprovals.length / limit)
      }
    });

  } catch (error) {
    console.error('User approvals list error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}