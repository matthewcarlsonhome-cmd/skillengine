// Keyboard Shortcuts Hook - Power user navigation

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: ShortcutHandler[] = [
    // Navigation shortcuts (use 'g' prefix like vim/GitHub)
    { key: 'd', ctrl: false, shift: false, alt: true, action: () => navigate('/dashboard'), description: 'Go to Dashboard' },
    { key: 's', ctrl: false, shift: false, alt: true, action: () => navigate('/skills'), description: 'Go to Skills' },
    { key: 'r', ctrl: false, shift: false, alt: true, action: () => navigate('/role-templates'), description: 'Go to Role Templates' },
    { key: 'a', ctrl: false, shift: false, alt: true, action: () => navigate('/analyze'), description: 'Go to Analyze' },
    { key: 'c', ctrl: false, shift: false, alt: true, action: () => navigate('/community'), description: 'Go to Community' },
    { key: 'b', ctrl: false, shift: false, alt: true, action: () => navigate('/batch'), description: 'Go to Batch Processing' },
    { key: ',', ctrl: false, shift: false, alt: true, action: () => navigate('/settings'), description: 'Go to Settings' },
    { key: 'h', ctrl: false, shift: false, alt: true, action: () => navigate('/'), description: 'Go to Home' },

    // Quick actions
    { key: '/', ctrl: true, shift: false, alt: false, action: () => focusSearch(), description: 'Focus search' },
    { key: 'k', ctrl: true, shift: false, alt: false, action: () => openCommandPalette(), description: 'Open command palette' },
  ];

  const focusSearch = () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  };

  const openCommandPalette = () => {
    // Dispatch custom event for command palette (can be implemented later)
    window.dispatchEvent(new CustomEvent('openCommandPalette'));
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Only allow Escape in inputs
      if (event.key === 'Escape') {
        target.blur();
      }
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch
      ) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

// Hook to show keyboard shortcut hints
export function useShortcutHint(shortcut: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const parts: string[] = [];
  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}

export default useKeyboardShortcuts;
