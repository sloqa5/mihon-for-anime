import React, { useState } from "react";

function VideoCard({
  video,
  onSelect,
  onMatchOne,
  onRemove,
  onRename,
  onMarkWatched,
  onMarkUnwatched
}) {
  const displayTitle =
    video.anilistTitle || video.titleGuess || video.file?.name || video.remoteUrl || "Untitled";
  const progressPercent = Math.min((video.progress || 0) * 100, 100);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(displayTitle);

  const handleStartEdit = () => {
    setEditTitle(displayTitle);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editTitle && editTitle.trim() && typeof onRename === "function") {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(displayTitle);
    setIsEditing(false);
  };

  return (
    <article className="video-card">
      <div className="video-thumb-wrapper" onClick={onSelect}>
        {video.status === 'loading' ? (
          <div className="video-thumb placeholder">
            <div className="loading-spinner"></div>
            <span className="loading-text">Matching...</span>
          </div>
        ) : video.coverImage ? (
          <img
            src={video.coverImage}
            alt={displayTitle}
            className="video-thumb"
            loading="lazy"
          />
        ) : (
          <div className="video-thumb placeholder">
            <span className="video-initial">
              {displayTitle.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="video-overlay">
          <span>{video.progress > 0 ? "Resume" : "Play"}</span>
        </div>

        {video.progress > 0 && (
          <div className="video-progress">
            <div
              className="video-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="video-info">
        {isEditing ? (
          <input
            type="text"
            className="video-title-edit"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
        ) : (
          <h3 className="video-title" title={displayTitle}>
            {displayTitle}
          </h3>
        )}
        {video.episodeGuess && (
          <span className="video-episode">Video {video.episodeGuess}</span>
        )}
      </div>

      <div className="video-meta-row">
        {video.sourceType === "remote" && (
          <span className="pill pill-remote">Streaming</span>
        )}
        {video.isWatched && <span className="pill pill-success">Watched</span>}
        {!video.isWatched && video.status === "matched" && (
          <span className="pill pill-success">Matched</span>
        )}
        {video.status === "loading" && (
          <span className="pill pill-loading">Matching...</span>
        )}
        {video.status === "error" && (
          <span className="pill pill-error">No match</span>
        )}
      </div>

      <div className="video-actions">
        <button
          className="secondary-button"
          onClick={onMatchOne}
          disabled={video.status === "loading"}
        >
          {video.status === "matched" ? "Retry match" : "Match thumbnail"}
        </button>
        <button
          className="icon-button"
          onClick={() => {
            if (window.confirm(`Remove "${displayTitle}" from library?`)) {
              onRemove();
            }
          }}
          title="Remove"
        >
          X
        </button>
      </div>

      <div className="video-actions">
        <button className="secondary-button" onClick={handleStartEdit}>
          Rename
        </button>
        <button
          className="secondary-button"
          onClick={video.isWatched ? onMarkUnwatched : onMarkWatched}
        >
          {video.isWatched ? "Mark unwatched" : "Mark watched"}
        </button>
      </div>

      {video.errorMessage && (
        <p className="error-text">{video.errorMessage}</p>
      )}
    </article>
  );
}

export default VideoCard;
