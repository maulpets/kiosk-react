import { NextRequest, NextResponse } from 'next/server';
import { TimeCardApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payPeriod = searchParams.get('payPeriod') || 'current';
    
    // Return basic response structure
    // The frontend will fetch the actual mock data from /timecard-mock-data.json
    // and process it client-side
    
    const isCurrentPeriod = payPeriod === 'current';
    const periodBegins = isCurrentPeriod ? "2019-08-11T00:00:00.000" : "2019-07-28T00:00:00.000";
    const periodEnds = isCurrentPeriod ? "2019-08-24T23:59:59.999" : "2019-08-10T23:59:59.999";
    
    const periodStart = new Date(periodBegins);
    const periodEnd = new Date(periodEnds);
    
    const response: TimeCardApiResponse = {
      success: true,
      data: {
        weekStart: periodStart.toISOString().split('T')[0],
        weekEnd: periodEnd.toISOString().split('T')[0],
        entries: [], // Will be populated by frontend
        totalHours: 0, // Will be calculated by frontend
        overtimeHours: 0,
        regularHours: 0,
        employeeId: "496",
        employeeName: "Harry Howard",
        payPeriod: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
        payClass: "Full Time Hourly",
        department: "Glenwood Gardens",
        position: "CNA"
      },
      message: `Time card data structure for ${payPeriod} pay period`
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in time-card API:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch time card data',
        data: null
      },
      { status: 500 }
    );
  }
}

// POST method for updating time entries (future functionality)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This would handle time entry updates in a real application
    console.log('Time card update request:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Time entry updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating time card:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update time entry'
      },
      { status: 500 }
    );
  }
}
