import { DrumCell } from '../types/types';
import { getThumbnailUrl } from '../utils/youtube';
import Image from 'next/image';

interface DrumGridProps {
  cells: DrumCell[];
  onCellClick: (row: number, col: number) => void;
  currentStep: number;
  onSettingsClick: (row: number) => void;
  rowNames: string[];
  rowUrls: string[];
}

export const DrumGrid = ({ cells, onCellClick, currentStep, onSettingsClick, rowNames, rowUrls }: DrumGridProps) => {
  const getCellState = (row: number, col: number) => {
    const cell = cells.find(c => c.row === row && c.col === col);
    return cell?.state || 'off';
  };

  const getCellStyle = (row: number, col: number) => {
    const state = getCellState(row, col);
    const isCurrentStep = col === currentStep;
    const isQuarterNote = col % 2 === 0;

    let bgColor;
    if (state === 'play') {
      bgColor = isCurrentStep ? 'bg-blue-400' : 'bg-blue-500';
    } else if (state === 'stop') {
      bgColor = isCurrentStep ? 'bg-orange-400' : 'bg-orange-500';
    } else {
      bgColor = isQuarterNote ? isCurrentStep ? 'bg-gray-500' : 'bg-gray-600' : 'bg-gray-700';
    }

    return bgColor;
  };

  return (
    <div className="flex flex-col" style={{ gap: '8px' }}>
      {Array.from({ length: 8 }, (_, row) => (
        <div key={row} className="flex items-center" style={{ gap: '8px' }}>
          <button
            onClick={() => onSettingsClick(row)}
            className="flex-shrink-0 w-32 h-16 bg-indigo-800 rounded text-white text-sm hover:bg-indigo-700 transition-colors overflow-hidden relative"
          >
            {rowUrls[row] ? (
              <>
                <Image
                  src={getThumbnailUrl(rowUrls[row]) || ''}
                  alt={rowNames[row]}
                  width={120}
                  height={68}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-white text-xs px-2 truncate max-w-full">
                    {rowNames[row]}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-white text-xs px-2 truncate max-w-full">
                {rowNames[row]}
              </span>
            )}
          </button>
          <div className="grid" style={{
            gridTemplateColumns: 'repeat(16, 1fr)',
            gap: '8px'
          }}>
            {Array.from({ length: 16 }, (_, col) => (
              <button
                key={col}
                onClick={() => onCellClick(row, col)}
                className={`aspect-square w-16 rounded hover:opacity-75 transition-colors ${getCellStyle(row, col)}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
