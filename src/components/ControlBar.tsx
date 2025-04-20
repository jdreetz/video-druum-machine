import { TimeSignature } from '../types/types';
import { useState, useCallback, useEffect } from 'react';

interface ControlBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  swing: number;
  onSwingChange: (swing: number) => void;
  timeSignature: TimeSignature;
  onTimeSignatureChange: (timeSignature: TimeSignature) => void;
  currentStep: number;
  totalSteps: number;
}

export const ControlBar = ({
  isPlaying,
  onPlayPause,
  onStop,
  bpm,
  onBpmChange,
  swing,
  onSwingChange,
  timeSignature,
  onTimeSignatureChange,
  currentStep,
  totalSteps,
}: ControlBarProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-white">BPM:</label>
            <input
              type="number"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              className="w-16 bg-gray-700 text-white rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-white">Swing:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={swing}
              onChange={(e) => onSwingChange(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-white">{swing}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-white">Time:</label>
            <select
              value={`${timeSignature.beats}/${timeSignature.noteValue}`}
              onChange={(e) => {
                const [beats, noteValue] = e.target.value.split('/').map(Number);
                onTimeSignatureChange({ beats, noteValue });
              }}
              className="bg-gray-700 text-white rounded px-2 py-1"
            >
              <option value="3/4">3/4</option>
              <option value="4/4">4/4</option>
              <option value="6/8">6/8</option>
              <option value="7/8">7/8</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onStop}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center"
          >
            ■
          </button>
          <button
            onClick={onPlayPause}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <div className="text-white">
            Step: {currentStep + 1}/{totalSteps}
          </div>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-4xl"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '⤧' : '⤨'}
          </button>
        </div>
      </div>
    </div>
  );
};
