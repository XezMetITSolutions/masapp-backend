import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    // Demo: Kullanıcı rolleri
    const roles = [
      {
        id: 'super-admin',
        name: 'Süper Admin',
        description: 'Tüm sistem yetkilerine sahip kullanıcı',
        permissions: ['all'],
        userCount: 2,
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true
      },
      {
        id: 'admin',
        name: 'Admin',
        description: 'Sınırlı admin yetkilerine sahip kullanıcı',
        permissions: ['users.read', 'restaurants.read', 'analytics.read'],
        userCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true
      },
      {
        id: 'moderator',
        name: 'Moderatör',
        description: 'İçerik moderasyon yetkilerine sahip kullanıcı',
        permissions: ['restaurants.approve', 'users.approve'],
        userCount: 8,
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: roles
    });

  } catch (error) {
    console.error('User roles error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Basit token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const { name, description, permissions } = await request.json();

    if (!name || !description || !permissions) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Demo: Rol oluşturma
    const newRole = {
      id: `role-${Date.now()}`,
      name,
      description,
      permissions,
      userCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    console.log('Role created:', newRole);

    return NextResponse.json({
      success: true,
      message: 'Rol başarıyla oluşturuldu',
      data: newRole
    });

  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}