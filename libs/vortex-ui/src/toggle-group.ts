// libs/vortex-ui/src/toggle-group.ts
// Closely based on: Shark UI toggle-group (https://shark.vini.one/docs/components/toggle-group,
// @ark-ui/react/toggle-group). Reuses toggleButtonVariants for per-item styling so grouped
// toggles match the standalone ToggleButton.
import { cva, type VariantProps } from 'class-variance-authority';

export const toggleGroupRootVariants = cva('inline-flex items-center gap-1', {
  variants: {
    orientation: { horizontal: 'flex-row', vertical: 'flex-col' },
    attached: { true: 'gap-0 [&>*]:rounded-none', false: '' },
  },
  // `attached` radii/overlap must follow the layout axis: rounded-s/e and -ms are inline-axis,
  // which is wrong for a vertical group. Keep them in orientation-scoped compound variants.
  compoundVariants: [
    {
      orientation: 'horizontal',
      attached: true,
      class: '[&>*:first-child]:rounded-s-md [&>*:last-child]:rounded-e-md [&>*:not(:first-child)]:-ms-px',
    },
    {
      orientation: 'vertical',
      attached: true,
      class: '[&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*:not(:first-child)]:-mt-px',
    },
  ],
  defaultVariants: { orientation: 'horizontal', attached: false },
});

export type ToggleGroupRootVariants = VariantProps<typeof toggleGroupRootVariants>;

export interface ToggleGroupProps {
  orientation?: ToggleGroupRootVariants['orientation'];
  attached?: ToggleGroupRootVariants['attached'];
  className?: string;
}
