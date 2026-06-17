import React from 'react';
import { cn } from '@/lib/utils';

interface TagBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  color?: string; // HEX Code
  onRemove?: () => void;
}

export function TagBadge({ name, color = '#E2E8F0', onRemove, className, ...props }: TagBadgeProps) {
  // Lógica simplificada para decidir se o texto deve ser claro ou escuro baseado no background HEX
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  const textColor = (yiq >= 128) ? '#000000' : '#FFFFFF';

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 mb-2",
        className
      )}
      style={{ backgroundColor: color, color: textColor }}
      {...props}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full hover:bg-black/20 focus:bg-black/20 focus:outline-none"
        >
          <span className="sr-only">Remover {name}</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
}
