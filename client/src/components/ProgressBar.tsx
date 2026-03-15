/**
 * Progress Bar Component
 * Design: SaaS professional progress indicator
 * - Subtle background
 * - Blue accent fill (#378ADD)
 * - Smooth animation
 * - Percentage label
 */

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  label,
  showLabel = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${clampedValue}%` }}
          ></div>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-foreground min-w-fit">
          {label || `${clampedValue}%`}
        </span>
      )}
    </div>
  );
}
