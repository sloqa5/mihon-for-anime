# Video Stream - Netflix-like App for Android Tablets

A powerful, Netflix-inspired video streaming application designed specifically for Android tablets. Watch videos from any URL, organize your content, and enjoy professional-grade video playback features.

## 🚀 Quick Start

**Download**: `VideoStream-v1.0.0.apk`

**Installation**: See [INSTALL.md](./INSTALL.md) for complete setup guide

**No server required!** Standalone native Android app.

## 📦 What's New in v1.0.0

- ✅ Production-ready APK build
- ✅ Improved tablet optimization
- ✅ Better error handling
- ✅ Fixed all critical bugs
- ✅ Enhanced touch targets for tablets
- ✅ Landscape mode optimization
- ✅ Improved performance

## ✨ Features

- 🎬 **Netflix-style Interface** - Dark/light themes, grid layout, responsive design
- 🔗 **URL-based Streaming** - Add videos from any website or streaming service
- 📁 **Local File Support** - Upload and organize videos from your device
- 🌐 **Website Scraping** - Automatically extract video links from any webpage
- ⚡ **Batch Import** - Add multiple videos at once with playlist support
- ⏯️ **Advanced Player** - Subtitles, speed control, keyboard shortcuts
- 💾 **Progress Tracking** - Resume where you left off across all devices
- 📱 **Native Android App** - Standalone APK with tablet optimization
- 🎛️ **Smart Organization** - Automatic series grouping and episode ordering

## 📱 Quick Installation

**For detailed installation steps, see [INSTALL.md](./INSTALL.md)**

**Quick Summary:**
1. Download `VideoStream-v1.0.0.apk`
2. Transfer to your tablet
3. Enable "Unknown Sources" in Settings
4. Tap APK to install
5. Open and start streaming!

## 🎯 How to Add Videos

### Method 1: Single URL Streaming
1. **Open the app sidebar** (tap menu or swipe right)
2. **Go to "Add Streaming URL"** section
3. **Enter title** (optional - will use URL if blank)
4. **Paste video URL** (direct video file link)
5. **Tap "+ Add Stream"**

**Supported Video Formats:**
- Direct MP4 files
- HLS streams (.m3u8)
- WebM videos
- MKV files (if supported by browser)

### Method 2: Batch Import (Playlists)
1. **Open sidebar** → **"Season / Playlist" section**
2. **Enter playlist title** (optional)
3. **Format URLs** one per line:
   ```
   My Video 1 | https://example.com/video1.mp4
   My Video 2 | https://example.com/video2.mp4
   Episode 1 | https://example.com/episode1.mp4
   ```
4. **Tap "+ Add Playlist Links"**
5. **Videos auto-organize** as a collection

### Method 3: Website Scraping
1. **Open sidebar** → **"Import from website"**
2. **Enter webpage URL** containing video links
3. **Add title prefix** (optional, names your collection)
4. **Tap "Scan page for videos"**
5. **App extracts** all video links automatically

**What it finds:**
- Direct video file links (.mp4, .webm, .mkv, .m3u8)
- HTML video tags
- Embedded video sources

### Method 4: Local Files
1. **Open sidebar** → **"Library" section**
2. **Tap "+ Add Folder / Files"**
3. **Select video files** or entire folders
4. **App processes** and organizes automatically

## 🎮 App Navigation & Usage

### Main Interface
- **Continue Watching** - Shows videos you're currently watching
- **Video Grid** - Browse all your content by collections
- **Search Bar** - Find videos by title
- **Filter Chips** - All/Watching/Unwatched/Watched

### Video Controls

#### Playback Controls
- **Play/Pause** - Tap video or spacebar (keyboard)
- **Seek** - Drag timeline or use arrow keys
- **Volume** - Device volume controls

#### Advanced Features
- **Speed Control** - 0.25x to 2x playback speed
- **Full Screen** - Tap fullscreen button or press 'F'
- **Subtitles** - Add VTT/SRT files or remote subtitle URLs
- **Next/Previous** - Navigate within collections

#### Keyboard Shortcuts (Tablet with Keyboard)
- `Space` - Play/Pause
- `←/→` - Seek ±5 seconds
- `↑/↓` - Seek ±30 seconds
- `F` - Toggle fullscreen
- `M` - Toggle mute
- `N/P` - Next/Previous video
- `1-4` - Set playback speed (1x, 1.25x, 1.5x, 2x)
- `Esc` - Close player

## 📁 Content Organization

### Automatic Organization
- **Series Detection** - Groups videos with similar titles
- **Episode Recognition** - Extracts episode numbers from filenames
- **Smart Ordering** - Maintains episode sequence

### Manual Management
- **Rename Videos** - Long-press any video card
- **Mark as Watched** - Check off completed videos
- **Remove Content** - Delete unwanted videos from library
- **Metadata Matching** - Fetch cover art and titles

## 🎨 App Features

### Theme Customization
- **Dark Theme** - Default Netflix-style dark mode
- **Light Theme** - Bright mode for daytime viewing
- **Toggle Button** - Sun/moon icon in header

### Viewing Modes
- **Grid View** - Netflix-style thumbnail grid
- **Continue Watching** - Horizontal scroll of in-progress content
- **Fullscreen Player** - Immersive viewing experience
- **Responsive Design** - Optimized for tablet landscape/portrait

## 🔧 Technical Requirements

### Device Requirements
- **Android 7.0+** (for PWA support)
- **Chrome Browser** (recommended) or compatible browser
- **Minimum 2GB RAM** for smooth performance
- **Stable Internet Connection** for streaming

### Video Format Support
- **H.264 MP4** - Universal compatibility
- **HLS (.m3u8)** - Adaptive streaming
- **WebM** - Modern compression
- **Subtitles** - VTT, SRT files

## 🌐 Finding Video URLs

### Direct Video Links
Look for URLs ending in:
- `.mp4` - Most common format
- `.webm` - Modern format
- `.m3u8` - HLS streaming
- `.mkv` - High-quality format

### Popular Sources
- **Educational platforms** with direct video downloads
- **Personal media servers** (Plex, Jellyfin)
- **Cloud storage** with video files
- **Open source video archives**
- **CDN links** from streaming platforms

### Website Scraping Tips
- Works best on pages with direct video links
- May not work on DRM-protected content
- Avoid copyrighted material without permission

## 🔍 Troubleshooting

### Common Issues

**App Won't Install**
- Ensure Chrome is updated
- Check internet connection
- Clear browser cache
- Try refreshing the page

**Videos Won't Play**
- Verify URL is direct video link
- Check internet stability
- Test in desktop browser first
- Try different video format

**Subtitles Not Showing**
- Ensure subtitle file is valid (VTT/SRT)
- Check subtitle URL is accessible
- Try manual subtitle upload

**App Performance Issues**
- Close unused browser tabs
- Clear app cache
- Restart device
- Check available storage

### Getting Help
- **Check Console**: Open developer tools for error messages
- **Test URLs**: Verify links work in browser first
- **Network Issues**: Check firewall/router settings

## 📱 Usage Tips

### Best Practices
- **Batch Import** for series to maintain episode order
- **Use descriptive titles** for easy searching
- **Regularly backup** your watch progress
- **Organize by genre** using title prefixes
- **Test URLs** before adding large collections

### Optimization Tips
- **Use Wi-Fi** for better streaming quality
- **Close other apps** for smoother playback
- **Prefer MP4 format** for universal compatibility
- **Add subtitles** for better accessibility

## 🚀 Advanced Features

### Progressive Web App (PWA)
- **Offline Support** - App works without internet
- **Background Sync** - Syncs progress when online
- **App-like Experience** - Native app feel
- **Auto-updates** - Always get latest features

### Smart Features
- **Auto-resume** - Continue where you left off
- **Watch Progress** - Visual progress bars
- **Smart Grouping** - Automatic series organization
- **Cross-device Sync** - Same progress everywhere

## 📞 Support

For technical issues or feature requests:
1. **Check this README** for common solutions
2. **Test URLs in browser** to verify they work
3. **Report issues** with device and browser details
4. **Suggest features** for future updates

---

**Enjoy your personalized Netflix-like video streaming experience! 🍿**

*Note: Please respect copyright laws and only use content you have rights to access.*