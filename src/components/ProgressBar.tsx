interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-base font-medium text-text-secondary">
          进度 {current}/{total}
        </span>
        <span className="text-base font-bold text-sunshine-dark">{percent}%</span>
      </div>
      <div className="w-full h-3.5 rounded-full bg-text-muted/20 overflow-hidden">
        <div
          className="h-full rounded-full gradient-sunshine transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
