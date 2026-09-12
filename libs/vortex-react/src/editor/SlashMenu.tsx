// libs/vortex-react/src/editor/SlashMenu.tsx
// React parity of SlashMenu.svelte: renders the slash commands through vortex Listbox and
// exposes `onKeyDown` for the suggestion bridge. Keyboard nav mirrors the Svelte version.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { Listbox, ListboxContent, ListboxItem, ListboxItemText } from '..';
import type { SlashCommandItem } from '@cloudvoyant/vortex-ui';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SlashMenuHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const SlashMenu = forwardRef<SlashMenuHandle, SuggestionProps<SlashCommandItem>>(function SlashMenu(
  { items, command },
  ref,
) {
  const [index, setIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // A new query supplies a new item set, so selection starts at its first command rather than
  // retaining an out-of-range index from the previous result set.
  useEffect(() => setIndex(0), [items]);
  useEffect(() => {
    itemRefs.current[index]?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setIndex((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        const item = items[index];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  const listItems = items.map((item) => ({ value: item.title, label: item.title }));

  return (
    <Listbox items={listItems}>
      <ListboxContent>
        {items.map((item, i) => {
          const Icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[item.icon];
          return (
            <ListboxItem
              key={item.title}
              item={{ value: item.title, label: item.title }}
              className={i === index ? 'bg-accent text-accent-foreground' : undefined}
              onMouseEnter={() => setIndex(i)}
              onClick={() => command(item)}
            >
              <ListboxItemText>
                <span
                  ref={(node) => {
                    itemRefs.current[i] = node;
                  }}
                  className="inline-flex w-5 justify-center opacity-70"
                  aria-hidden="true"
                >
                  {Icon ? <Icon className="size-4" /> : null}
                </span>
                <span>{item.title}</span>
              </ListboxItemText>
            </ListboxItem>
          );
        })}
      </ListboxContent>
    </Listbox>
  );
});
