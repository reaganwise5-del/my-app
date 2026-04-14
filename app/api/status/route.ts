import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apifyConnected: !!(process.env.APIFY_API_KEY?.trim()),
    marketCheckConnected: !!(process.env.MARKETCHECK_API_KEY?.trim()),
  });
}
