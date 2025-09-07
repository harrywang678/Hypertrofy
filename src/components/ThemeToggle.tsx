'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';

export default function HeroUIThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button isIconOnly variant="ghost" size="sm" isDisabled>
        🌙
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="text-foreground transition-colors"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}