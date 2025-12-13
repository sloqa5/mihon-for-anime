import { API_ENDPOINTS } from "../constants";

const ANILIST_ENDPOINT = API_ENDPOINTS.ANILIST;

export async function searchAnimeByTitle(title) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
      }
    }
  `;

  const variables = { search: title };

  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}. Check your internet connection.`);
  }

  const json = await res.json();
  const media = json?.data?.Media;
  if (!media) return null;

  return {
    id: media.id,
    title: media.title.english || media.title.romaji || title,
    coverImage: media.coverImage.large
  };
}
