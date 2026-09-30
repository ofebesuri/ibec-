import { NextRequest, NextResponse } from 'next/server';
import { DEMO_COMPONENTS } from '@/lib/demoData';

export const dynamic = 'force-dynamic';

/**
 * 元件检索 API。
 * 支持：query（模糊）、subtype（精确）、ipStatus（精确）、riskLevel（精确）、limit。
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get('query') || '').trim().toLowerCase();
  const subtype = params.get('subtype') || undefined;
  const ipStatus = params.get('ipStatus') || undefined;
  const riskLevel = params.get('riskLevel') || undefined;
  const limit = Math.min(Math.max(Number(params.get('limit') || 50), 1), 500);
  const offset = Math.max(Number(params.get('offset') || 0), 0);
  const sortBy = params.get('sortBy') || 'updatedAt';
  const sortDir = params.get('sortDir') === 'asc' ? 1 : -1;

  const filtered = DEMO_COMPONENTS.filter((c) => {
    const haystack = [
      c.id,
      c.name,
      c.subtype,
      c.strain,
      c.ipNumber,
      c.description,
      c.tags.join(' '),
      c.owner
    ]
      .join(' ')
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesSubtype = !subtype || c.subtype === subtype;
    const matchesIp = !ipStatus || c.ipStatus === ipStatus;
    const matchesRisk = !riskLevel || c.riskLevel === riskLevel;
    return matchesQuery && matchesSubtype && matchesIp && matchesRisk;
  });

  // 排序
  const sorted = [...filtered].sort((a, b) => {
    let av: number | string = 0;
    let bv: number | string = 0;
    switch (sortBy) {
      case 'updatedAt':
        av = a.updatedAt;
        bv = b.updatedAt;
        break;
      case 'createdAt':
        av = a.createdAt;
        bv = b.createdAt;
        break;
      case 'length':
        av = a.sequence.length;
        bv = b.sequence.length;
        break;
      case 'pi':
        av = a.pi ?? 0;
        bv = b.pi ?? 0;
        break;
      case 'mw':
        av = a.molecularWeight ?? 0;
        bv = b.molecularWeight ?? 0;
        break;
      case 'risk':
        av = { high: 0, medium: 1, low: 2 }[a.riskLevel];
        bv = { high: 0, medium: 1, low: 2 }[b.riskLevel];
        break;
      default:
        av = a.updatedAt;
        bv = b.updatedAt;
    }
    if (av < bv) return -1 * sortDir;
    if (av > bv) return 1 * sortDir;
    return 0;
  });

  const total = sorted.length;
  const results = sorted.slice(offset, offset + limit);

  return NextResponse.json({
    results,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
    source: 'curated-fixture-v1'
  });
}
