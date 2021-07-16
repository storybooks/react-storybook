import global from 'global';

// The shortcut is our JSON-ifiable representation of a shortcut combination
import type { KeyCollection, Event } from '../modules/shortcuts';

const { navigator } = global;

export const isMacLike = () =>
  navigator && navigator.platform ? !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) : false;
export const controlOrMetaSymbol = () => (isMacLike() ? '⌘' : 'ctrl');
export const controlOrMetaKey = () => (isMacLike() ? 'meta' : 'control');
export const optionOrAltSymbol = () => (isMacLike() ? '⌥' : 'alt');

export const isShortcutTaken = (arr1: string[], arr2: string[]): boolean =>
  JSON.stringify(arr1) === JSON.stringify(arr2);

// Map a keyboard event to a keyboard shortcut
// NOTE: if we change the fields on the event that we need, we'll need to update the serialization in core/preview/start.js
export const eventToShortcut = (e: KeyboardEvent): KeyCollection | null => {
  // Meta key only doesn't map to a shortcut
  if (['Meta', 'Alt', 'Control', 'Shift'].includes(e.key)) {
    return null;
  }

  const keys = [];
  if (e.altKey) {
    keys.push('alt');
  }
  if (e.ctrlKey) {
    keys.push('control');
  }
  if (e.metaKey) {
    keys.push('meta');
  }
  if (e.shiftKey) {
    keys.push('shift');
  }

  if (e.key && e.key.length === 1 && e.key !== ' ') {
    keys.push(e.key.toUpperCase());
  }
  if (e.key === ' ') {
    keys.push('space');
  }
  if (e.key === 'Escape') {
    keys.push('escape');
  }
  if (e.key === 'ArrowRight') {
    keys.push('ArrowRight');
  }
  if (e.key === 'ArrowDown') {
    keys.push('ArrowDown');
  }
  if (e.key === 'ArrowUp') {
    keys.push('ArrowUp');
  }
  if (e.key === 'ArrowLeft') {
    keys.push('ArrowLeft');
  }

  return keys.length > 0 ? keys : null;
};

export const shortcutMatchesShortcut = (
  inputShortcut: KeyCollection,
  shortcut: KeyCollection
): boolean => {
  if (!inputShortcut || !shortcut) return false;
  if (inputShortcut.join('') === 'shift/') inputShortcut.shift(); // shift is optional for `/`
  if (inputShortcut.length !== shortcut.length) return false;
  return !inputShortcut.find((key, i) => key !== shortcut[i]);
};

// Should this keyboard event trigger this keyboard shortcut?
export const eventMatchesShortcut = (e: Event, shortcut: KeyCollection): boolean =>
  shortcutMatchesShortcut(eventToShortcut(e), shortcut);

export const keyToSymbol = (key: string): string => {
  if (key === 'alt') {
    return optionOrAltSymbol();
  }
  if (key === 'control') {
    return '⌃';
  }
  if (key === 'meta') {
    return '⌘';
  }
  if (key === 'shift') {
    return '⇧​';
  }
  if (key === 'Enter' || key === 'Backspace' || key === 'Esc') {
    return '';
  }
  if (key === 'escape') {
    return '';
  }
  if (key === ' ') {
    return 'SPACE';
  }
  if (key === 'ArrowUp') {
    return '↑';
  }
  if (key === 'ArrowDown') {
    return '↓';
  }
  if (key === 'ArrowLeft') {
    return '←';
  }
  if (key === 'ArrowRight') {
    return '→';
  }
  return key.toUpperCase();
};

// Display the shortcut as a human readable string
export const shortcutToHumanString = (shortcut: KeyCollection): string =>
  shortcut.map(keyToSymbol).join(' ');
