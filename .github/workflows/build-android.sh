#!/bin/bash

# Build Android APK without Android Studio

echo "Setting up environment..."

# Set environment variables
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# Navigate to project directory
cd /workspace/cmizwy7fr00fwilocyqx84nw6/mihon-for-anime/.github/workflows

echo "Current directory: $(pwd)"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "JAVA_HOME: $JAVA_HOME"

# Accept licenses
echo "Accepting Android SDK licenses..."
printf 'y\ny\ny\ny\ny\ny\ny\n' | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || echo "License acceptance may have failed"

# Install required SDK components
echo "Installing Android SDK components..."
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" || echo "SDK component installation may have failed"

# Sync Capacitor
echo "Syncing Capacitor with Android..."
npx cap sync android

# Try to build APK using Gradle
echo "Attempting to build APK..."
cd android

# Create debug keystore if it doesn't exist
if [ ! -f app/debug.keystore ]; then
    echo "Creating debug keystore..."
    keytool -genkey -v -keystore app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
fi

# Build APK
echo "Building debug APK..."
./gradlew assembleDebug

if [ -f app/build/outputs/apk/debug/app-debug.apk ]; then
    echo "✅ APK built successfully!"
    echo "APK location: app/build/outputs/apk/debug/app-debug.apk"
    cp app/build/outputs/apk/debug/app-debug.apk ../VideoStream.apk
    echo "✅ APK copied to VideoStream.apk"
else
    echo "❌ APK build failed"
    echo "Checking for build errors..."
    ls -la app/build/outputs/apk/debug/ || echo "Debug output directory doesn't exist"
fi

echo "Build process completed."