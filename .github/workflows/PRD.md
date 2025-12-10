# MyAnime Library – Product Requirements (current build)

## 1. Overview
Tablet-first, Netflix-style web app for browsing and watching personal anime. Runs fully client-side (React/Vite), installable as a PWA, with metadata from AniList and progress persistence in localStorage.

## 2. Goals
- Smooth, touch-friendly browsing on Android tablets; also usable on phones/desktop.
- Support local files/folders (never uploaded).
- Support remote streams via direct URLs, seasons/playlists, and website scraping (auto-add video links).
- Fetch AniList metadata (covers/titles) with manual and bulk match.
- Netflix-like player UI with resume, speed, skip intro, next/previous within a series, subtitles, and HLS playback.
- Persist progress, watched state, and player preferences locally.

## 3. Non-goals
- No user accounts, cloud sync, or DRM bypass.
- No automatic device-wide storage scanning (user-driven file picking only).
- No backend; network calls only to AniList and user-provided media URLs.

## 4. Target users/devices
- Anime fans with local or self-hosted libraries.
- Primary: Android tablets (8–13"). Secondary: phones and desktop browsers.

## 5. Core Features
### Library ingest
- Add local files/folders via file picker (`multiple` + `webkitdirectory`).
- Add single remote stream (title + URL).
- Add season/playlist: paste lines of `Title | URL` (episode auto-number).
- Import from website: fetch a given page and scrape direct video links (.mp4/.mkv/.webm/.m3u8), auto-add in order with optional title prefix.
- Deduplicate remote URLs; ignore non-video files by MIME.
### Metadata (AniList)
- Per-item “Match thumbnail” and “Match all” bulk match.
- Stores cover image, AniList ID, and title in localStorage.
- Status pills: Matched, Streaming, Watched, Error; error handled gracefully.
### Browsing UI
- Netflix-style grid, placeholders for missing art, progress bars.
- Continue Watching row (progress >2%, not watched) sorted by last opened.
- Search across AniList title, filename guess, remote title/URL.
- Filters: All / Watching / Unwatched / Watched.
- Rename item inline; mark watched/unwatched actions.
### Player
- Drawer player with play/pause, seek ±10s, Skip intro, next/previous within series (grouped by title/episode order), fullscreen.
- HLS support via hls.js for .m3u8.
- Subtitles: load URL (VTT/SRT) or file upload (SRT auto-converted to VTT).
- Auto-resume from last position; auto-mark watched at ≥90%.
- Persisted player prefs (speed, mute, auto-play-next).
### Persistence
- localStorage: progress, watched flag, last position/time, matched metadata, source type/URL, player prefs.
### PWA
- `manifest.webmanifest`, icons, service worker (shell caching); installable and runs fullscreen; offline UI for local files.

## 6. Performance
- Handles large libraries; images lazy-load; all client-side, no backend.
- Build size noted (hls.js adds weight); can be code-split later if needed.

## 7. Security/Privacy
- Media never leaves device; only AniList and user-provided URLs are fetched.
- Requires user selection for local files. Remote playback depends on CORS of the media host.

## 8. Open items / backlog
- Code-split hls.js to shrink initial bundle.
- Smarter series grouping (use AniList IDs when matched).
- Better error surfacing (toasts/snackbars per action).
- Optional export/import of library state (JSON backup).
- Additional subtitle controls (font/size/background) and audio tracks.
