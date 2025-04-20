import { useEffect, useState, useRef } from 'react';

interface FloatingVideoPlayerProps {
  rowUrls: string[];
  activeRow: number | null;
}

export const FloatingVideoPlayer = ({ rowUrls, activeRow }: FloatingVideoPlayerProps) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoStates, setVideoStates] = useState<Record<number, 'playing' | 'paused'>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isDragging && !isFullscreen) {
      setPosition({
        x: e.clientX - (containerRef.current?.offsetWidth || 0) / 2,
        y: e.clientY - 20
      });
    }
  };

  const handleGlobalMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Listen for YouTube player state changes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange') {
          // Get player index from iframe ID
          const iframe = (event.source as Window)?.frameElement as HTMLIFrameElement | null;
          const playerIndex = iframe?.id?.split('-')[2];
          if (playerIndex) {
            const index = parseInt(playerIndex, 10);
            if (!isNaN(index)) {
              setVideoStates(prev => ({
                ...prev,
                [index]: data.info === 1 ? 'playing' : 'paused'
              }));
            }
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden ${
        isFullscreen ? 'w-screen h-screen' : ''
      }`}
      style={{ 
        width: isFullscreen ? '100vw' : 320,
        height: isFullscreen ? '100vh' : 200,
        left: isFullscreen ? 0 : position.x,
        top: isFullscreen ? 0 : position.y,
        zIndex: 50
      }}
    >
      <div 
        className={`bg-gray-700 h-6 flex items-center justify-between px-2 text-white text-sm ${
          isFullscreen ? 'opacity-0 hover:opacity-100 transition-opacity' : ''
        }`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="flex-1"
          onMouseDown={handleMouseDown}
        >
          Video Player
        </div>
        <button
          onClick={toggleFullscreen}
          className="text-white hover:text-gray-300 transition-colors px-2"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? '⤧' : '⤨'}
        </button>
      </div>
      <div 
        className="relative" 
        style={{ 
          height: isFullscreen ? 'calc(100vh - 24px)' : 'calc(100% - 24px)',
          width: isFullscreen ? '100vw' : '100%'
        }}
      >
        {rowUrls.map((url, index) => url && (
          <iframe
            key={index}
            id={`youtube-player-${index}`}
            width={isFullscreen ? '100%' : '320'}
            height={isFullscreen ? '100%' : '180'}
            src={`https://www.youtube.com/embed/${url.split('v=')[1]}?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&loop=0&playlist=${url.split('v=')[1]}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: activeRow === index ? 'block' : 'none',
              zIndex: videoStates[index] === 'playing' ? 2 : 1
            }}
          />
        ))}
      </div>
    </div>
  );
};
