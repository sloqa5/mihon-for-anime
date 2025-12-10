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

export function parseFilename(filename) {
  let name = filename.replace(/\.[^/.]+$/, "");
  name = name.replace(/[._]+/g, " ");
  name = name.replace(/[\[\(].*?[\]\)]/g, " ");

  let working = name.toLowerCase();

  COMMON_TAGS.forEach((tag) => {
    const regex = new RegExp(`\\b${tag}\\b`, "gi");
    working = working.replace(regex, " ");
  });

  let episodeGuess = null;
  const episodePatterns = [
    /\bep?\s?(\d{1,3})\b/i,
    /\bepisode\s?(\d{1,3})\b/i,
    /[-\s]\s?(\d{1,3})$/i
  ];

  for (const pattern of episodePatterns) {
    const match = working.match(pattern);
    if (match && match[1]) {
      episodeGuess = parseInt(match[1], 10);
      working = working.replace(pattern, " ");
      break;
    }
  }

  working = working.replace(/\s+/g, " ").trim();
  const titleGuess = working || filename.replace(/\.[^/.]+$/, "");

  return { titleGuess, episodeGuess };
}
