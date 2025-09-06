'use client';

import { SessionProvider } from 'next-auth/react';
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';

const Provider = ({ children, session }) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        themes={['light', 'dark']}
        enableSystem
      >
        <HeroUIProvider>{children}</HeroUIProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Provider;
