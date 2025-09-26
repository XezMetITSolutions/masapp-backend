import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth-security';

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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo: Restoran verileri
    const allRestaurants = [
      {
        id: 'rest-1',
        name: 'Pizza Palace',
        category: 'İtalyan',
        address: 'Kadıköy, İstanbul',
        phone: '+90 555 123 4567',
        email: 'info@pizzapalace.com',
        status: 'active',
        rating: 4.5,
        totalOrders: 1250,
        monthlyRevenue: 45000,
        owner: 'Ahmet Yılmaz',
        ownerEmail: 'ahmet@example.com',
        createdAt: '2024-01-15T08:00:00Z',
        lastActivity: '2024-03-15T10:30:00Z',
        subscription: {
          plan: 'premium',
          expiresAt: '2024-06-15T08:00:00Z',
          status: 'active'
        }
      },
      {
        id: 'rest-2',
        name: 'Burger King',
        category: 'Fast Food',
        address: 'Beşiktaş, İstanbul',
        phone: '+90 555 234 5678',
        email: 'info@burgerking.com',
        status: 'active',
        rating: 4.2,
        totalOrders: 2100,
        monthlyRevenue: 78000,
        owner: 'Ayşe Demir',
        ownerEmail: 'ayse@example.com',
        createdAt: '2024-01-20T10:30:00Z',
        lastActivity: '2024-03-15T09:15:00Z',
        subscription: {
          plan: 'enterprise',
          expiresAt: '2024-07-20T10:30:00Z',
          status: 'active'
        }
      },
      {
        id: 'rest-3',
        name: 'Sushi Master',
        category: 'Japon',
        address: 'Şişli, İstanbul',
        phone: '+90 555 345 6789',
        email: 'info@sushimaster.com',
        status: 'pending',
        rating: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        owner: 'Mehmet Kaya',
        ownerEmail: 'mehmet@example.com',
        createdAt: '2024-03-10T14:30:00Z',
        lastActivity: '2024-03-10T14:30:00Z',
        subscription: {
          plan: 'basic',
          expiresAt: '2024-04-10T14:30:00Z',
          status: 'pending'
        }
      },
      {
        id: 'rest-4',
        name: 'Coffee Corner',
        category: 'Kahve',
        address: 'Beyoğlu, İstanbul',
        phone: '+90 555 456 7890',
        email: 'info@coffeecorner.com',
        status: 'active',
        rating: 4.8,
        totalOrders: 890,
        monthlyRevenue: 32000,
        owner: 'Fatma Özkan',
        ownerEmail: 'fatma@example.com',
        createdAt: '2024-02-01T12:00:00Z',
        lastActivity: '2024-03-15T08:45:00Z',
        subscription: {
          plan: 'premium',
          expiresAt: '2024-08-01T12:00:00Z',
          status: 'active'
        }
      },
      {
        id: 'rest-5',
        name: 'Steak House',
        category: 'Et Restoranı',
        address: 'Etiler, İstanbul',
        phone: '+90 555 567 8901',
        email: 'info@steakhouse.com',
        status: 'suspended',
        rating: 3.9,
        totalOrders: 650,
        monthlyRevenue: 28000,
        owner: 'Ali Veli',
        ownerEmail: 'ali@example.com',
        createdAt: '2024-01-25T16:20:00Z',
        lastActivity: '2024-03-05T18:30:00Z',
        subscription: {
          plan: 'basic',
          expiresAt: '2024-04-25T16:20:00Z',
          status: 'expired'
        }
      },
      {
        id: 'rest-6',
        name: 'Deniz Restaurant',
        category: 'Deniz Ürünleri',
        address: 'Bostancı, İstanbul',
        phone: '+90 555 678 9012',
        email: 'info@denizrestaurant.com',
        status: 'active',
        rating: 4.6,
        totalOrders: 1456,
        monthlyRevenue: 56000,
        owner: 'Zeynep Aydın',
        ownerEmail: 'zeynep@example.com',
        createdAt: '2024-01-10T09:15:00Z',
        lastActivity: '2024-03-15T11:20:00Z',
        subscription: {
          plan: 'premium',
          expiresAt: '2024-07-10T09:15:00Z',
          status: 'active'
        }
      }
    ];

    // Filtreleme
    let filteredRestaurants = allRestaurants.filter(restaurant => {
      const matchesSearch = search === '' || 
        restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.category.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.owner.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = category === 'all' || restaurant.category === category;
      const matchesStatus = status === 'all' || restaurant.status === status;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sıralama
    filteredRestaurants.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'totalOrders':
          aValue = a.totalOrders;
          bValue = b.totalOrders;
          break;
        case 'monthlyRevenue':
          aValue = a.monthlyRevenue;
          bValue = b.monthlyRevenue;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Sayfalama
    const total = filteredRestaurants.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedRestaurants = filteredRestaurants.slice(offset, offset + limit);

    // İstatistikler
    const stats = {
      total: allRestaurants.length,
      active: allRestaurants.filter(r => r.status === 'active').length,
      pending: allRestaurants.filter(r => r.status === 'pending').length,
      suspended: allRestaurants.filter(r => r.status === 'suspended').length,
      totalOrders: allRestaurants.reduce((sum, r) => sum + r.totalOrders, 0),
      totalRevenue: allRestaurants.reduce((sum, r) => sum + r.monthlyRevenue, 0)
    };

    return NextResponse.json({
      success: true,
      data: paginatedRestaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats,
      filters: {
        search,
        category,
        status,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Admin restaurants list error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}











