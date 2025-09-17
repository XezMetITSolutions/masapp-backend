import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Demo: Sistem ayarları
    const settings = [
      {
        id: 'site-name',
        category: 'general',
        key: 'SITE_NAME',
        name: 'Site Adı',
        description: 'Web sitesinin genel adı',
        value: 'MasApp Admin Panel',
        type: 'text',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'maintenance-mode',
        category: 'general',
        key: 'MAINTENANCE_MODE',
        name: 'Bakım Modu',
        description: 'Sistem bakım modunda mı?',
        value: false,
        type: 'boolean',
        required: false,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'session-timeout',
        category: 'security',
        key: 'SESSION_TIMEOUT',
        name: 'Oturum Zaman Aşımı',
        description: 'Kullanıcı oturumunun süresi (dakika)',
        value: 30,
        type: 'number',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      }
    ];

    // Filtreleme
    let filteredSettings = settings;
    if (category && category !== 'all') {
      filteredSettings = filteredSettings.filter(s => s.category === category);
    }
    if (search) {
      filteredSettings = filteredSettings.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.key.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredSettings
    });

  } catch (error) {
    console.error('System settings error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { settingId, value } = await request.json();

    if (!settingId || value === undefined) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Demo: Ayar güncelleme
    console.log('Setting updated:', settingId, value);

    return NextResponse.json({
      success: true,
      message: 'Ayar başarıyla güncellendi',
      data: {
        settingId,
        value,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin@masapp.com'
      }
    });

  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}