'use client';

import { useState, useEffect, useCallback } from 'react';
import { DrumCell, RowSettings as RowSettingsType, TimeSignature } from '../types/types';
import { Modal } from '../components/Modal';
import { DrumGrid } from '../components/DrumGrid';
import { ControlBar } from '../components/ControlBar';
import { RowSettings } from '../components/RowSettings';
import { FloatingVideoPlayer } from '../components/FloatingVideoPlayer';
import { isValidYoutubeUrl } from '../utils/youtube';

interface StoredData {
  rowSettings: RowSettingsType[];
  cells: DrumCell[];
  bpm: number;
  swing: number;
  timeSignature: TimeSignature;
}

const STORAGE_KEY = 'video-druum-machine-state';

const defaultRowSettings: RowSettingsType[] = Array(8).fill(null).map(() => ({
  name: 'Untitled',
  youtubeUrl: '',
  startTime: 0,
  endTime: 0,
  playbackSpeed: 1,
  volume: 1
}));

const defaultState = {
  rowSettings: defaultRowSettings,
  cells: [] as DrumCell[],
  bpm: 120,
  swing: 0,
  timeSignature: { beats: 4, noteValue: 4 } as TimeSignature,
  isPlaying: false,
  currentStep: 0,
  modalOpen: false,
  editingRow: null as number | null,
  urlError: undefined as string | undefined
};

export default function Home() {
  const [cells, setCells] = useState<DrumCell[]>(defaultState.cells);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(defaultState.bpm);
  const [swing, setSwing] = useState(defaultState.swing);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(defaultState.timeSignature);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [urlError, setUrlError] = useState<string>();
  const [rowSettings, setRowSettings] = useState<RowSettingsType[]>(defaultState.rowSettings);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const {
          rowSettings: storedSettings,
          cells: storedCells,
          bpm: storedBpm,
          swing: storedSwing,
          timeSignature: storedTimeSignature
        } = JSON.parse(storedData) as StoredData;
        
        setRowSettings(storedSettings);
        setCells(storedCells);
        setBpm(storedBpm);
        setSwing(storedSwing);
        setTimeSignature(storedTimeSignature);
      } catch (error) {
        console.error('Error loading stored data:', error);
        // If there's an error, reset to defaults
        const { rowSettings, cells, bpm, swing, timeSignature } = defaultState;
        setRowSettings(rowSettings);
        setCells(cells);
        setBpm(bpm);
        setSwing(swing);
        setTimeSignature(timeSignature);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToStore: StoredData = {
      rowSettings,
      cells,
      bpm,
      swing,
      timeSignature
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [rowSettings, cells, bpm, swing, timeSignature]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setCells((prevCells) => {
      const existingCell = prevCells.find((c) => c.row === row && c.col === col);
      const newCells = prevCells.filter((c) => c.row !== row || c.col !== col);

      if (existingCell) {
        // Cycle through states: off -> play -> stop -> off
        if (existingCell.state === 'play') {
          return [...newCells, { row, col, state: 'stop' }];
        } else if (existingCell.state === 'stop') {
          return newCells; // Remove cell to go to 'off' state
        }
      }
      // If no cell or cell was 'off', add new 'play' cell
      return [...newCells, { row, col, state: 'play' }];
    });
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setActiveRow(null);
    
    // Pause all videos
    rowSettings.forEach((settings, index) => {
      if (settings.youtubeUrl) {
        const player = document.getElementById(`youtube-player-${index}`) as HTMLIFrameElement;
        if (player?.contentWindow) {
          player.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'pauseVideo',
            args: []
          }), '*');
        }
      }
    });
  }, [rowSettings]);

  const openRowSettings = useCallback((row: number) => {
    setEditingRow(row);
    setModalOpen(true);
  }, []);

  const closeRowSettings = useCallback(() => {
    setEditingRow(null);
    setModalOpen(false);
    setUrlError(undefined);
  }, []);

  const updateRowSettings = useCallback((row: number, updates: Partial<RowSettingsType>) => {
    setRowSettings((prev) => {
      const newSettings = [...prev];
      newSettings[row] = { ...newSettings[row], ...updates };

      if (updates.youtubeUrl !== undefined) {
        if (updates.youtubeUrl && !isValidYoutubeUrl(updates.youtubeUrl)) {
          setUrlError('Please enter a valid YouTube URL');
        } else {
          setUrlError(undefined);
        }
      }

      return newSettings;
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % 16;
        
        // Find all cells for this step
        const stepCells = cells.filter((cell) => cell.col === next);
        
        // Set active row to the last one with a play state
        const lastPlayCell = [...stepCells].reverse().find(cell => cell.state === 'play');
        if (lastPlayCell) {
          setActiveRow(lastPlayCell.row);
        }

        // Handle each cell's action
        stepCells.forEach((cell) => {
          const player = document.getElementById(`youtube-player-${cell.row}`) as HTMLIFrameElement;
          if (!player?.contentWindow) return;

          if (cell.state === 'play') {
            const settings = rowSettings[cell.row];
            // Start video
            player.contentWindow.postMessage(
              JSON.stringify({
                event: 'command',
                func: 'playVideo',
                args: [],
              }),
              '*'
            );
            // Reset to start time
            setTimeout(() => {
              if (player.contentWindow) {
                player.contentWindow.postMessage(
                  JSON.stringify({
                    event: 'command',
                    func: 'seekTo',
                    args: [settings.startTime],
                  }),
                  '*'
                );
              }
            }, 100);
          } else if (cell.state === 'stop') {
            if (player.contentWindow) {
              player.contentWindow.postMessage(
                JSON.stringify({
                  event: 'command',
                  func: 'stopVideo',
                  args: [],
                }),
                '*'
              );
            }
          }
        });

        return next;
      });
    }, (60 / bpm) * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, cells, bpm, rowSettings]);

  return (
    <main className="min-h-screen bg-gray-900 p-8 pb-32">
      <h1 className="text-white text-2xl mb-8">Video Druum Machine</h1>
      
      <FloatingVideoPlayer rowUrls={rowSettings.map(s => s.youtubeUrl)} activeRow={activeRow} />
      
      <DrumGrid
        cells={cells}
        onCellClick={handleCellClick}
        currentStep={currentStep}
        onSettingsClick={openRowSettings}
        rowNames={rowSettings.map(s => s.name)}
        rowUrls={rowSettings.map(s => s.youtubeUrl)}
      />

      <ControlBar
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        bpm={bpm}
        onBpmChange={setBpm}
        swing={swing}
        onSwingChange={setSwing}
        timeSignature={timeSignature}
        onTimeSignatureChange={setTimeSignature}
        currentStep={currentStep}
        totalSteps={16}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={closeRowSettings}
        title={editingRow !== null ? `Row ${editingRow + 1}` : 'Row Settings'}
        subtitle={editingRow !== null ? rowSettings[editingRow].name || 'Untitled' : undefined}
      >
        {editingRow !== null && (
          <RowSettings
            settings={rowSettings[editingRow]}
            onUpdate={(updates) => updateRowSettings(editingRow, updates)}
            urlError={urlError}
          />
        )}
      </Modal>
    </main>
  );
}
