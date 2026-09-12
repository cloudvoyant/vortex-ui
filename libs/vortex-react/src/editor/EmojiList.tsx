// libs/vortex-react/src/editor/EmojiList.tsx
// React parity of EmojiList.svelte: the `:` emoji suggestion menu. Without this the Emoji
// extension has no suggestion render, so typing ':' silently does nothing.
import { forwardRef, useImperativeHandle, useState } from 'react';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { Listbox, ListboxContent, ListboxItem, ListboxItemText } from '..';
import type { EmojiItem } from '@cloudvoyant/vortex-ui';

export interface EmojiListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const EmojiList = forwardRef<EmojiListHandle, SuggestionProps<EmojiItem>>(function EmojiList(
  { items, command },
  ref,
) {
  const [index, setIndex] = useState(0);

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

  if (items.length === 0) return null;

  const listItems = items.map((item) => ({ value: item.name, label: `${item.emoji} ${item.name}` }));

  return (
    <Listbox items={listItems} className="emoji-list">
      <ListboxContent>
        {items.map((item, i) => (
          <ListboxItem
            key={item.name}
            item={{ value: item.name, label: `${item.emoji} ${item.name}` }}
            className={i === index ? 'bg-accent text-accent-foreground' : undefined}
            onMouseEnter={() => setIndex(i)}
            onClick={() => command(item)}
          >
            <ListboxItemText>
              <span className="mr-2">{item.emoji}</span>
              {item.name}
            </ListboxItemText>
          </ListboxItem>
        ))}
      </ListboxContent>
    </Listbox>
  );
});
