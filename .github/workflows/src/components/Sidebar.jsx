import React, { useState } from "react";

function Sidebar({
  onFilesSelected,
  onMatchAll,
  isMatchingAll,
  totalVideos,
  onAddRemote,
  onAddRemoteBatch,
  onImportFromPage,
  importStatus,
  importStatusIsError,
  isImportingPage,
  matchProgress
}) {
  const [remoteTitle, setRemoteTitle] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistText, setPlaylistText] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");

  const handleAddRemote = (e) => {
    e.preventDefault();
    if (!remoteUrl.trim()) return;
    onAddRemote({
      title: remoteTitle.trim() || remoteUrl.trim(),
      url: remoteUrl.trim()
    });
    setRemoteTitle("");
    setRemoteUrl("");
  };

  const parsePlaylistLines = (text) =>
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const urlMatch = line.match(/https?:\/\/\S+/);
        const url = urlMatch ? urlMatch[0] : "";
        if (!url) return null;

        const beforeUrl = line.replace(url, "").trim();
        const numberedFallback = `Video ${index + 1}`;
        return {
          url,
          title: beforeUrl || playlistTitle.trim() || numberedFallback,
          episode: index + 1
        };
      })
      .filter(Boolean);

  const handleAddPlaylist = (e) => {
    e.preventDefault();
    const entries = parsePlaylistLines(playlistText);
    if (!entries.length) return;
    if (typeof onAddRemoteBatch === "function") {
      onAddRemoteBatch(entries);
    }
    setPlaylistText("");
    setPlaylistTitle("");
  };

  const handleDemoPlaylist = () => {
    const demo = [
      "Video 1 | https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?ep=1",
      "Video 2 | https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?ep=2",
      "Video 3 | https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?ep=3"
    ].join("\n");
    setPlaylistText(demo);
    setPlaylistTitle("Demo Playlist");
  };

  const handleImportPage = (e) => {
    e.preventDefault();
    if (typeof onImportFromPage !== "function") return;
    if (!pageUrl.trim()) return;
    onImportFromPage({ url: pageUrl.trim(), title: pageTitle.trim() });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h2 className="sidebar-title">Library</h2>
        <label className="file-picker-button">
          <span>+ Add Folder / Files</span>
          <input
            type="file"
            multiple
            webkitdirectory="true"
            directory=""
            onChange={onFilesSelected}
          />
        </label>
        <p className="sidebar-hint">
          Local files only. Everything stays on your device.
        </p>
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-title">Add Streaming URL</h2>
        <form onSubmit={handleAddRemote} className="remote-form">
          <input
            className="remote-input"
            type="text"
            placeholder="Title (optional)"
            value={remoteTitle}
            onChange={(e) => setRemoteTitle(e.target.value)}
          />
          <input
            className="remote-input"
            type="url"
            placeholder="https://your-stream-url.com/video.mp4"
            value={remoteUrl}
            onChange={(e) => setRemoteUrl(e.target.value)}
            required
          />
          <button type="submit" className="primary-button">
            + Add Stream
          </button>
        </form>
        <p className="sidebar-hint">
          Only use URLs you control or legal/open sources.
        </p>
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-title">Import from website</h2>
        <form onSubmit={handleImportPage} className="remote-form">
          <input
            className="remote-input"
            type="url"
            placeholder="https://example.com/episode-list"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            required
          />
          <input
            className="remote-input"
            type="text"
            placeholder="Title prefix (optional)"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />
          <button type="submit" className="primary-button" disabled={isImportingPage}>
            {isImportingPage ? "Scanning..." : "Scan page for videos"}
          </button>
        </form>
        {importStatus && (
          <p
            className={
              importStatusIsError ? "sidebar-status sidebar-status-error" : "sidebar-status"
            }
          >
            {importStatus}
          </p>
        )}
        <p className="sidebar-hint">
          We look for direct video links (.mp4/.mkv/.webm/.m3u8) on the page and add them in order.
        </p>
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-title">Season / Playlist</h2>
        <form onSubmit={handleAddPlaylist} className="remote-form">
          <input
            className="remote-input"
            type="text"
            placeholder="Playlist title (optional)"
            value={playlistTitle}
            onChange={(e) => setPlaylistTitle(e.target.value)}
          />
          <textarea
            className="remote-textarea"
            placeholder={"One URL per line. Optional title before URL.\nVideo 1 | https://example.com/video1.mp4"}
            value={playlistText}
            onChange={(e) => setPlaylistText(e.target.value)}
            rows={4}
            required
          />
          <div className="playlist-actions">
            <button type="submit" className="primary-button">
              + Add Playlist Links
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleDemoPlaylist}
            >
              Fill demo links
            </button>
          </div>
        </form>
        <p className="sidebar-hint">
          Paste multiple lines (Title | URL). Videos will be added in order.
        </p>
      </div>

      <div className="sidebar-section">
        <h2 className="sidebar-title">Metadata</h2>
        <button
          className="primary-button"
          onClick={onMatchAll}
          disabled={isMatchingAll || totalVideos === 0}
        >
          {isMatchingAll ? "Matching all..." : "Match video metadata"}
        </button>
        {matchProgress.total > 0 && (
          <p className="sidebar-status">
            Matching {matchProgress.done}/{matchProgress.total}
          </p>
        )}
        <p className="sidebar-hint">
          Tries to match titles and fetch cover art.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
