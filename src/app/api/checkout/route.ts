import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, total, paymentMethod } = body;

    // Validate required fields
    if (!items || !total || !paymentMethod) {
      return NextResponse.json(
        { error: 'Items, total, and payment method are required' },
        { status: 400 }
      );
    }

    // Demo payment processing
    console.log('Payment processing:', {
      items,
      total,
      paymentMethod,
      timestamp: new Date().toISOString()
    });

    // Simulate payment success
    const paymentResult = {
      success: true,
      transactionId: `txn_${Date.now()}`,
      amount: total,
      currency: 'TRY',
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: paymentResult
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Checkout API endpoint',
    endpoints: {
      POST: 'Process payment'
    }
  });
}