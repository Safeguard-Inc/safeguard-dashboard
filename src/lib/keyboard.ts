/**
 * keyboard.ts
 *
 * OS-aware keyboard shortcut resolution and formatting helpers.
 * Handles symbol/modifier differences across macOS, Windows, and Linux.
 */

export type PlatformType = 'mac' | 'windows' | 'linux' | 'other';

export interface ShortcutConfig {
  key: string;
  ctrlOrMeta?: boolean;
  alt?: boolean;
  shift?: boolean;
}

export function detectPlatform(userAgent?: string): PlatformType {
  const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase();
  if (ua.includes('mac') || ua.includes('darwin')) return 'mac';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux')) return 'linux';
  return 'other';
}

export function formatShortcutDisplay(
  config: ShortcutConfig,
  platform: PlatformType = 'mac'
): { keys: string[]; label: string } {
  const keys: string[] = [];
  const isMac = platform === 'mac';

  if (config.ctrlOrMeta) {
    keys.push(isMac ? '⌘' : 'Ctrl');
  }
  if (config.alt) {
    keys.push(isMac ? '⌥' : 'Alt');
  }
  if (config.shift) {
    keys.push(isMac ? '⇧' : 'Shift');
  }

  // Format main key
  let displayKey = config.key;
  if (config.key.toLowerCase() === 'enter') {
    displayKey = isMac ? '↵' : 'Enter';
  }

  keys.push(displayKey);

  return {
    keys,
    label: keys.join(isMac ? '' : ' + '),
  };
}
