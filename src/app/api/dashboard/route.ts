import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate some data fetching
    const data = {
      users: 1234,
      activeSessions: 456,
      revenue: 12345,
      status: 'online',
      lastSync: new Date().toISOString(),
    };

    return NextResponse.json({
      data,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process the data here
    console.log('Dashboard update:', body);

    return NextResponse.json({
      data: { success: true, updated: new Date().toISOString() },
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Invalid request',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}
