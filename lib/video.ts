export type VideoProvider = 'youtube' | 'vimeo' | 'external';

export interface VideoInfo {
  embedUrl: string;
  provider: VideoProvider;
  videoId: string;
  thumbnailUrl?: string;
}

export function parseVideoUrl(url: string): VideoInfo | null {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    // YouTube — múltiplos formatos
    if (['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
      let id: string | null = null;

      if (host === 'youtu.be') {
        id = parsed.pathname.split('/')[1] || null;
      } else if (parsed.pathname.startsWith('/shorts/')) {
        id = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null;
      } else if (parsed.pathname.startsWith('/embed/')) {
        id = parsed.pathname.split('/embed/')[1]?.split('/')[0] || null;
      } else {
        id = parsed.searchParams.get('v');
      }

      if (!id) return null;
      return {
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        provider: 'youtube',
        videoId: id,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }

    // Vimeo
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const id = parts[host === 'player.vimeo.com' ? 1 : 0];
      if (!id) return null;
      return {
        embedUrl: `https://player.vimeo.com/video/${id}?badge=0&autopause=0`,
        provider: 'vimeo',
        videoId: id,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/** Retorna apenas a URL de embed (compatível com código legado) */
export function getVideoEmbedUrl(url: string): string | null {
  return parseVideoUrl(url)?.embedUrl ?? null;
}
