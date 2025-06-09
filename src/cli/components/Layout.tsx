import { Box } from 'ink';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <Box paddingY={1}>{children}</Box>;
}
