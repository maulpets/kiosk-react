import { NextRequest, NextResponse } from 'next/server';
import { KioskStartupResponse } from '@/types';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Extract employee ID from query params or headers
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || searchParams.get('employee_id');
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Load mock data from JSON file
    const filePath = join(process.cwd(), 'public', 'kiosk-startup-mock-data.json');
    const fileContents = await readFile(filePath, 'utf8');
    const mockData: KioskStartupResponse = JSON.parse(fileContents);

    // Update the employee ID in the mock data
    mockData.basics.idnum = employeeId;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(mockData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error in kiosk-startup API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
