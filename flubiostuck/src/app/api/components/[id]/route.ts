import { NextRequest, NextResponse } from 'next/server';
import { DEMO_COMPONENTS } from '@/lib/demoData';

export const dynamic = 'force-dynamic';

/**
 * 返回单个元件；找不到时返回 404。
 * 解决 /database/[id] 详情页直接读取 fixture 造成的隐患。
 */
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const id = decodeURIComponent(context.params.id);
  const component = DEMO_COMPONENTS.find((c) => c.id === id);
  if (!component) {
    return NextResponse.json(
      { error: 'Component not found', id },
      { status: 404 }
    );
  }
  return NextResponse.json({
    component,
    source: 'curated-fixture-v1'
  });
}
