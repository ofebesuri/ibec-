#!/usr/bin/env bash
# ============================================================
# FluBioStack Web Launcher v2026.09.20
#
# 支持开发模式、生产模式、健康检查、自动打开浏览器
# 新增：--port-auto / --flush-cache / --stage-once / --print-check
# --print-check 模式检查 6 个 API 端点（health/components/components/[id]/analysis/benchmark/page）
# ============================================================

set -euo pipefail

PORT="${PORT:-3000}"
MODE="start"
SKIP_BROWSER=0
FORCE_REBUILD=0
DEV_MODE=0
FLUSH_CACHE=0
STAGE_ONCE=0
PRINT_CHECK=0
PORT_AUTO=0

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case "$1" in
        --port)
            PORT="$2"
            shift 2
            ;;
        --port-auto)
            PORT_AUTO=1
            shift
            ;;
        --dev)
            MODE="dev"
            DEV_MODE=1
            shift
            ;;
        --build)
            MODE="build"
            FORCE_REBUILD=1
            shift
            ;;
        --no-browser)
            SKIP_BROWSER=1
            shift
            ;;
        --flush-cache)
            FLUSH_CACHE=1
            shift
            ;;
        --stage-once)
            STAGE_ONCE=1
            shift
            ;;
        --print-check)
            PRINT_CHECK=1
            SKIP_BROWSER=1
            shift
            ;;
        --help)
            echo "Usage: ./start.sh [options]"
            echo "  --port [3000]       Specify port"
            echo "  --port-auto         Auto-pick free port (3000-3099)"
            echo "  --dev               Development mode (hot reload)"
            echo "  --build             Rebuild before starting"
            echo "  --no-browser        Don't auto-open browser"
            echo "  --flush-cache       Clear .next/cache"
            echo "  --stage-once        Skip stage loader (force ready)"
            echo "  --print-check       Only print 6 page HTTP status (CI)"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

# 切换到脚本所在目录
cd "$(dirname "$0")"

echo "=============================================================="
echo "   FluBioStack - 合成生物学科研控制台"
echo "   v2026.09.20 - 全模块产品化 + 真实后端 + 启动器升级"
echo "=============================================================="
echo "   Port: $PORT   Mode: $MODE   Auto-open browser: $((1-SKIP_BROWSER))"
echo "   Flags: flush=$FLUSH_CACHE stage-once=$STAGE_ONCE print-check=$PRINT_CHECK"
echo "=============================================================="
echo

# ---- 1. 检测 Node.js ----
echo "[1/7] Checking Node.js ..."
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js not found. Please install Node.js v18+"
    echo "         https://nodejs.org/"
    exit 1
fi

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo "      ✓ Node $NODE_VER / npm $NPM_VER"

# ---- 2. 检测依赖 ----
echo "[2/7] Checking dependencies ..."
if [ ! -d "node_modules" ]; then
    echo "      node_modules not found. Installing..."
    npm install --no-audit --no-fund --loglevel=error
fi
echo "      ✓ Dependencies ready"

# ---- 3. 可选：清空缓存 ----
if [ "$FLUSH_CACHE" -eq 1 ]; then
    echo "[3/7] Clearing .next/cache ..."
    if [ -d ".next" ]; then rm -rf ".next"; fi
    echo "      ✓ Cache cleared"
else
    echo "[3/7] Skipping cache clear"
fi

# ---- 4. 检查并构建 ----
echo "[4/7] Checking build artifacts ..."
if [ "$DEV_MODE" -eq 1 ]; then
    echo "      Skipping build (dev mode)"
else
    if [ ! -d ".next" ] || [ "$FORCE_REBUILD" -eq 1 ]; then
        echo "      Building production bundle..."
        npm run build --silent
    fi
    echo "      ✓ Build ready"
fi

# ---- 5. 端口自动选择 ----
if [ "$PORT_AUTO" -eq 1 ]; then
    echo "[5/7] Auto-picking free port (3000-3099) ..."
    PORT=3000
    while [ "$PORT" -lt 3100 ]; do
        if ! (echo > /dev/tcp/127.0.0.1/$PORT) >/dev/null 2>&1; then
            echo "      ✓ Selected port: $PORT"
            break
        fi
        PORT=$((PORT + 1))
    done
    if [ "$PORT" -ge 3100 ]; then
        echo "[ERROR] No free port found in 3000-3099"
        exit 1
    fi
else
    echo "[5/7] Using fixed port: $PORT"
fi

# ---- 6. 启动服务器 ----
echo "[6/7] Starting server ..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/.flubiostack.log"

if [ "$DEV_MODE" -eq 1 ]; then
    nohup npm run dev -- -p "$PORT" > "$LOG_FILE" 2>&1 &
else
    nohup npm run start -- -p "$PORT" > "$LOG_FILE" 2>&1 &
fi
SERVER_PID=$!
echo "      Server PID: $SERVER_PID"

# ---- 7. 健康检查 ----
echo "[7/7] Waiting for server to be ready ..."
HEALTH_URL="http://localhost:$PORT/api/health"
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$HEALTH_URL" | grep -q "200"; then
        echo "      ✓ Server ready! (attempt $ATTEMPTS / $MAX_ATTEMPTS)"
        break
    fi
    sleep 1
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo "[ERROR] Server did not start within $MAX_ATTEMPTS seconds"
    echo "===== Server log ====="
    cat "$LOG_FILE"
    exit 1
fi

# ---- 打印 6 路由状态（页面 + API 端点）----
echo
echo "   路由健康检查（6 端点）:"
for p in /api/health /api/components /api/components/FLU-scFv-001 /api/analysis /api/benchmark /; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:$PORT$p" || echo "fail")
    printf "     %-40s HTTP %s\n" "$p" "$code"
done

echo
if [ "$PRINT_CHECK" -eq 1 ]; then
    echo "=============================================================="
    echo "   [print-check 模式] 仅打印状态，已跳过打开浏览器。"
    echo "   服务器继续运行。运行 ./stop.sh 关闭。"
    echo "=============================================================="
    exit 0
fi

if [ $SKIP_BROWSER -eq 0 ]; then
    echo "[完成] Opening browser ..."
    URL="http://localhost:$PORT/"
    if command -v open >/dev/null 2>&1; then
        open "$URL"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL"
    elif command -v start >/dev/null 2>&1; then
        start "$URL"
    else
        echo "      (no browser opener found, please open $URL manually)"
    fi
else
    echo "[完成] Skipping browser"
fi

echo
echo "=============================================================="
echo "   ✓ Server is up!"
echo "   URL:      http://localhost:$PORT/"
echo "   Health:   $HEALTH_URL"
echo "   Log:      $LOG_FILE"
echo
echo "   Keyboard shortcuts (in browser):"
echo "     Ctrl/Cmd+K    Command palette"
echo "     Ctrl/Cmd+.    Copilot"
echo "     Esc           Close drawer"
echo
echo "   To stop: kill $SERVER_PID   or   ./stop.sh"
echo "=============================================================="
