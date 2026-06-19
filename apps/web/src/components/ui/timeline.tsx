import * as React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Timeline({ className, children, ...props }: TimelineProps) {
  return (
    <div className={cn('relative border-l border-muted-foreground/20 ml-3 space-y-6', className)} {...props}>
      {children}
    </div>
  );
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  iconClassName?: string;
}

export function TimelineItem({ className, icon, iconClassName, children, ...props }: TimelineItemProps) {
  return (
    <div className={cn('relative pl-6', className)} {...props}>
      <div
        className={cn(
          'absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground',
          iconClassName
        )}
      >
        {icon || <div className="h-2 w-2 rounded-full bg-current" />}
      </div>
      {children}
    </div>
  );
}

export function TimelineContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1', className)} {...props} />;
}

export function TimelineTime({ className, ...props }: React.HTMLAttributes<HTMLTimeElement>) {
  return <time className={cn('text-xs text-muted-foreground font-medium', className)} {...props} />;
}

export function TimelineTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn('text-sm font-semibold leading-none', className)} {...props} />;
}

export function TimelineDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
