interface YT {
  Player: {
    new (elementId: string, config: {
      height: string | number;
      width: string | number;
      videoId: string;
      playerVars?: {
        controls?: number;
        start?: number;
        modestbranding?: number;
      };
      events?: {
        onReady?: (event: { target: YT.Player }) => void;
        onStateChange?: (event: { data: number; target: YT.Player }) => void;
      };
    }): YT.Player;
  };
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

interface Player {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  setPlaybackRate(rate: number): void;
  destroy(): void;
}

interface Window {
  YT: YT;
  onYouTubeIframeAPIReady: () => void;
}
