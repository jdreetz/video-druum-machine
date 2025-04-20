export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^/?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^/?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

export const isValidYoutubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
};

export const getThumbnailUrl = (url: string): string | null => {
  const videoId = extractVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : null;
};

export const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (match) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, hours, minutes, seconds] = match;
    return (parseInt(hours || '0') * 3600) + 
           (parseInt(minutes || '0') * 60) + 
           parseInt(seconds || '0');
  }
  return 0;
};

export const getVideoDuration = async (url: string): Promise<number | null> => {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    if (!data.items?.length) return null;
    
    const duration = data.items[0].contentDetails.duration;
    return parseDuration(duration);
  } catch {
    return null;
  }
};
