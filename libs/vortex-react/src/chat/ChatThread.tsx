// libs/vortex-react/src/chat/ChatThread.tsx
// Composed for vortex-ui on @cloudvoyant/vortex-react Scroll; no upstream chat primitive.
import { useRef, type ReactNode, type UIEvent } from 'react';
import { Scroll } from '../scroll';
import { chatThreadBase, chatThreadContentBase, cn } from '@cloudvoyant/vortex-ui';

export interface ChatThreadProps {
  className?: string;
  contentClassName?: string;
  onScrollTop?: () => void;
  children?: ReactNode;
}

export function ChatThread({ className, contentClassName, onScrollTop, children }: ChatThreadProps) {
  const firedRef = useRef(false);
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop <= 8) {
      if (!firedRef.current) {
        firedRef.current = true;
        onScrollTop?.();
      }
    } else {
      firedRef.current = false;
    }
  };
  return (
    <Scroll
      className={cn(chatThreadBase, className)}
      viewportClassName="flex h-full w-full flex-col"
      onScroll={onScrollTop ? handleScroll : undefined}
    >
      <div className={cn(chatThreadContentBase, contentClassName)} data-thread-content>
        {children}
      </div>
    </Scroll>
  );
}
