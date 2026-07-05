import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export function ProgressRing({
  value, size = 120, strokeWidth = 8, label, sublabel, color = "#6366f1",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{Math.round(value)}%</span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  label?: string;
  color?: string;
  showValue?: boolean;
}

export function ProgressBar({ value, label, color = "bg-indigo-600", showValue = true }: ProgressBarProps) {
  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-slate-600">{label}</span>}
          {showValue && <span className="font-medium text-slate-900">{Math.round(value)}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
