import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { approvalIds, action, rejectionReason, notes, interviewNotes } = await request.json();

    if (!approvalIds || !Array.isArray(approvalIds) || approvalIds.length === 0) {
      return NextResponse.json({ error: 'Başvuru ID\'leri gereklidir' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'İşlem türü gereklidir' }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'addNotes', 'addInterviewNotes'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Geçersiz işlem türü' }, { status: 400 });
    }

    // Demo: Kullanıcı onay işlemi simülasyonu
    const result = {
      success: true,
      action,
      processedCount: approvalIds.length,
      approvalIds,
      processedBy: 'admin@masapp.com',
      processedAt: new Date().toISOString(),
      rejectionReason: rejectionReason || null,
      notes: notes || null,
      interviewNotes: interviewNotes || null
    };

    console.log('User approval action:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('User approval action error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}