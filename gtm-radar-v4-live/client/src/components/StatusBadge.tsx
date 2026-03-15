/**
 * Status Badge Component
 * Design: SaaS professional status indicators
 * - Color-coded backgrounds
 * - Subtle borders
 * - Lowercase text (no military caps)
 * - Consistent sizing
 */

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'high-potential' | 'no-data' | 'gold' | 'silver' | 'diamond';
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-500',
    },
    pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500',
    },
    completed: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    'high-potential': {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
    },
    'no-data': {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      dot: 'bg-gray-400',
    },
    gold: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    silver: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-500',
    },
    diamond: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      dot: 'bg-cyan-500',
    },
  };

  const config = statusConfig[status];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {displayLabel}
    </span>
  );
}
