import { useRef, useState, useEffect } from 'react';

interface VideoPreviewProps {
  videoId: string;
  startTime: number;
  endTime: number;
  playbackSpeed: number;
}

export const VideoPreview = ({ videoId, startTime, endTime, playbackSpeed }: VideoPreviewProps) => {
  const playerRef = useRef<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new YT.Player('youtube-preview', {
        height: '180',
        width: '320',
        videoId: videoId,
        playerVars: {
          controls: 1,
          start: Math.floor(startTime),
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0
        },
        events: {
          onReady: (event) => {
            event.target.setPlaybackRate(playbackSpeed);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              // Stop video when it reaches end time
              const checkTime = setInterval(() => {
                const currentTime = event.target.getCurrentTime();
                if (currentTime >= endTime) {
                  event.target.pauseVideo();
                  clearInterval(checkTime);
                }
              }, 100);
            }
          },
        },
      });
    };

    return () => {
      playerRef.current?.destroy();
    };
  }, [videoId, startTime, endTime, playbackSpeed]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative">
      <div id="youtube-preview" className="rounded-lg overflow-hidden"></div>
      <button
        onClick={togglePlay}
        className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
      >
        {isPlaying ? 'Stop' : 'Test Clip'}
      </button>
    </div>
  );
};
