import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { restaurantId, action, reason, notes } = await request.json();

    if (!restaurantId || !action) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json({ error: 'Red nedeni belirtilmelidir' }, { status: 400 });
    }

    // Demo: Restoran onay/red işlemi
    const result = {
      success: true,
      restaurantId,
      action,
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: 'admin@masapp.com',
      reviewedAt: new Date().toISOString(),
      reason: action === 'reject' ? reason : null,
      notes: notes || null
    };

    console.log('Restaurant approval:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Restaurant approval error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}