import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

function VideoPlayerDrawer({
  video,
  onClose,
  onProgress,
  onEnded,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  playerPrefs,
  onPrefsChange
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const subtitleObjectUrl = useRef(null);

  const [playbackRate, setPlaybackRate] = useState(playerPrefs.playbackRate || 1);
  const [autoPlayNext, setAutoPlayNext] = useState(
    playerPrefs.autoPlayNext !== undefined ? playerPrefs.autoPlayNext : true
  );
  const [isMuted, setIsMuted] = useState(!!playerPrefs.muted);
  const [isPaused, setIsPaused] = useState(false);
  const [subtitleSrc, setSubtitleSrc] = useState(null);
  const [subtitleLabel, setSubtitleLabel] = useState("");
  const [subtitleUrlInput, setSubtitleUrlInput] = useState("");

  useEffect(() => {
    setPlaybackRate(playerPrefs.playbackRate || 1);
    setAutoPlayNext(
      playerPrefs.autoPlayNext !== undefined ? playerPrefs.autoPlayNext : true
    );
    setIsMuted(!!playerPrefs.muted);
  }, [playerPrefs]);

  useEffect(() => {
    if (!video || !videoRef.current) return;
    const src =
      video.sourceType === "remote" ? video.remoteUrl : video.objectUrl;
    const isHls = src && src.toLowerCase().includes(".m3u8");

    if (isHls && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current) {
      videoRef.current.src = src;
    }

    if (video.lastPositionSec > 5) {
      const resumeTime = Math.max(video.lastPositionSec - 3, 0);
      videoRef.current.currentTime = resumeTime;
    }
    videoRef.current.playbackRate = playbackRate;
    videoRef.current.muted = isMuted;
    setIsPaused(false);
    setSubtitleSrc(null);
    setSubtitleLabel("");
    setSubtitleUrlInput("");

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (subtitleObjectUrl.current) {
        URL.revokeObjectURL(subtitleObjectUrl.current);
        subtitleObjectUrl.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
    videoRef.current.muted = isMuted;
  }, [playbackRate, isMuted]);

  useEffect(() => {
    if (typeof onPrefsChange === "function") {
      onPrefsChange({ playbackRate, muted: isMuted, autoPlayNext });
    }
  }, [playbackRate, isMuted, autoPlayNext, onPrefsChange]);

  if (!video) return null;

  const title =
    video.anilistTitle || video.titleGuess || video.file?.name || video.remoteUrl;

  const handleTimeUpdate = () => {
    if (!videoRef.current || !video) return;
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 0;
    if (typeof onProgress === "function") {
      onProgress(video.id, currentTime, duration);
    }
  };

  const handleEnded = () => {
    if (!videoRef.current || !video) return;
    const duration = videoRef.current.duration || 0;
    if (typeof onEnded === "function") {
      onEnded(video.id, duration);
    }
    if (autoPlayNext && hasNext && typeof onNext === "function") {
      onNext(video.id);
    }
  };

  const seekBy = (seconds) => {
    if (!videoRef.current) return;
    const { duration = 0, currentTime = 0 } = videoRef.current;
    const nextTime = Math.min(Math.max(currentTime + seconds, 0), duration || currentTime + seconds);
    videoRef.current.currentTime = nextTime;
  };

  const handleSkipIntro = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration || 0;
    if (duration < 30) return;
    seekBy(85);
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleFullscreen = () => {
    const node = containerRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      node.requestFullscreen?.();
    }
  };

  const handleNext = () => {
    if (hasNext && typeof onNext === "function") {
      onNext(video.id);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && typeof onPrevious === "function") {
      onPrevious(video.id);
    }
  };

  const handlePlay = () => setIsPaused(false);
  const handlePause = () => setIsPaused(true);

  const attachSubtitleTrack = (src, label) => {
    if (!videoRef.current) return;
    // Remove existing track
    const tracks = videoRef.current.querySelectorAll("track[data-kind='user']");
    tracks.forEach((t) => t.remove());
    const track = document.createElement("track");
    track.setAttribute("kind", "subtitles");
    track.setAttribute("src", src);
    track.setAttribute("label", label || "Subtitles");
    track.setAttribute("default", "default");
    track.setAttribute("data-kind", "user");
    videoRef.current.appendChild(track);
    setSubtitleSrc(src);
    setSubtitleLabel(label || "Subtitles");
  };

  const convertSrtToVtt = (text) => `WEBVTT\n\n${text.replace(/,/g, ".")}`;

  const handleSubtitleFile = async (file) => {
    if (!file) return;
    if (subtitleObjectUrl.current) {
      URL.revokeObjectURL(subtitleObjectUrl.current);
    }
    const ext = file.name.toLowerCase().split(".").pop();
    const buffer = await file.text();
    let data = buffer;
    if (ext === "srt") {
      data = convertSrtToVtt(buffer);
    }
    const blob = new Blob([data], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    subtitleObjectUrl.current = url;
    attachSubtitleTrack(url, file.name);
  };

  const handleSubtitleUrl = (e) => {
    e.preventDefault();
    if (!subtitleUrlInput.trim()) return;
    attachSubtitleTrack(subtitleUrlInput.trim(), "Remote subtitles");
    setSubtitleUrlInput("");
  };

  return (
    <div className="player-backdrop" onClick={onClose}>
      <div
        className="player-container"
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
      >
        <header className="player-header">
          <div>
            <h2 className="player-title">{title}</h2>
            <div className="player-subtitle-row">
              {video.episodeGuess && (
                <span className="player-episode">
                  Episode {video.episodeGuess}
                </span>
              )}
              {video.sourceType === "remote" && (
                <span className="pill pill-remote">Streaming</span>
              )}
              {subtitleSrc && (
                <span className="pill pill-success">
                  Subs: {subtitleLabel || "On"}
                </span>
              )}
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Close player">
            X
          </button>
        </header>

        <div className="player-video-wrapper">
          <video
            ref={videoRef}
            src={
              video.sourceType === "remote" ? video.remoteUrl : video.objectUrl
            }
            controls
            autoPlay
            className="player-video"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onPlay={handlePlay}
            onPause={handlePause}
          />
        </div>

        <div className="player-controls">
          <div className="player-controls-row">
            <button
              className="secondary-button"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              title="Previous video"
            >
              Prev
            </button>
            <button
              className="secondary-button"
              onClick={() => seekBy(-10)}
              title="Replay 10 seconds"
            >
              Back 10s
            </button>
            <button className="primary-button" onClick={handleTogglePlay}>
              {isPaused ? "Play" : "Pause"}
            </button>
            <button
              className="secondary-button"
              onClick={() => seekBy(10)}
              title="Skip forward 10 seconds"
            >
              +10s
            </button>
            <button className="secondary-button" onClick={handleSkipIntro}>
              Skip intro
            </button>
            <button
              className="secondary-button"
              onClick={handleNext}
              disabled={!hasNext}
              title="Next video"
            >
              Next
            </button>
          </div>

          <div className="player-controls-row">
            <div className="player-speed-group" role="group" aria-label="Playback speed">
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  className={
                    playbackRate === rate ? "chip chip-active" : "chip"
                  }
                  onClick={() => handleRateChange(rate)}
                  type="button"
                >
                  {rate}x
                </button>
              ))}
            </div>
            <div className="player-toggle-row">
              <button
                className={autoPlayNext ? "chip chip-active" : "chip"}
                onClick={() => setAutoPlayNext((v) => !v)}
                type="button"
              >
                Auto-play next
              </button>
              <button
                className={isMuted ? "chip chip-active" : "chip"}
                onClick={handleToggleMute}
                type="button"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button className="chip" onClick={handleFullscreen} type="button">
                Fullscreen
              </button>
            </div>
          </div>

          <div className="player-controls-row subtitle-row">
            <form className="subtitle-form" onSubmit={handleSubtitleUrl}>
              <input
                className="remote-input"
                type="url"
                placeholder="Subtitle URL (.vtt or .srt)"
                value={subtitleUrlInput}
                onChange={(e) => setSubtitleUrlInput(e.target.value)}
              />
              <button className="secondary-button" type="submit">
                Load URL
              </button>
            </form>
            <label className="file-picker-button">
              <span>+ Add subtitle file</span>
              <input
                type="file"
                accept=".vtt,.srt,text/vtt,text/plain"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSubtitleFile(file);
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerDrawer;
