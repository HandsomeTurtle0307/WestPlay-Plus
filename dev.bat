@echo off
chcp 65001 >nul
setlocal
rem Run from this file's own folder, wherever it is launched from.
cd /d "%~dp0"
title WestPlay Plus - dev

if not exist "node_modules" (
  echo 首次运行，先装依赖（根目录 + ui，可能要几分钟）...
  call npm install
  if errorlevel 1 (
    echo.
    echo 依赖安装失败，先解决上面的报错。
    pause
    exit /b 1
  )
)

echo 启动开发版：vite 起在 5173，同时编译并运行 target\debug\westplay.exe
echo 按 Ctrl+C 或关掉窗口即结束。
echo.
call npm run dev

echo.
echo 已退出（errorlevel=%errorlevel%）。
pause
endlocal
