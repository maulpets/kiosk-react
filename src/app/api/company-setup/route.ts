import { NextRequest, NextResponse } from 'next/server';
import { CompanySetupResponse } from '@/types';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(request: NextRequest) {
  try {
    // Extract company name from query parameters
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('companyName') || searchParams.get('company_name');
    
    if (!companyName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company name is required'
        },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Load company mappings
    const mappingsPath = join(process.cwd(), 'public', 'mock-data', 'company-mappings.json');
    const mappingsContent = await readFile(mappingsPath, 'utf8');
    const mappings = JSON.parse(mappingsContent);

    // Normalize company name for lookup
    const normalizedName = companyName.toLowerCase().trim();
    
    // Get the filename for this company, or use default
    const fileName = mappings.companyMappings[normalizedName] || mappings.defaultFile;
    
    // Load the specific company configuration
    const companyFilePath = join(process.cwd(), 'public', 'mock-data', 'companies', fileName);
    const companyContent = await readFile(companyFilePath, 'utf8');
    const companyConfig = JSON.parse(companyContent);

    // If using default config, update the name to match the input
    if (fileName === mappings.defaultFile) {
      companyConfig.name = companyName.trim();
    }

    const response: CompanySetupResponse = {
      success: true,
      company: companyConfig,
      message: `Successfully configured for ${companyConfig.name}`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Company setup API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Keep POST for backward compatibility
export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company name is required'
        },
        { status: 400 }
      );
    }

    // Redirect to GET method by creating a new URL with query params
    const url = new URL(request.url);
    url.searchParams.set('companyName', companyName);
    
    // Create a new request to the GET handler
    const getRequest = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers
    });
    
    return GET(getRequest as NextRequest);
  } catch (error) {
    console.error('Company setup API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
