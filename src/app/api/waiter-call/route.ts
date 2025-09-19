import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, requestType, message } = body;

    // Validate required fields
    if (!tableId || !requestType) {
      return NextResponse.json(
        { error: 'Table ID and request type are required' },
        { status: 400 }
      );
    }

    // Log waiter call request
    console.log('Waiter call request:', {
      tableId,
      requestType,
      message,
      timestamp: new Date().toISOString()
    });

    // In a real application, you would:
    // 1. Save to database
    // 2. Send notification to kitchen/staff
    // 3. Update table status

    return NextResponse.json({
      success: true,
      message: 'Waiter call request received',
      data: {
        tableId,
        requestType,
        message,
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Waiter call error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Waiter call API endpoint',
    endpoints: {
      POST: 'Submit waiter call request'
    }
  });
}

