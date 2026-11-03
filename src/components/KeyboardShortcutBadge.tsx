'use client';

import React, { useEffect, useState } from 'react';
import {
  detectPlatform,
  formatShortcutDisplay,
  type ShortcutConfig,
  type PlatformType,
} from '../lib/keyboard';

interface KeyboardShortcutBadgeProps {
  shortcut: ShortcutConfig;
  className?: string;
  description?: string;
}

export const KeyboardShortcutBadge: React.FC<KeyboardShortcutBadgeProps> = ({
  shortcut,
  className = '',
  description,
}) => {
  const [platform, setPlatform] = useState<PlatformType>('mac');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const formatted = formatShortcutDisplay(shortcut, platform);

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 shadow-inner select-none ${className}`}
      title={description || `Shortcut: ${formatted.label}`}
    >
      {formatted.keys.map((k, i) => (
        <kbd
          key={i}
          className="px-1 py-0.5 bg-slate-700/60 text-slate-300 rounded font-semibold text-[10px]"
        >
          {k}
        </kbd>
      ))}
      {description && <span className="ml-1 text-slate-400 font-sans">{description}</span>}
    </span>
  );
};
