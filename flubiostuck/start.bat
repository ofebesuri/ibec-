@echo off
chcp 65001 >nul
title FluBioStack Web - v2026.09.20-Final

:: ============================================================
:: FluBioStack Web 启动器 (v2026.09.20-Final)
::   - 与 flubiostack\start.bat 透传链路
::   - 与 flubiostack\web\start.sh 行为对齐
::   - 支持 --port / --dev / --build / --no-browser / --flush-cache
:: ============================================================

setlocal
set "WEB_DIR=%~dp0"
if "%WEB_DIR:~-1%"=="\" set "WEB_DIR=%WEB_DIR:~0,-1%"
cd /d "%WEB_DIR%"

set "PORT=3434"
set "BUILD=0"
set "DEV=0"
set "FLUSH=0"
set "BROWSER=1"

:parse_args
if "%~1"=="" goto :after_parse
if /i "%~1"=="--port" ( set "PORT=%~2" & shift & shift & goto :parse_args )
if /i "%~1"=="-p" ( set "PORT=%~2" & shift & shift & goto :parse_args )
if /i "%~1"=="--dev" ( set "DEV=1" & shift & goto :parse_args )
if /i "%~1"=="--build" ( set "BUILD=1" & shift & goto :parse_args )
if /i "%~1"=="--flush-cache" ( set "FLUSH=1" & shift & goto :parse_args )
if /i "%~1"=="--no-browser" ( set "BROWSER=0" & shift & goto :parse_args )
if /i "%~1"=="-h" ( goto :show_help )
if /i "%~1"=="--help" ( goto :show_help )
shift
goto :parse_args

:after_parse

echo ================================================================
echo    FluBioStack Web 启动器 - v2026.09.20-Final
echo    端口: %PORT%   模式: %DEV%   构建: %BUILD%
echo ================================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未找到 node，请先安装 Node.js 18+ 后重试
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未找到 npm，请先安装 Node.js 18+ 后重试
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] 首次启动，正在安装依赖 ...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo [ERROR] npm install 失败
        pause
        exit /b 1
    )
)

if "%FLUSH%"=="1" (
    echo [INFO] 清理 Next.js 缓存 ...
    if exist ".next" rmdir /s /q ".next"
)

if "%BUILD%"=="1" (
    echo [INFO] 构建 web ...
    if "%NODE_OPTIONS%"=="" set "NODE_OPTIONS=--max-old-space-size=3072"
    call npm run build
    if errorlevel 1 (
        echo [ERROR] npm run build 失败
        pause
        exit /b 1
    )
)

if not exist ".next" (
    echo [INFO] 首次启动，构建 web ...
    if "%NODE_OPTIONS%"=="" set "NODE_OPTIONS=--max-old-space-size=3072"
    call npm run build
    if errorlevel 1 (
        echo [ERROR] npm run build 失败
        pause
        exit /b 1
    )
)

set "HEALTH=http://localhost:%PORT%/api/health"
set "HOME=http://localhost:%PORT%/"

:: 检查端口是否已被占用
powershell -NoProfile -Command "try { $c=Get-NetTCPConnection -LocalPort %PORT% -ErrorAction Stop; if ($c) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
    echo [WARN] 端口 %PORT% 已被占用，尝试 %PORT%+1
    set /a PORT+=1
    set "HEALTH=http://localhost:%PORT%/api/health"
    set "HOME=http://localhost:%PORT%/"
)

if "%DEV%"=="1" (
    echo [INFO] 启动 dev 模式 (npm run dev) ...
    if "%BROWSER%"=="1" (
        start "" "%HOME%"
        timeout /t 2 /nobreak >nul
    )
    call npm run dev -- -p %PORT%
) else (
    echo [INFO] 启动 prod 模式 (npm run start) ...
    if "%BROWSER%"=="1" (
        start "" "%HOME%"
        timeout /t 3 /nobreak >nul
    )
    call npm run start -- -p %PORT%
)

endlocal
exit /b 0

:show_help
echo.
echo 用法: start.bat [options]
echo.
echo 选项:
echo   --port PORT, -p PORT    指定端口 (默认 3434)
echo   --dev                   启动开发模式 (热重载)
echo   --build                 启动前先构建
echo   --flush-cache           清理 .next 缓存后启动
echo   --no-browser            不自动打开浏览器
echo   -h, --help              显示帮助
echo.
exit /b 0
