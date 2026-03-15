import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  accentColor?: 'blue' | 'green' | 'purple' | 'orange';
}

/**
 * Metric Card Component
 * Design: SaaS professional metric display
 * - White background with subtle 0.5px border
 * - 3px left border accent in specified color
 * - Large value (24px, 500 weight)
 * - Subtle subtitle text
 * - Optional trend indicator
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'blue',
}: MetricCardProps) {
  const accentColors = {
    blue: 'border-l-blue-500 bg-blue-50/30',
    green: 'border-l-green-500 bg-green-50/30',
    purple: 'border-l-purple-500 bg-purple-50/30',
    orange: 'border-l-orange-500 bg-orange-50/30',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
  };

  return (
    <div
      className={`bg-white border border-border rounded-lg p-6 ${accentColors[accentColor]} border-l-3 transition-all duration-200 hover:shadow-md hover:border-border`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        </div>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>

      {/* Value */}
      <div className="mb-4">
        <p className="text-3xl font-semibold text-foreground">{value}</p>
      </div>

      {/* Subtitle & Trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <div className={`text-sm font-medium ${trendColors[trend.direction]}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}
