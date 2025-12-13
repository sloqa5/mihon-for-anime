@echo off
REM Video Stream APK Builder for Windows
REM Builds production-ready APK for Android tablets

echo ======================================
echo Video Stream APK Builder (Windows)
echo ======================================
echo.

cd /d "%~dp0"
echo Working directory: %CD%
echo.

REM Check for required commands
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [2/5] Building web application...
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [3/5] Syncing with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [4/5] Building Android APK...
cd android

if not exist "gradlew.bat" (
    echo Error: Gradle wrapper not found
    exit /b 1
)

REM Build debug APK
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    cd ..
    exit /b %errorlevel%
)

REM Check if APK was created
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo [5/5] Success! APK built successfully
    
    REM Get app version from package.json
    cd ..
    for /f "delims=" %%i in ('node -p "require('./package.json').version"') do set VERSION=%%i
    set APK_NAME=VideoStream-v%VERSION%.apk
    
    REM Copy to project root with version
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "%APK_NAME%" >nul
    
    REM Get APK size
    for %%A in ("%APK_NAME%") do set APK_SIZE=%%~zA
    set /a APK_SIZE_MB=%APK_SIZE% / 1048576
    
    echo.
    echo ======================================
    echo BUILD COMPLETE
    echo ======================================
    echo APK Location: %APK_NAME%
    echo APK Size: ~%APK_SIZE_MB% MB
    echo.
    echo Install on your tablet:
    echo 1. Transfer %APK_NAME% to your device
    echo 2. Enable 'Install from Unknown Sources'
    echo 3. Tap the APK to install
    echo ======================================
) else (
    cd ..
    echo.
    echo ======================================
    echo BUILD FAILED
    echo ======================================
    echo APK was not created. Check errors above.
    exit /b 1
)
