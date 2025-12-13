# Video Stream - Installation Guide

## Quick Install (Recommended)

### What You Need
- Android tablet (Android 7.0 or higher)
- 50 MB free space

### Steps

1. **Transfer the APK**
   - Download `VideoStream-v1.0.0.apk` from the project
   - Transfer to your tablet via:
     - USB cable
     - Email attachment
     - Cloud storage (Google Drive, Dropbox)
     - Direct download on tablet

2. **Enable Installation from Unknown Sources**
   - Open **Settings** on your tablet
   - Go to **Security** or **Privacy**
   - Find **Install unknown apps** or **Unknown sources**
   - Enable for your file manager or browser

3. **Install the APK**
   - Open your file manager (Files, My Files, etc.)
   - Navigate to Downloads or where you saved the APK
   - Tap on `VideoStream-v1.0.0.apk`
   - Tap **Install**
   - Wait for installation to complete
   - Tap **Open** or find "Video Stream" in your app drawer

4. **Grant Permissions**
   - When prompted, allow:
     - **Storage access** (to play local videos)
     - **Network access** (to stream online videos)

5. **Start Using**
   - Tap the menu icon to add videos
   - Add streaming URLs or local files
   - Tap any video to start playing

## Troubleshooting

### "Installation Blocked"
- Make sure you enabled "Unknown Sources" for the correct app
- Try installing from a different file manager

### "App Not Installed"
- Check you have enough storage space (need ~50MB)
- Clear some space and try again
- Restart your tablet

### "Parse Error"
- APK file may be corrupted
- Download the APK again
- Make sure you're on Android 7.0 or higher

### App Crashes on Open
- Clear app data: Settings → Apps → Video Stream → Storage → Clear Data
- Restart your tablet
- Reinstall the app

## Building from Source

If you want to build the APK yourself:

### Requirements
- Node.js 18+
- npm or yarn
- JDK 17+
- Android SDK (or Android Studio)

### Build Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mihon-for-anime/.github/workflows
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the APK**
   ```bash
   npm run build:apk
   ```

4. **Find your APK**
   - Located at: `VideoStream-v1.0.0.apk`
   - Transfer to your tablet and install

### Build Commands

- `npm run build:apk` - Full build (web + APK)
- `npm run build:web` - Build web assets only
- `npm run android:clean` - Clean Android build cache
- `npm run build:full` - Clean + complete rebuild

## System Requirements

### Minimum
- Android 7.0 (Nougat)
- 2GB RAM
- 50MB storage

### Recommended
- Android 10.0 or higher
- 4GB+ RAM
- Stable internet for streaming

## Support

Having issues? Check:
1. This installation guide
2. Main README.md for usage help
3. Make sure Android version is 7.0+
4. Try reinstalling the app

---

Enjoy streaming! 🎬
