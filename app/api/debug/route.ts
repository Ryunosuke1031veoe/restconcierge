// app/api/debug/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'success',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
        googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
        // 一部の値を表示（セキュリティのため一部のみ）
        googleClientIdStart: process.env.GOOGLE_CLIENT_ID?.substring(0, 20),
        nextauthUrlValue: process.env.NEXTAUTH_URL,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}