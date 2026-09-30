import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const dynamic = 'force-dynamic';

/**
 * /api/download
 *   ?file=algorithms.tar.gz  → 真实打包 flubiostack/algorithms 目录
 *   ?file=algorithms.whl     → 真实构建 Python wheel（如果 build 可用）
 *   ?file=docker-compose.yml → 返回仓库根 compose 文件
 *   ?file=README.md          → 返回算法包 README
 *
 * 缺什么自动触发对应打包脚本，避免用户手动跑命令。
 * 全部带 Content-Disposition: attachment 触发浏览器下载。
 */

// 路径解析：
//   - 在 `next dev` / `next start` 下 process.cwd() = e:\pttz\flubiostack\web
//   - 但 next standalone build 可能把 cwd 设为 .next/standalone/...
//   - 所以优先用环境变量 FLUBIOSTACK_ROOT，否则按相对路径向上找
function resolveRepoRoot(): string {
  if (process.env.FLUBIOSTACK_ROOT && fs.existsSync(path.join(process.env.FLUBIOSTACK_ROOT, 'algorithms'))) {
    return process.env.FLUBIOSTACK_ROOT;
  }
  // 方案 1: process.cwd()/..
  const candidate1 = path.resolve(process.cwd(), '..');
  if (fs.existsSync(path.join(candidate1, 'algorithms'))) return candidate1;
  // 方案 2: 向上 2 层（兼容 standalone build）
  const candidate2 = path.resolve(process.cwd(), '..', '..');
  if (fs.existsSync(path.join(candidate2, 'algorithms'))) return candidate2;
  return candidate1; // fallback
}

const REPO_ROOT = resolveRepoRoot();
const ALGO_DIR = path.join(REPO_ROOT, 'algorithms');
const DIST_DIR = path.join(REPO_ROOT, 'dist');

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function run(cmd: string, args: string[], cwd: string): { ok: boolean; out: string } {
  try {
    const r = spawnSync(cmd, args, { cwd, encoding: 'utf-8', stdio: 'pipe' });
    return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
  } catch (e) {
    return { ok: false, out: String(e) };
  }
}

function sendFile(filePath: string, downloadName: string) {
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'File not generated', path: filePath, repoRoot: REPO_ROOT, algoDir: ALGO_DIR },
      { status: 500 }
    );
  }
  const buf = fs.readFileSync(filePath);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
      'Content-Length': String(buf.length),
      'Cache-Control': 'no-store'
    }
  });
}

function buildTarball(): { ok: boolean; path?: string; err?: string } {
  ensureDir(DIST_DIR);
  const out = path.join(DIST_DIR, 'flubiostack-algorithms.tar.gz');
  // 优先用系统 tar（Windows 10+ 自带 bsdtar）
  let r = run('tar', ['-czf', out, '-C', ALGO_DIR, '.'], REPO_ROOT);
  if (!r.ok) {
    // fallback：PowerShell Compress-Archive（仅 zip）
    const zipOut = path.join(DIST_DIR, 'flubiostack-algorithms.zip');
    const ps = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Compress-Archive -Path "${ALGO_DIR}\\*" -DestinationPath "${zipOut}" -Force`
      ],
      { encoding: 'utf-8' }
    );
    if (ps.status === 0 && fs.existsSync(zipOut)) {
      return { ok: true, path: zipOut };
    }
    return { ok: false, err: 'tar / Compress-Archive 失败：' + r.out };
  }
  return { ok: true, path: out };
}

function buildWheel(): { ok: boolean; path?: string; err?: string } {
  ensureDir(DIST_DIR);
  // 先尝试 python -m build（要求用户装了 build + setuptools）
  let r = run('python', ['-m', 'build', '--wheel', '--outdir', DIST_DIR], ALGO_DIR);
  if (r.ok) {
    const files = fs.readdirSync(DIST_DIR).filter((f) => f.endsWith('.whl'));
    if (files.length > 0) return { ok: true, path: path.join(DIST_DIR, files[0]) };
  }
  // fallback：手动写占位说明文件
  const placeholder = path.join(DIST_DIR, 'flubiostack-wheel-placeholder.txt');
  fs.writeFileSync(
    placeholder,
    [
      '# FluBioStack 算法包 wheel 占位文件',
      '# 当前环境未检测到 `python -m build`，无法生成真实 .whl',
      '# 安装后即可生成：',
      '#   pip install build',
      '#   cd algorithms && python -m build --wheel',
      '',
      '# 算法源码位于仓库 algorithms/ 目录，可直接：',
      '#   pip install -e algorithms/',
      ''
    ].join('\n'),
    'utf-8'
  );
  return { ok: true, path: placeholder };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const file = url.searchParams.get('file') || '';

  switch (file) {
    case 'algorithms.tar.gz': {
      const r = buildTarball();
      if (!r.ok) return NextResponse.json({ error: r.err }, { status: 500 });
      const name = path.basename(r.path!);
      return sendFile(r.path!, name);
    }
    case 'algorithms.whl': {
      const r = buildWheel();
      if (!r.ok) return NextResponse.json({ error: r.err }, { status: 500 });
      const name = path.basename(r.path!);
      return sendFile(r.path!, name);
    }
    case 'docker-compose.yml': {
      const composePath = path.join(REPO_ROOT, 'docker-compose.yml');
      return sendFile(composePath, 'docker-compose.yml');
    }
    case 'README.md': {
      const readme = path.join(ALGO_DIR, 'README.md');
      return sendFile(readme, 'flubiostack-algorithms-README.md');
    }
    default:
      return NextResponse.json(
        {
          error: 'Unknown file parameter',
          validFiles: ['algorithms.tar.gz', 'algorithms.whl', 'docker-compose.yml', 'README.md'],
          example: '/api/download?file=algorithms.tar.gz'
        },
        { status: 400 }
      );
  }
}
