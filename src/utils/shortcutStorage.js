import { SEED_SHORTCUTS, STARTER_COLLECTIONS } from '../data/seedData';
import { validateShortcutInput } from './shortcutValidation';

export const STORAGE_KEYS = {
  SHORTCUTS: 'keyflow_shortcuts_v1',
  COLLECTIONS: 'keyflow_collections_v1',
  SETTINGS: 'keyflow_settings_v1',
  INITIALIZED: 'keyflow_initialized_v1',
};

export const DEFAULT_SETTINGS = {
  theme: 'light',
  platform: 'windows', // 'windows' | 'mac'
  viewMode: 'grid', // 'grid' | 'list'
  sidebarCollapsed: false,
};

/**
 * Generate a stable, collision-resistant ID with a prefix.
 */
export function generateId(prefix = 'sc') {
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
}

/**
 * Safely parse JSON from localStorage with fallback.
 */
function safeReadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    console.warn(`KeyFlow storage read warning for ${key}:`, err);
    return fallback;
  }
}

/**
 * Safely write JSON to localStorage.
 */
function safeWriteJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`KeyFlow storage write error for ${key}:`, err);
    return false;
  }
}

/**
 * Load initial state from localStorage. Seeds with realistic dataset on first visit.
 */
export function loadInitialState() {
  const isInitialized = window.localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized) {
    const initialShortcuts = SEED_SHORTCUTS.map((s) => ({ ...s, keys: [...s.keys] }));
    const initialCollections = STARTER_COLLECTIONS.map((c) => ({ ...c }));
    const initialSettings = { ...DEFAULT_SETTINGS };

    safeWriteJson(STORAGE_KEYS.SHORTCUTS, initialShortcuts);
    safeWriteJson(STORAGE_KEYS.COLLECTIONS, initialCollections);
    safeWriteJson(STORAGE_KEYS.SETTINGS, initialSettings);
    window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    return {
      shortcuts: initialShortcuts,
      collections: initialCollections,
      settings: initialSettings,
    };
  }

  const storedShortcuts = safeReadJson(STORAGE_KEYS.SHORTCUTS, []);
  const storedCollections = safeReadJson(STORAGE_KEYS.COLLECTIONS, STARTER_COLLECTIONS);
  const storedSettings = safeReadJson(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  return {
    shortcuts: Array.isArray(storedShortcuts) ? storedShortcuts : [],
    collections: Array.isArray(storedCollections) ? storedCollections : [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(storedSettings && typeof storedSettings === 'object' ? storedSettings : {}),
    },
  };
}

export function saveShortcuts(shortcuts) {
  return safeWriteJson(STORAGE_KEYS.SHORTCUTS, shortcuts);
}

export function saveCollections(collections) {
  return safeWriteJson(STORAGE_KEYS.COLLECTIONS, collections);
}

export function saveSettings(settings) {
  return safeWriteJson(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Restore the verified seed dataset and starter collections.
 * Preserves user theme/platform settings.
 */
export function restoreSampleDataset() {
  const freshShortcuts = SEED_SHORTCUTS.map((s) => ({
    ...s,
    keys: [...s.keys],
    macKeys: s.macKeys ? [...s.macKeys] : [...s.keys],
    collections: s.collections ? [...s.collections] : [],
    tags: s.tags ? [...s.tags] : [],
  }));
  const freshCollections = STARTER_COLLECTIONS.map((c) => ({ ...c }));

  safeWriteJson(STORAGE_KEYS.SHORTCUTS, freshShortcuts);
  safeWriteJson(STORAGE_KEYS.COLLECTIONS, freshCollections);
  window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

  return {
    shortcuts: freshShortcuts,
    collections: freshCollections,
  };
}

/**
 * Clear all shortcuts and custom collections from localStorage.
 * Keeps starter collections empty or resets to an empty workspace as expected by "Clear all data".
 */
export function clearAllStoredData() {
  const emptyShortcuts = [];
  const baseCollections = STARTER_COLLECTIONS.map((c) => ({ ...c }));

  safeWriteJson(STORAGE_KEYS.SHORTCUTS, emptyShortcuts);
  safeWriteJson(STORAGE_KEYS.COLLECTIONS, baseCollections);
  window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

  return {
    shortcuts: emptyShortcuts,
    collections: baseCollections,
  };
}

/**
 * Create a new validated shortcut object ready for storage.
 */
export function createShortcutRecord(formData) {
  const validation = validateShortcutInput(formData);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid shortcut data');
  }

  return {
    id: generateId('sc'),
    ...validation.normalizedData,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
}
