export type CellState = 'off' | 'play' | 'stop';

export interface DrumCell {
  row: number;
  col: number;
  state: CellState;
}

export interface RowSettings {
  name: string;
  youtubeUrl: string;
  startTime: number;
  endTime: number;
  playbackSpeed: number;
  volume: number;
}

export interface TimeSignature {
  beats: number;
  noteValue: number;
}
