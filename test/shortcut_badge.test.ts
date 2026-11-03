import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectPlatform,
  formatShortcutDisplay,
  type ShortcutConfig,
} from '../src/lib/keyboard.ts';

describe('Safeguard Dashboard Keyboard Shortcut Tests', () => {
  it('detects operating system platform from user agent strings', () => {
    assert.equal(
      detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
      'mac'
    );
    assert.equal(
      detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
      'windows'
    );
    assert.equal(
      detectPlatform('Mozilla/5.0 (X11; Linux x86_64)'),
      'linux'
    );
    assert.equal(detectPlatform('UnknownDevice/1.0'), 'other');
  });

  it('formats shortcuts for macOS with Apple modifier symbols and compact string', () => {
    const config: ShortcutConfig = {
      key: 'Enter',
      ctrlOrMeta: true,
      shift: true,
    };

    const formatted = formatShortcutDisplay(config, 'mac');
    assert.deepEqual(formatted.keys, ['⌘', '⇧', '↵']);
    assert.equal(formatted.label, '⌘⇧↵');
  });

  it('formats shortcuts for Windows with Ctrl/Shift/Enter and plus separator', () => {
    const config: ShortcutConfig = {
      key: 'Enter',
      ctrlOrMeta: true,
    };

    const formatted = formatShortcutDisplay(config, 'windows');
    assert.deepEqual(formatted.keys, ['Ctrl', 'Enter']);
    assert.equal(formatted.label, 'Ctrl + Enter');
  });

  it('handles multi-modifier combination on Linux', () => {
    const config: ShortcutConfig = {
      key: 'k',
      ctrlOrMeta: true,
      alt: true,
    };

    const formatted = formatShortcutDisplay(config, 'linux');
    assert.deepEqual(formatted.keys, ['Ctrl', 'Alt', 'k']);
    assert.equal(formatted.label, 'Ctrl + Alt + k');
  });
});
