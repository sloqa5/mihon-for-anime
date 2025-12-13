// Storage keys
export const STORAGE_KEYS = {
  PLAYBACK_PROGRESS: 'videoStreamPlaybackProgress',
  PLAYER_PREFS: 'videoStreamPlayerPrefs',
  THEME: 'videoStreamTheme'
};

// Video configuration
export const VIDEO_CONFIG = {
  EXTENSIONS: ['mp4', 'mkv', 'webm', 'm3u8'],
  RESUME_OFFSET_SECONDS: 3,
  WATCHED_THRESHOLD: 0.9,
  CONTINUE_WATCHING_THRESHOLD: 0.02,
  CONTINUE_WATCHING_MAX_ITEMS: 12,
  SKIP_INTRO_DURATION_SECONDS: 85,
  SKIP_INTRO_MIN_DURATION: 30
};

// Playback defaults
export const PLAYBACK_DEFAULTS = {
  RATE: 1,
  MUTED: false,
  AUTO_PLAY_NEXT: true
};

// UI configuration
export const UI_CONFIG = {
  TOAST_DURATION_MS: 4000,
  TOAST_DURATION_ERROR_MS: 5000,
  SEEK_SHORT_SECONDS: 5,
  SEEK_MEDIUM_SECONDS: 10,
  SEEK_LONG_SECONDS: 30
};

// API endpoints
export const API_ENDPOINTS = {
  ANILIST: 'https://graphql.anilist.co'
};

// Playback speed options
export const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2];
