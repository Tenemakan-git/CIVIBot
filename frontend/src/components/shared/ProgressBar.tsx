interface Props {
  value: number;
  showLabel?: boolean;
  className?: string;
}

/** Barre de progression cohérente (ambre < 50 %, bleu < 100 %, vert à 100 %). */
export default function ProgressBar({ value, showLabel = false, className = '' }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const color = pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-orange-500' : 'bg-amber-500';
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 tabular-nums w-9 text-right">{pct}%</span>
      )}
    </div>
  );
}
