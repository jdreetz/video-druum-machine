export const formatTime = (seconds: number): string => {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '00:00.00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export const parseTime = (timeStr: string): number => {
  // Validate format: mm:ss.ms
  const isValidFormat = /^\d{1,2}:\d{2}(\.\d{0,2})?$/.test(timeStr);
  if (!isValidFormat) return 0;

  try {
    const [minsec, ms = '0'] = timeStr.split('.');
    const [mins, secs] = minsec.split(':').map(Number);
    
    // Validate ranges
    if (mins < 0 || secs < 0 || secs >= 60) return 0;
    
    return mins * 60 + secs + Number(ms.padEnd(2, '0')) / 100;
  } catch {
    return 0;
  }
};
