#!/bin/bash

# Video Stream APK Builder
# Builds production-ready APK for Android tablets

set -e  # Exit on any error

echo "======================================"
echo "Video Stream APK Builder"
echo "======================================"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || { echo "Error: Failed to navigate to script directory"; exit 1; }

echo "Working directory: $(pwd)"

# Set environment variables (if running in CI/CD environment)
export ANDROID_HOME=${ANDROID_HOME:-/opt/android-sdk}
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
export JAVA_HOME=${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}

# Check for required commands
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed"; exit 1; }

echo ""
echo "[1/5] Installing dependencies..."
npm install

echo ""
echo "[2/5] Building web application..."
npm run build

echo ""
echo "[3/5] Syncing with Capacitor..."
npx cap sync android

echo ""
echo "[4/5] Building Android APK..."
cd android

# Check if gradlew exists
if [ ! -f "./gradlew" ]; then
    echo "Error: Gradle wrapper not found"
    exit 1
fi

# Make gradlew executable
chmod +x ./gradlew

# Build debug APK
./gradlew assembleDebug

# Check if APK was created
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo "[5/5] Success! APK built successfully"

    # Get app version from package.json
    VERSION=$(node -p "require('../package.json').version")
    APK_NAME="VideoStream-v${VERSION}.apk"

    # Copy to project root with version
    cp app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"

    # Get APK size
    APK_SIZE=$(du -h "../${APK_NAME}" | cut -f1)

    echo ""
    echo "======================================"
    echo "✅ BUILD COMPLETE"
    echo "======================================"
    echo "APK Location: ${APK_NAME}"
    echo "APK Size: ${APK_SIZE}"
    echo ""
    echo "Install on your tablet:"
    echo "1. Transfer ${APK_NAME} to your device"
    echo "2. Enable 'Install from Unknown Sources'"
    echo "3. Tap the APK to install"
    echo "======================================"
else
    echo ""
    echo "======================================"
    echo "❌ BUILD FAILED"
    echo "======================================"
    echo "APK was not created. Check errors above."
    exit 1
fi