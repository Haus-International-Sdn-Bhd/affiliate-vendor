import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'vf-vendor-dashboard',
    timestamp: new Date().toISOString(),
  });
}
