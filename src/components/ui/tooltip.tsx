import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  arrowPosition?: 'left' | 'center' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  autoHide?: boolean;
}

export function Tooltip({
  content,
  position = 'bottom',
  arrowPosition = 'center',
  delay = 1000,
  duration = 5000,
  className,
  autoHide = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), delay);

    let hideTimer: NodeJS.Timeout;
    if (autoHide) {
      hideTimer = setTimeout(() => setIsVisible(false), delay + duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [delay, duration, autoHide]);

  const tooltipStyles = {
    top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2',
    bottom: 'absolute',
    left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 translate-x-2 ml-2',
  };

  const getArrowPosition = (
    pos: string,
    arrowPos: 'left' | 'center' | 'right',
  ): string => {
    if (pos === 'bottom' || pos === 'top') {
      const positions = {
        left: 'left-4',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-4',
      };
      return positions[arrowPos];
    }
    return '';
  };

  const arrowStyles = {
    top: `bottom-[-8px] ${getArrowPosition(position, arrowPosition)} border-t-card border-t-8 border-x-8 border-x-transparent`,
    bottom: `top-[-8px] ${getArrowPosition(position, arrowPosition)} border-b-card border-b-8 border-x-8 border-x-transparent`,
    left: 'right-[-8px] top-1/2 -translate-y-1/2 border-l-card border-l-8 border-y-8 border-y-transparent',
    right:
      'left-[-8px] top-1/2 -translate-y-1/2 border-r-card border-r-8 border-y-8 border-y-transparent',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            'absolute w-max max-w-[200px] rounded-lg bg-card p-3 text-sm shadow-lg',
            tooltipStyles[position],
            className,
          )}
        >
          {content}
          <div className={cn('absolute h-0 w-0', arrowStyles[position])} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
