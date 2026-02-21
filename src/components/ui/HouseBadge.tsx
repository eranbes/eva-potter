'use client';

import { useTranslation } from '@/components/providers/LanguageProvider';

const houseColors: Record<string, { bg: string; text: string; border: string }> = {
  gryffindor: { bg: 'bg-red-700/80', text: 'text-yellow-300', border: 'border-yellow-500/40' },
  slytherin: { bg: 'bg-emerald-800/80', text: 'text-slate-200', border: 'border-slate-400/40' },
  ravenclaw: { bg: 'bg-blue-800/80', text: 'text-amber-300', border: 'border-amber-400/40' },
  hufflepuff: { bg: 'bg-yellow-600/80', text: 'text-slate-900', border: 'border-slate-800/40' },
};

interface HouseBadgeProps {
  house: string;
  size?: 'sm' | 'md';
}

export default function HouseBadge({ house, size = 'sm' }: HouseBadgeProps) {
  const { t } = useTranslation();
  const colors = houseColors[house] || houseColors.gryffindor;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const houseKey = `sorting.${house}` as const;
  const label = t(houseKey);

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
