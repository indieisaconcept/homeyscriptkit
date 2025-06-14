declare module 'ink-ui' {
  import { ComponentType } from 'react';

  interface BadgeProps {
    color?: string;
    children: React.ReactNode;
  }

  export const Badge: ComponentType<BadgeProps>;
}
