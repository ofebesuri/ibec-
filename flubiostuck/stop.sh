#!/usr/bin/env bash
# ============================================================
# FluBioStack Stop - 关闭服务器
# ============================================================

set -euo pipefail

cd "$(dirname "$0")"

echo "=============================================================="
echo "   FluBioStack - Stopping server"
echo "=============================================================="
echo

echo "Looking for Next.js processes ..."
PIDS=$(pgrep -f "next start" || true)
PIDS="$PIDS $(pgrep -f "next dev" || true)"

if [ -z "$(echo $PIDS | tr -d ' ')" ]; then
    echo "No Next.js process found."
else
    for PID in $PIDS; do
        echo "Stopping PID $PID ..."
        kill -TERM "$PID" 2>/dev/null || true
    done
    sleep 1
    # Force kill any remaining
    for PID in $PIDS; do
        if kill -0 "$PID" 2>/dev/null; then
            echo "Force-killing PID $PID ..."
            kill -9 "$PID" 2>/dev/null || true
        fi
    done
    echo "✓ Server stopped"
fi

# 清理日志
if [ -f ".flubiostack.log" ]; then
    rm -f ".flubiostack.log"
    echo "✓ Log file removed"
fi

echo
echo "=============================================================="
