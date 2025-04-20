import { ChangeEvent, useEffect, useState } from 'react';
import { RowSettings as RowSettingsType } from '../types/types';
import { VideoPreview } from './VideoPreview';
import { formatTime, parseTime } from '../utils/time';
import { isValidYoutubeUrl, extractVideoId, getVideoDuration } from '../utils/youtube';
import { useDebounce } from '../hooks/useDebounce';

interface RowSettingsProps {
  settings: RowSettingsType;
  onUpdate: (updates: Partial<RowSettingsType>) => void;
  urlError?: string;
}

export const RowSettings = ({ settings, onUpdate, urlError }: RowSettingsProps) => {
  const [timeError, setTimeError] = useState<string>();
  const [localStartTime, setLocalStartTime] = useState(settings.startTime);
  const [localEndTime, setLocalEndTime] = useState(settings.endTime);

  // Update local state when props change
  useEffect(() => {
    setLocalStartTime(settings.startTime);
    setLocalEndTime(settings.endTime);
  }, [settings.startTime, settings.endTime]);

  const debouncedUpdate = useDebounce((updates: Partial<RowSettingsType>) => {
    onUpdate(updates);
  }, 300);

  useEffect(() => {
    const fetchDuration = async () => {
      if (settings.youtubeUrl && !settings.endTime) {
        const duration = await getVideoDuration(settings.youtubeUrl);
        if (duration) {
          onUpdate({ endTime: duration });
        }
      }
    };

    fetchDuration();
  }, [settings.youtubeUrl, settings.endTime, onUpdate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'startTime' || name === 'endTime') {
      // Validate time format
      const isValidFormat = /^\d{1,2}:\d{2}(\.\d{0,2})?$/.test(value);
      if (!isValidFormat && value !== '') {
        setTimeError('Use format: mm:ss.ms (e.g. 01:30.50)');
        return;
      }
      setTimeError(undefined);
      
      const timeInSeconds = parseTime(value);
      
      if (name === 'startTime') {
        if (timeInSeconds >= localEndTime) {
          setTimeError('Start time must be before end time');
          return;
        }
        setLocalStartTime(timeInSeconds);
        debouncedUpdate({ startTime: timeInSeconds });
      } else {
        if (timeInSeconds <= localStartTime) {
          setTimeError('End time must be after start time');
          return;
        }
        setLocalEndTime(timeInSeconds);
        debouncedUpdate({ endTime: timeInSeconds });
      }
    } else if (type === 'number') {
      onUpdate({
        [name]: parseFloat(value)
      });
    } else {
      onUpdate({
        [name]: value
      });
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div>
            <label className="block text-white text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          </div>
          <div className="mt-4">
            <label className="block text-white text-sm mb-1">YouTube URL</label>
            <input
              type="text"
              name="youtubeUrl"
              value={settings.youtubeUrl}
              onChange={handleInputChange}
              className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${
                urlError ? 'border border-red-500' : ''
              }`}
            />
            {urlError && <p className="mt-1 text-sm text-red-500">{urlError}</p>}
          </div>
        </div>
        <div>
          {settings.youtubeUrl && isValidYoutubeUrl(settings.youtubeUrl) && (
            <VideoPreview 
              videoId={extractVideoId(settings.youtubeUrl) || ''} 
              startTime={settings.startTime}
              endTime={settings.endTime}
              playbackSpeed={settings.playbackSpeed}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm mb-1">Start Time</label>
          <input
            type="text"
            name="startTime"
            value={formatTime(localStartTime)}
            onChange={handleInputChange}
            className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${
              timeError ? 'border border-red-500' : ''
            }`}
            placeholder="00:00.00"
          />
        </div>
        <div>
          <label className="block text-white text-sm mb-1">End Time</label>
          <input
            type="text"
            name="endTime"
            value={formatTime(localEndTime)}
            onChange={handleInputChange}
            className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${
              timeError ? 'border border-red-500' : ''
            }`}
            placeholder="00:00.00"
          />
        </div>
        {timeError && (
          <div className="col-span-2">
            <p className="mt-1 text-sm text-red-500">{timeError}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm mb-1">Playback Speed</label>
          <input
            type="number"
            name="playbackSpeed"
            value={settings.playbackSpeed}
            onChange={handleInputChange}
            min={0.1}
            max={2}
            step={0.1}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-white text-sm mb-1">Volume</label>
          <input
            type="number"
            name="volume"
            value={settings.volume}
            onChange={handleInputChange}
            min={0}
            max={1}
            step={0.1}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
};
