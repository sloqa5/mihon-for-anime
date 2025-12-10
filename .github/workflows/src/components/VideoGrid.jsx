import React from "react";
import VideoCard from "./VideoCard";

function VideoGrid({
  videos,
  onSelectVideo,
  onMatchOne,
  onRemove,
  onRename,
  onMarkWatched,
  onMarkUnwatched
}) {
  if (!videos.length) {
    return (
      <div className="empty-state">
        <h2>Your library is empty</h2>
        <p>Use "Add Folder / Files" or "Add Streaming URL" on the left.</p>
      </div>
    );
  }

  return (
    <section className="video-grid">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onSelect={() => onSelectVideo(video)}
          onMatchOne={() => onMatchOne(video.id)}
          onRemove={() => onRemove(video.id)}
          onRename={(title) => onRename(video.id, title)}
          onMarkWatched={() => onMarkWatched(video.id)}
          onMarkUnwatched={() => onMarkUnwatched(video.id)}
        />
      ))}
    </section>
  );
}

export default VideoGrid;
