// libs/vortex-ui/src/listbox.ts
// Closely based on: Ark UI listbox (https://ark-ui.com/docs/components/listbox).
//
// `Listbox` is a thin pass-through: it owns the collection, and the CONSUMER renders the
// children from the Listbox parts. Because the consumer renders the items, filtering is the
// consumer's job too — there is deliberately no filterFn/filterQuery seam here, which would
// filter the collection without filtering the children and silently desync the two.
// `defaultListboxFilter` is exported as a convenience predicate for consumers to apply.
export interface ListboxItemData {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Default filter: case-insensitive substring match on the item label. */
export function defaultListboxFilter(item: ListboxItemData, query: string): boolean {
  if (!query) return true;
  return item.label.toLowerCase().includes(query.toLowerCase());
}

export const listboxRootBase = 'flex flex-col gap-1';

export const listboxContentBase =
  'max-h-72 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-sm outline-none';

export const listboxItemBase =
  'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 pe-8 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=checked]:font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

export const listboxItemTextBase = 'flex w-full flex-1 items-center gap-2';

export const listboxItemIndicatorBase = 'absolute inset-y-0 end-2 flex items-center justify-center text-foreground';

export const listboxInputBase =
  'mb-1 w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

export const listboxEmptyBase = 'px-2 py-6 text-center text-sm text-muted-foreground';

export const listboxLabelBase = 'px-2 py-1.5 text-xs font-semibold text-muted-foreground';
