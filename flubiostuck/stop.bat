@echo off
chcp 65001 >nul
setlocal
title FluBioStack - 停止脚本

:: ============================================================
:: FluBioStack Web 停止脚本 v2026.09.20
::
:: 查找占用 3000-3099 (或其它指定端口) 的 Next.js / Node 进程并终止
:: ============================================================

set "PORT=3000"

:parse_args
if "%~1"=="" goto :after_args
if /i "%~1"=="--port" (
    set "PORT=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--all" (
    set "PORT=0"
    shift
    goto :parse_args
)
shift
goto :parse_args

:after_args

echo ================================================================
echo    FluBioStack - 停止脚本
echo    v2026.09.20
echo ================================================================
echo    端口: %PORT%
echo ================================================================
echo.

if "%PORT%"=="0" (
    echo [*] 正在终止所有 Node.js 进程 ...
    powershell -NoProfile -Command "Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object { Write-Host ('  Kill PID {0}' -f $_.Id); Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }; Write-Host '完成'"
) else (
    echo [*] 查找占用端口 %PORT% 的进程 ...
    powershell -NoProfile -Command "$c=Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if ($c) { $p=Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue; if ($p) { Write-Host ('  Kill PID {0} ({1}) on port {2}' -f $p.Id, $p.ProcessName, %PORT%); Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue; Write-Host '完成' } else { Write-Host '  端口未被进程占用' } } else { Write-Host '  端口未被监听' }"
)

echo.
echo ================================================================
echo    √ 已关闭服务器
echo ================================================================
echo.
timeout /t 3 >nul 2>&1
endlocal
