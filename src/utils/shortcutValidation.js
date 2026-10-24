/**
 * Key normalization, form validation, duplicate detection, and OS modifier formatting utilities.
 */

const MODIFIER_ORDER = ['Ctrl', 'Cmd', 'Win', 'Alt', 'Shift'];

const KEY_ALIASES = {
  control: 'Ctrl',
  ctrl: 'Ctrl',
  command: 'Cmd',
  cmd: 'Cmd',
  meta: 'Win',
  win: 'Win',
  windows: 'Win',
  super: 'Win',
  alt: 'Alt',
  option: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
  escape: 'Esc',
  esc: 'Esc',
  ' ': 'Space',
  spacebar: 'Space',
  space: 'Space',
  arrowup: 'Up',
  arrowdown: 'Down',
  arrowleft: 'Left',
  arrowright: 'Right',
  enter: 'Enter',
  return: 'Enter',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  tab: 'Tab',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  home: 'Home',
  end: 'End',
  insert: 'Insert',
  capslock: 'CapsLock',
  plus: '+',
};

const BROWSER_RESERVED_COMBOS = new Set([
  'Ctrl+W',
  'Ctrl+Shift+W',
  'Ctrl+N',
  'Ctrl+Shift+N',
  'Ctrl+T',
  'Ctrl+Shift+T',
  'Ctrl+Tab',
  'Ctrl+Shift+Tab',
  'Alt+F4',
  'Cmd+W',
  'Cmd+Q',
  'Cmd+N',
  'Cmd+T',
]);

/**
 * Normalize a single key token into a clean canonical label.
 */
export function normalizeKeyToken(rawKey, targetPlatform = 'windows') {
  if (!rawKey || typeof rawKey !== 'string') return '';
  const trimmed = rawKey.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (lower === 'meta') {
    return targetPlatform === 'mac' ? 'Cmd' : 'Win';
  }
  if (KEY_ALIASES[lower]) {
    return KEY_ALIASES[lower];
  }

  // Single character uppercase
  if (trimmed.length === 1) {
    return trimmed.toUpperCase();
  }

  // Function keys F1-F24
  if (/^f([1-9]|1[0-9]|2[0-4])$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Parse a key combination string (e.g. "Ctrl + Shift + P") or array into a normalized array of keys.
 */
export function parseKeyCombo(input, targetPlatform = 'windows') {
  if (!input) return [];

  let rawTokens = [];
  if (Array.isArray(input)) {
    rawTokens = input.map((k) => String(k));
  } else if (typeof input === 'string') {
    // Handle edge case where '+' itself is the final key (e.g. "Ctrl + +")
    const cleaned = input.trim();
    if (!cleaned) return [];
    const parts = cleaned.split(/\s*\+\s*/);
    rawTokens = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '' && i > 0) {
        rawTokens.push('+');
        if (parts[i + 1] === '') i++;
      } else if (parts[i] !== '') {
        rawTokens.push(parts[i]);
      }
    }
  }

  const normalized = rawTokens
    .map((token) => normalizeKeyToken(token, targetPlatform))
    .filter(Boolean);

  // Deduplicate while preserving modifier order first, then action keys
  const unique = Array.from(new Set(normalized));
  const modifiers = unique
    .filter((k) => MODIFIER_ORDER.includes(k))
    .sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b));
  const nonModifiers = unique.filter((k) => !MODIFIER_ORDER.includes(k));

  return [...modifiers, ...nonModifiers];
}

/**
 * Format key array for display or clipboard according to the active OS layout preference.
 * @param {object} shortcut - Shortcut object or { keys, macKeys }
 * @param {'windows'|'mac'} platform - Target platform layout
 * @param {boolean} includeSymbols - Whether to use macOS symbols (⌘, ⌥, ⇧, ⌃)
 */
export function getDisplayKeys(shortcut, platform = 'windows', includeSymbols = true) {
  if (!shortcut) return [];
  const baseKeys =
    platform === 'mac' && Array.isArray(shortcut.macKeys) && shortcut.macKeys.length > 0
      ? shortcut.macKeys
      : Array.isArray(shortcut.keys)
      ? shortcut.keys
      : parseKeyCombo(shortcut.keys);

  return baseKeys.map((key) => {
    if (platform === 'mac') {
      if (key === 'Ctrl') return includeSymbols ? '⌃ Ctrl' : 'Ctrl';
      if (key === 'Cmd' || key === 'Win') return includeSymbols ? '⌘ Cmd' : 'Cmd';
      if (key === 'Alt') return includeSymbols ? '⌥ Opt' : 'Opt';
      if (key === 'Shift') return includeSymbols ? '⇧ Shift' : 'Shift';
    } else {
      if (key === 'Cmd') return 'Ctrl';
    }
    return key;
  });
}

/**
 * Convert a shortcut's key array into a canonical comparison signature (e.g., "ctrl+shift+p").
 */
export function getComboSignature(keysInput) {
  const parsed = parseKeyCombo(keysInput);
  return parsed.map((k) => k.toLowerCase()).join('+');
}

/**
 * Format keys as a human-readable string (e.g., "Ctrl + Shift + P") for clipboard copying.
 */
export function formatComboString(shortcut, platform = 'windows') {
  const keys = getDisplayKeys(shortcut, platform, true);
  return keys.join(' + ');
}

/**
 * Check if a combination is commonly reserved by web browsers / OS window managers.
 */
export function isBrowserReservedCombo(keysInput) {
  const parsed = parseKeyCombo(keysInput);
  const canonical = parsed.join('+');
  return BROWSER_RESERVED_COMBOS.has(canonical);
}

/**
 * Validate a shortcut form submission.
 * Returns { isValid, errors, normalizedData }
 */
export function validateShortcutInput(formData) {
  const errors = {};

  const name = typeof formData?.name === 'string' ? formData.name.trim() : '';
  const application =
    typeof formData?.application === 'string' ? formData.application.trim() : '';
  const category =
    typeof formData?.category === 'string' ? formData.category.trim() : '';
  const description =
    typeof formData?.description === 'string' ? formData.description.trim() : '';
  const platformNote =
    typeof formData?.platformNote === 'string' ? formData.platformNote.trim() : '';

  const parsedKeys = parseKeyCombo(formData?.keys);

  if (!name) {
    errors.name = 'Shortcut name is required.';
  } else if (name.length > 80) {
    errors.name = 'Shortcut name must be 80 characters or fewer.';
  }

  if (!application) {
    errors.application = 'Application name is required.';
  } else if (application.length > 50) {
    errors.application = 'Application name must be 50 characters or fewer.';
  }

  if (!category) {
    errors.category = 'Please select or enter a category.';
  }

  if (parsedKeys.length === 0) {
    errors.keys = 'Please record or enter at least one key combination.';
  } else if (parsedKeys.length > 5) {
    errors.keys = 'Key combination cannot exceed 5 simultaneous keys.';
  }

  if (!description) {
    errors.description = 'A concise description is required to explain what this shortcut does.';
  } else if (description.length > 280) {
    errors.description = 'Description must be 280 characters or fewer.';
  }

  let tags = [];
  if (Array.isArray(formData?.tags)) {
    tags = formData.tags
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean);
  } else if (typeof formData?.tags === 'string') {
    tags = formData.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }
  tags = Array.from(new Set(tags)).slice(0, 10);

  const macKeys =
    formData?.macKeys && parseKeyCombo(formData.macKeys, 'mac').length > 0
      ? parseKeyCombo(formData.macKeys, 'mac')
      : parsedKeys.map((k) => (k === 'Ctrl' ? 'Cmd' : k));

  const collections = Array.isArray(formData?.collections)
    ? Array.from(new Set(formData.collections.filter((id) => typeof id === 'string')))
    : [];

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: {
      name,
      application,
      category,
      keys: parsedKeys,
      macKeys,
      description,
      tags,
      favorite: Boolean(formData?.favorite),
      collections,
      platformNote,
    },
  };
}

/**
 * Find potential duplicate shortcuts (same application + same key combo, or same app + same name).
 * Excludes `excludeId` when editing an existing shortcut.
 */
export function findDuplicateShortcuts(shortcuts, candidate, excludeId = null) {
  if (!Array.isArray(shortcuts) || !candidate) return [];
  const candidateApp = (candidate.application || '').trim().toLowerCase();
  const candidateCombo = getComboSignature(candidate.keys);
  const candidateName = (candidate.name || '').trim().toLowerCase();

  if (!candidateApp || (!candidateCombo && !candidateName)) return [];

  return shortcuts.filter((item) => {
    if (excludeId && item.id === excludeId) return false;
    const itemApp = (item.application || '').trim().toLowerCase();
    if (itemApp !== candidateApp) return false;

    const itemCombo = getComboSignature(item.keys);
    const itemName = (item.name || '').trim().toLowerCase();

    return (
      (candidateCombo && itemCombo === candidateCombo) ||
      (candidateName && itemName === candidateName)
    );
  });
}
