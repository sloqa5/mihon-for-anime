import React, { useState, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoGrid from "./components/VideoGrid";
import VideoPlayerDrawer from "./components/VideoPlayerDrawer";
import { parseFilename } from "./utils/filenameParser";
import { searchAnimeByTitle } from "./services/anilist";
import { STORAGE_KEYS, VIDEO_CONFIG, UI_CONFIG } from "./constants";

const PROGRESS_STORAGE_KEY = STORAGE_KEYS.PLAYBACK_PROGRESS;
const PLAYER_PREFS_KEY = STORAGE_KEYS.PLAYER_PREFS;
const VIDEO_EXTENSIONS = VIDEO_CONFIG.EXTENSIONS;

function resolveUrlMaybe(url, base) {
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

function looksPlayable(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(`.${ext}`));
}

function extractVideoLinksFromHtml(html, baseUrl) {
  const links = new Set();
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll("a[href], source[src], video[src]").forEach((node) => {
      const raw = node.getAttribute("href") || node.getAttribute("src");
      const absolute = resolveUrlMaybe(raw, baseUrl);
      if (looksPlayable(absolute)) {
        links.add(absolute);
      }
    });
  } catch {
    // ignore parse errors and fallback to regex
  }

  if (links.size === 0) {
    const regex = /https?:\/\/[^"'\\s>]+/gi;
    let match;
    while ((match = regex.exec(html))) {
      const candidate = resolveUrlMaybe(match[0], baseUrl);
      if (looksPlayable(candidate)) {
        links.add(candidate);
      }
    }
  }

  return Array.from(links);
}

function loadProgressMap() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveProgressEntry(stableKey, entry) {
  try {
    const map = loadProgressMap();
    map[stableKey] = entry;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function loadPlayerPrefs() {
  try {
    const raw = localStorage.getItem(PLAYER_PREFS_KEY);
    if (!raw) return { playbackRate: 1, muted: false, autoPlayNext: true };
    const parsed = JSON.parse(raw);
    return {
      playbackRate: parsed.playbackRate || 1,
      muted: !!parsed.muted,
      autoPlayNext: parsed.autoPlayNext !== undefined ? !!parsed.autoPlayNext : true
    };
  } catch {
    return { playbackRate: 1, muted: false, autoPlayNext: true };
  }
}

function savePlayerPrefs(prefs) {
  try {
    localStorage.setItem(PLAYER_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isMatchingAll, setIsMatchingAll] = useState(false);
  const [isImportingPage, setIsImportingPage] = useState(false);
  const [pageImportStatus, setPageImportStatus] = useState("");
  const [pageImportIsError, setPageImportIsError] = useState(false);
  const [playerPrefs, setPlayerPrefs] = useState(() => loadPlayerPrefs());
  const [matchProgress, setMatchProgress] = useState({ done: 0, total: 0 });
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | watching | unwatched | watched

  const showToast = (message, type = "info", timeout = UI_CONFIG.TOAST_DURATION_MS) => {
    setToast({ message, type });
    if (timeout) {
      setTimeout(() => setToast(null), timeout);
    }
  };

  const handlePrefsChange = (next) => {
    const merged = { ...playerPrefs, ...next };
    setPlayerPrefs(merged);
    savePlayerPrefs(merged);
  };

  const handleFilesSelected = useCallback((event) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const savedProgress = loadProgressMap();

    const newVideos = Array.from(fileList)
      .filter((file) => file.type.startsWith("video/"))
      .map((file, index) => {
        const stableKey = `${file.name}|${file.size}`;
        const saved = savedProgress[stableKey] || {};

        const id = `${file.name}-${file.lastModified}-${index}`;
        const { titleGuess, episodeGuess } = parseFilename(file.name);

        return {
          id,
          stableKey,
          sourceType: "local",
          file,
          objectUrl: URL.createObjectURL(file),
          remoteUrl: saved.remoteUrl || null,
          titleGuess,
          episodeGuess,
          coverImage: saved.coverImage || null,
          anilistTitle: saved.anilistTitle || null,
          anilistId: saved.anilistId || null,
          status: saved.status || "idle",
          errorMessage: null,
          progress: saved.progress || 0,
          lastPositionSec: saved.lastPositionSec || 0,
          isWatched: !!saved.isWatched,
          lastWatchedAt: saved.lastWatchedAt || null,
          addedAt: Date.now()
        };
      });

    setVideos((prev) => [...prev, ...newVideos]);
    event.target.value = "";
  }, []);

  const handleAddRemoteStream = ({ title, url }) => {
    if (
      videos.some(
        (v) => v.sourceType === "remote" && v.remoteUrl === url.trim()
      )
    ) {
      return;
    }
    const id = `remote-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const stableKey = `remote|${url}`;
    const saved = loadProgressMap()[stableKey] || {};

    const newVideo = {
      id,
      stableKey,
      sourceType: "remote",
      file: null,
      objectUrl: null,
      remoteUrl: url,
      titleGuess: title,
      episodeGuess: null,
      coverImage: saved.coverImage || null,
      anilistTitle: saved.anilistTitle || null,
      anilistId: saved.anilistId || null,
      status: saved.status || "idle",
      errorMessage: null,
      progress: saved.progress || 0,
      lastPositionSec: saved.lastPositionSec || 0,
      isWatched: !!saved.isWatched,
      lastWatchedAt: saved.lastWatchedAt || null,
      addedAt: Date.now()
    };

    setVideos((prev) => [newVideo, ...prev]);
  };

  const handleAddRemoteBatch = (entries) => {
    if (!entries || !entries.length) return;
    const savedProgress = loadProgressMap();
    const existingRemoteKeys = new Set(
      videos
        .filter((v) => v.sourceType === "remote" && v.remoteUrl)
        .map((v) => `remote|${v.remoteUrl}`)
    );

    const newVideos = entries
      .filter((entry) => entry.url)
      .map((entry, index) => {
        const url = entry.url.trim();
        if (!url) return null;

        const stableKey = `remote|${url}`;
        if (existingRemoteKeys.has(stableKey)) return null;
        existingRemoteKeys.add(stableKey);

        const id = `remote-${Date.now()}-${index}-${Math.random()
          .toString(36)
          .slice(2)}`;
        const saved = savedProgress[stableKey] || {};

        return {
          id,
          stableKey,
          sourceType: "remote",
          file: null,
          objectUrl: null,
          remoteUrl: url,
          titleGuess: entry.title || url,
          episodeGuess: entry.episode || null,
          coverImage: saved.coverImage || null,
          anilistTitle: saved.anilistTitle || null,
          anilistId: saved.anilistId || null,
          status: saved.status || "idle",
          errorMessage: null,
          progress: saved.progress || 0,
          lastPositionSec: saved.lastPositionSec || 0,
          isWatched: !!saved.isWatched,
          lastWatchedAt: saved.lastWatchedAt || null,
          addedAt: Date.now()
        };
      })
      .filter(Boolean);

    if (!newVideos.length) return;
    setVideos((prev) => [...newVideos, ...prev]);
    showToast(`Added ${newVideos.length} link${newVideos.length > 1 ? "s" : ""}`, "success");
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const handleImportFromPage = async ({ url, title }) => {
    const pageUrl = (url || "").trim();
    if (!pageUrl) return;
    setIsImportingPage(true);
    setPageImportIsError(false);
    setPageImportStatus("Fetching page...");
    try {
      const res = await fetch(pageUrl);
      if (!res.ok) {
        throw new Error(`Couldn't load page. Server returned error ${res.status}`);
      }
      const html = await res.text();
      const links = extractVideoLinksFromHtml(html, pageUrl);
      if (!links.length) {
        throw new Error("No video links found on this page. Try a different URL or check if the site blocks scraping.");
      }

      const entries = links.map((link, index) => {
        const prefix = title && title.trim() ? title.trim() : null;
        return {
          url: link,
          title: prefix ? `${prefix} ${index + 1}` : link,
          episode: index + 1
        };
      });

      handleAddRemoteBatch(entries);
      setPageImportStatus(`Added ${entries.length} video link${entries.length > 1 ? "s" : ""}`);
      setPageImportIsError(false);
      showToast(`Imported ${entries.length} links`, "success");
    } catch (err) {
      setPageImportStatus(err.message || "Failed to import links");
      setPageImportIsError(true);
      showToast(err.message || "Import failed", "error", UI_CONFIG.TOAST_DURATION_ERROR_MS);
    } finally {
      setIsImportingPage(false);
    }
  };

  const handleMatchOne = async (videoId) => {
    const existing = videos.find((v) => v.id === videoId);
    if (!existing) return;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, status: "loading", errorMessage: null } : v
      )
    );

    const searchTitle =
      existing.titleGuess ||
      existing.anilistTitle ||
      existing.file?.name ||
      existing.remoteUrl ||
      "Video";

    try {
      const result = await searchAnimeByTitle(searchTitle);
      if (!result) {
        throw new Error("Couldn't find metadata for this title. Try renaming it.");
      }

      setVideos((prev) => {
        let updatedVideo = null;
        const next = prev.map((v) => {
          if (v.id !== videoId) return v;
          updatedVideo = {
            ...v,
            status: "matched",
            anilistTitle: result.title,
            anilistId: result.id,
            coverImage: result.coverImage,
            errorMessage: null
          };
          return updatedVideo;
        });

        if (updatedVideo) {
          const {
            stableKey,
            coverImage,
            anilistTitle,
            anilistId,
            status,
            progress,
            lastPositionSec,
            isWatched,
            lastWatchedAt,
            sourceType,
            remoteUrl
          } = updatedVideo;

          saveProgressEntry(stableKey, {
            coverImage,
            anilistTitle,
            anilistId,
            status,
            progress,
            lastPositionSec,
            isWatched,
            lastWatchedAt,
            sourceType,
            remoteUrl: remoteUrl || null
          });
        }

        return next;
      });
    } catch (err) {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                status: "error",
                errorMessage: err.message || "Failed to fetch metadata. Check your internet connection."
              }
            : v
        )
      );
    }
  };

  const handleMatchAll = async () => {
    const queue = videos.filter(
      (v) => v.status !== "matched" && v.status !== "loading"
    );
    if (!queue.length) {
      showToast("Nothing to match", "info");
      return;
    }
    setIsMatchingAll(true);
    setMatchProgress({ done: 0, total: queue.length });
    for (const v of queue) {
      // Intentionally sequential - prevents API rate limiting
      // eslint-disable-next-line no-await-in-loop
      await handleMatchOne(v.id);
      setMatchProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }
    setIsMatchingAll(false);
    setTimeout(() => setMatchProgress({ done: 0, total: 0 }), 500);
  };

  const handleRemoveVideo = (videoId) => {
    setVideos((prev) => {
      const target = prev.find((v) => v.id === videoId);
      if (target && target.objectUrl) {
        URL.revokeObjectURL(target.objectUrl);
      }
      return prev.filter((v) => v.id !== videoId);
    });

    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo(null);
    }
  };

  const handleRenameVideo = (videoId, title) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, titleGuess: title } : v))
    );
  };

  const handleMarkWatched = (videoId) => {
    setVideos((prev) => {
      let updated = null;
      const next = prev.map((v) => {
        if (v.id !== videoId) return v;
        updated = {
          ...v,
          isWatched: true,
          progress: 1,
          lastPositionSec: v.lastPositionSec,
          lastWatchedAt: Date.now()
        };
        return updated;
      });
      if (updated) {
        const {
          stableKey,
          coverImage,
          anilistTitle,
          anilistId,
          status,
          progress,
          lastPositionSec,
          isWatched,
          lastWatchedAt,
          sourceType,
          remoteUrl
        } = updated;
        saveProgressEntry(stableKey, {
          coverImage,
          anilistTitle,
          anilistId,
          status,
          progress,
          lastPositionSec,
          isWatched,
          lastWatchedAt,
          sourceType,
          remoteUrl: remoteUrl || null
        });
      }
      return next;
    });
  };

  const handleMarkUnwatched = (videoId) => {
    setVideos((prev) => {
      let updated = null;
      const next = prev.map((v) => {
        if (v.id !== videoId) return v;
        updated = {
          ...v,
          isWatched: false,
          progress: 0,
          lastPositionSec: 0
        };
        return updated;
      });
      if (updated) {
        const {
          stableKey,
          coverImage,
          anilistTitle,
          anilistId,
          status,
          progress,
          lastPositionSec,
          isWatched,
          lastWatchedAt,
          sourceType,
          remoteUrl
        } = updated;
        saveProgressEntry(stableKey, {
          coverImage,
          anilistTitle,
          anilistId,
          status,
          progress,
          lastPositionSec,
          isWatched,
          lastWatchedAt: lastWatchedAt || null,
          sourceType,
          remoteUrl: remoteUrl || null
        });
      }
      return next;
    });
  };

  const handlePlaybackProgress = (videoId, currentTime, duration) => {
    setVideos((prev) => {
      let updatedVideo = null;

      const next = prev.map((v) => {
        if (v.id !== videoId) return v;

        const progress = duration ? currentTime / duration : 0;
        const isWatched = progress > VIDEO_CONFIG.WATCHED_THRESHOLD;
        const lastWatchedAt = Date.now();

        updatedVideo = {
          ...v,
          progress,
          lastPositionSec: currentTime,
          isWatched,
          lastWatchedAt
        };
        return updatedVideo;
      });

      if (updatedVideo) {
        const {
          stableKey,
          coverImage,
          anilistTitle,
          anilistId,
          status,
          progress,
          lastPositionSec,
          isWatched,
          lastWatchedAt,
          sourceType,
          remoteUrl
        } = updatedVideo;

        saveProgressEntry(stableKey, {
          coverImage,
          anilistTitle,
          anilistId,
          status,
          progress,
          lastPositionSec,
          isWatched,
          lastWatchedAt,
          sourceType,
          remoteUrl: remoteUrl || null
        });
      }

      return next;
    });
  };

  const handlePlaybackEnded = (videoId, duration) => {
    handlePlaybackProgress(videoId, duration || 0, duration || 1);
  };

  const getSeriesKey = (video) => {
    if (!video) return "";
    return (
      video.anilistTitle ||
      video.titleGuess ||
      video.file?.name ||
      video.remoteUrl ||
      ""
    )
      .toString()
      .toLowerCase();
  };

  const getAdjacentVideos = (currentId) => {
    const current = videos.find((v) => v.id === currentId);
    if (!current) return { prev: null, next: null };
    const seriesKey = getSeriesKey(current);
    const seriesVideos = videos
      .filter((v) => getSeriesKey(v) === seriesKey)
      .sort((a, b) => {
        if (a.episodeGuess && b.episodeGuess) {
          return a.episodeGuess - b.episodeGuess;
        }
        if (a.episodeGuess) return -1;
        if (b.episodeGuess) return 1;
        return (a.addedAt || 0) - (b.addedAt || 0);
      });
    const idx = seriesVideos.findIndex((v) => v.id === currentId);
    if (idx === -1) return { prev: null, next: null };
    return {
      prev: idx > 0 ? seriesVideos[idx - 1] : null,
      next: idx < seriesVideos.length - 1 ? seriesVideos[idx + 1] : null
    };
  };

  const handlePlayNext = (currentId) => {
    const { next } = getAdjacentVideos(currentId);
    if (next) setSelectedVideo(next);
  };

  const handlePlayPrevious = (currentId) => {
    const { prev } = getAdjacentVideos(currentId);
    if (prev) setSelectedVideo(prev);
  };

  let filteredVideos = videos;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredVideos = filteredVideos.filter((v) => {
      const title =
        v.anilistTitle || v.titleGuess || v.file?.name || v.remoteUrl || "";
      return title.toLowerCase().includes(q);
    });
  }

  if (filterMode === "watching") {
    filteredVideos = filteredVideos.filter(
      (v) => v.progress > 0 && !v.isWatched
    );
  } else if (filterMode === "unwatched") {
    filteredVideos = filteredVideos.filter((v) => v.progress === 0);
  } else if (filterMode === "watched") {
    filteredVideos = filteredVideos.filter((v) => v.isWatched);
  }

  const continueWatching = videos
    .filter((v) => v.progress > VIDEO_CONFIG.CONTINUE_WATCHING_THRESHOLD && !v.isWatched && v.lastWatchedAt)
    .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
    .slice(0, VIDEO_CONFIG.CONTINUE_WATCHING_MAX_ITEMS);

  return (
    <div className="app-root">
      <Header />
      <div className="app-layout">
        <Sidebar
          onFilesSelected={handleFilesSelected}
          onMatchAll={handleMatchAll}
          isMatchingAll={isMatchingAll}
          totalVideos={videos.length}
          onAddRemote={handleAddRemoteStream}
          onAddRemoteBatch={handleAddRemoteBatch}
          onImportFromPage={handleImportFromPage}
          importStatus={pageImportStatus}
          importStatusIsError={pageImportIsError}
          isImportingPage={isImportingPage}
          matchProgress={matchProgress}
        />

        <main className="app-main">
          <div className="toolbar">
            <div className="toolbar-left">
              <input
                type="search"
                className="search-input"
                placeholder="Search your library"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="toolbar-right">
              <button
                className={filterMode === "all" ? "chip chip-active" : "chip"}
                onClick={() => setFilterMode("all")}
              >
                All
              </button>
              <button
                className={
                  filterMode === "watching" ? "chip chip-active" : "chip"
                }
                onClick={() => setFilterMode("watching")}
              >
                Watching
              </button>
              <button
                className={
                  filterMode === "unwatched" ? "chip chip-active" : "chip"
                }
                onClick={() => setFilterMode("unwatched")}
              >
                Unwatched
              </button>
              <button
                className={
                  filterMode === "watched" ? "chip chip-active" : "chip"
                }
                onClick={() => setFilterMode("watched")}
              >
                Watched
              </button>
            </div>
          </div>

          {continueWatching.length > 0 && (
            <section className="continue-section">
              <h2 className="section-title">Continue Watching</h2>
              <div className="continue-row">
                {continueWatching.map((video) => (
                  <div
                    key={video.id}
                    className="continue-card"
                    onClick={() => handleSelectVideo(video)}
                  >
                    <div className="continue-thumb-wrapper">
                      {video.coverImage ? (
                        <img
                          src={video.coverImage}
                          alt={
                            video.anilistTitle ||
                            video.titleGuess ||
                            video.file?.name ||
                            video.remoteUrl
                          }
                          className="continue-thumb"
                          loading="lazy"
                        />
                      ) : (
                        <div className="continue-thumb placeholder">
                          <span className="video-initial">
                            {(video.anilistTitle ||
                              video.titleGuess ||
                              video.file?.name ||
                              video.remoteUrl ||
                              "?")[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      {video.progress > 0 && (
                        <div className="video-progress">
                          <div
                            className="video-progress-bar"
                            style={{
                              width: `${Math.min(
                                video.progress * 100,
                                100
                              )}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="continue-info">
                      <span
                        className="continue-title"
                        title={
                          video.anilistTitle ||
                          video.titleGuess ||
                          video.file?.name ||
                          video.remoteUrl
                        }
                      >
                        {video.anilistTitle ||
                          video.titleGuess ||
                          video.file?.name ||
                          video.remoteUrl}
                      </span>
                      {video.episodeGuess && (
                        <span className="continue-episode">
                          Video {video.episodeGuess}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <VideoGrid
            videos={filteredVideos}
            onSelectVideo={handleSelectVideo}
            onMatchOne={handleMatchOne}
            onRemove={handleRemoveVideo}
            onRename={handleRenameVideo}
            onMarkWatched={handleMarkWatched}
            onMarkUnwatched={handleMarkUnwatched}
          />
        </main>
      </div>

      <VideoPlayerDrawer
        video={selectedVideo}
        onClose={handleClosePlayer}
        onProgress={handlePlaybackProgress}
        onEnded={handlePlaybackEnded}
        onNext={handlePlayNext}
        onPrevious={handlePlayPrevious}
        hasNext={
          selectedVideo ? !!getAdjacentVideos(selectedVideo.id).next : false
        }
        hasPrevious={
          selectedVideo ? !!getAdjacentVideos(selectedVideo.id).prev : false
        }
        playerPrefs={playerPrefs}
        onPrefsChange={handlePrefsChange}
      />
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

export default App;
