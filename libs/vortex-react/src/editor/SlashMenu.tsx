// libs/vortex-react/src/editor/SlashMenu.tsx
// React parity of SlashMenu.svelte: renders the slash commands through vortex Listbox and
// exposes `onKeyDown` for the suggestion bridge. Keyboard nav mirrors the Svelte version.
import { forwardRef, useImperativeHandle, useState } from 'react';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { Listbox, ListboxContent, ListboxItem, ListboxItemText } from '..';
import type { SlashCommandItem } from '@cloudvoyant/vortex-ui';

export interface SlashMenuHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const SlashMenu = forwardRef<SlashMenuHandle, SuggestionProps<SlashCommandItem>>(function SlashMenu(
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

  const listItems = items.map((item) => ({ value: item.title, label: item.title }));

  return (
    <Listbox items={listItems}>
      <ListboxContent>
        {items.map((item, i) => (
          <ListboxItem
            key={item.title}
            item={{ value: item.title, label: item.title }}
            className={i === index ? 'bg-accent text-accent-foreground' : undefined}
            onMouseEnter={() => setIndex(i)}
            onClick={() => command(item)}
          >
            <ListboxItemText>{item.title}</ListboxItemText>
          </ListboxItem>
        ))}
      </ListboxContent>
    </Listbox>
  );
});
