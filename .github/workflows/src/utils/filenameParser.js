// Common video quality and encoding tags to strip from filenames
const COMMON_TAGS = [
  "1080p",
  "720p",
  "480p",
  "x264",
  "x265",
  "h264",
  "h265",
  "bluray",
  "webrip",
  "web-dl",
  "dual audio",
  "multi",
  "10bit",
  "hi10",
  "aac",
  "flac"
];

/**
 * Parses video filenames to extract title and episode information
 * Handles common anime/video file naming conventions
 *
 * @param {string} filename - The video filename to parse
 * @returns {{titleGuess: string, episodeGuess: number|null}}
 */
export function parseFilename(filename) {
  // Remove file extension
  let name = filename.replace(/\.[^/.]+$/, "");

  // Replace dots and underscores with spaces
  name = name.replace(/[._]+/g, " ");

  // Remove content in brackets/parentheses (usually tags)
  name = name.replace(/[\[\(].*?[\]\)]/g, " ");

  let working = name.toLowerCase();

  // Remove quality/encoding tags
  COMMON_TAGS.forEach((tag) => {
    const regex = new RegExp(`\\b${tag}\\b`, "gi");
    working = working.replace(regex, " ");
  });

  // Try to extract episode number
  let episodeGuess = null;
  const episodePatterns = [
    /\bep?\s?(\d{1,3})\b/i,           // "ep1", "e01", "ep 12"
    /\bepisode\s?(\d{1,3})\b/i,       // "episode 1", "episode12"
    /[-\s]\s?(\d{1,3})$/i              // trailing number "- 01", " 12"
  ];

  for (const pattern of episodePatterns) {
    const match = working.match(pattern);
    if (match && match[1]) {
      episodeGuess = parseInt(match[1], 10);
      working = working.replace(pattern, " ");
      break;
    }
  }

  // Clean up multiple spaces
  working = working.replace(/\s+/g, " ").trim();
  const titleGuess = working || filename.replace(/\.[^/.]+$/, "");

  return { titleGuess, episodeGuess };
}
