import { NextResponse } from 'next/server';
import { DEMO_COMPONENTS } from '@/lib/demoData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const memory = process.memoryUsage?.() ?? { rss: 0 };
  return NextResponse.json({
    service: 'flubiostack-web',
    status: 'ok',
    version: '2026.09.20',
    dataMode: process.env.DATABASE_URL ? 'database-configured' : 'curated-fixture',
    timestamp: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime?.() ?? 0),
    node: process.version,
    components: {
      total: DEMO_COMPONENTS.length,
      protected: DEMO_COMPONENTS.filter((c) => c.ipStatus === 'protected').length,
      free: DEMO_COMPONENTS.filter((c) => c.ipStatus === 'free').length
    },
    memoryRssKb: Math.round(memory.rss / 1024)
  });
}
