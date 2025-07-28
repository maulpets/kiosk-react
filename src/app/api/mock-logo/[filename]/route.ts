import { NextRequest, NextResponse } from 'next/server';

// Simple SVG logos for different companies
const mockLogos: Record<string, string> = {
  'acme-corp.png': `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="#1f2937"/>
    <text x="60" y="75" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">ACME</text>
  </svg>`,
  
  'techstart-inc.png': `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="#7c3aed"/>
    <circle cx="60" cy="60" r="30" fill="none" stroke="white" stroke-width="4"/>
    <polygon points="60,40 70,70 50,70" fill="white"/>
  </svg>`,
  
  'global-manufacturing.png': `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="#dc2626"/>
    <rect x="30" y="40" width="60" height="40" fill="white"/>
    <rect x="40" y="50" width="40" height="20" fill="#dc2626"/>
    <text x="60" y="100" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">GM</text>
  </svg>`,
  
  'retail-solutions.png': `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="#059669"/>
    <circle cx="60" cy="60" r="40" fill="white"/>
    <text x="60" y="70" text-anchor="middle" fill="#059669" font-family="Arial, sans-serif" font-size="18" font-weight="bold">RS</text>
  </svg>`,
  
  'default.png': `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="#6b7280"/>
    <rect x="30" y="30" width="60" height="60" fill="white" rx="10"/>
    <text x="60" y="70" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="16" font-weight="bold">LOGO</text>
  </svg>`
};

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = await params;
  
  if (!filename || !mockLogos[filename]) {
    // Return default logo
    const defaultSvg = mockLogos['default.png'];
    return new NextResponse(defaultSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  const svg = mockLogos[filename];
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
