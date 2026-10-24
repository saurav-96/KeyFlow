import { describe, it, expect } from 'vitest';
import {
  normalizeKeyToken,
  parseKeyCombo,
  getDisplayKeys,
  validateShortcutInput,
  findDuplicateShortcuts,
} from '../shortcutValidation';
import {
  escapeCsvCell,
  shortcutsToCsv,
  parseAndValidateCsvImport,
  parseAndValidateJsonImport,
  createJsonExportPayload,
} from '../importExport';
import { filterAndSortShortcuts, computeDashboardStats } from '../shortcutFilters';
import { SEED_SHORTCUTS, STARTER_COLLECTIONS } from '../../data/seedData';

describe('KeyFlow Validation & Keycap Utilities', () => {
  it('normalizes modifier aliases and orders modifiers consistently', () => {
    expect(normalizeKeyToken('control')).toBe('Ctrl');
    expect(normalizeKeyToken('escape')).toBe('Esc');
    expect(normalizeKeyToken('arrowright')).toBe('Right');
    expect(parseKeyCombo('p + shift + ctrl')).toEqual(['Ctrl', 'Shift', 'P']);
  });

  it('formats Windows and macOS display keys accurately', () => {
    const sample = { keys: ['Ctrl', 'Shift', 'P'], macKeys: ['Cmd', 'Shift', 'P'] };
    expect(getDisplayKeys(sample, 'windows', true)).toEqual(['Ctrl', 'Shift', 'P']);
    expect(getDisplayKeys(sample, 'mac', true)).toEqual(['⌘ Cmd', '⇧ Shift', 'P']);
  });

  it('validates required fields and rejects incomplete shortcuts', () => {
    const invalid = validateShortcutInput({
      name: '',
      application: 'VS Code',
      category: 'Editing',
      keys: '',
      description: '',
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.name).toBeDefined();
    expect(invalid.errors.keys).toBeDefined();
    expect(invalid.errors.description).toBeDefined();

    const valid = validateShortcutInput({
      name: 'Toggle Sidebar',
      application: 'VS Code',
      category: 'Navigation',
      keys: 'Ctrl + B',
      description: 'Show or hide the primary sidebar.',
      tags: 'sidebar, layout, sidebar',
      favorite: true,
    });
    expect(valid.isValid).toBe(true);
    expect(valid.normalizedData.keys).toEqual(['Ctrl', 'B']);
    expect(valid.normalizedData.tags).toEqual(['sidebar', 'layout']);
  });

  it('detects duplicate shortcuts within the same application without false positives across apps', () => {
    const dupsSameApp = findDuplicateShortcuts(SEED_SHORTCUTS, {
      name: 'Custom Command Palette',
      application: 'VS Code',
      keys: ['Ctrl', 'Shift', 'P'],
    });
    expect(dupsSameApp.length).toBeGreaterThan(0);

    const dupsDifferentApp = findDuplicateShortcuts(SEED_SHORTCUTS, {
      name: 'Unique Action',
      application: 'Notion',
      keys: ['Ctrl', 'Shift', 'P'],
    });
    expect(dupsDifferentApp.length).toBe(0);
  });
});

describe('KeyFlow Import & Export (JSON & RFC 4180 CSV)', () => {
  it('escapes CSV cells containing commas, double quotes, and newlines properly', () => {
    expect(escapeCsvCell('Simple')).toBe('Simple');
    expect(escapeCsvCell('Has, comma')).toBe('"Has, comma"');
    expect(escapeCsvCell('Say "Hello"')).toBe('"Say ""Hello"""');
    expect(escapeCsvCell('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
  });

  it('round-trips shortcuts through CSV export and CSV import with tricky characters', () => {
    const trickyShortcuts = [
      {
        id: 'sc-test-1',
        name: 'Search "Exact", Match',
        application: 'VS Code',
        category: 'Editing',
        keys: ['Ctrl', 'Shift', 'F'],
        macKeys: ['Cmd', 'Shift', 'F'],
        description: 'Finds text across files, including "quoted" strings\nand multiline blocks.',
        tags: ['search', 'quotes'],
        favorite: true,
        collections: ['col-coding'],
        platformNote: 'Win: Ctrl+Shift+F, Mac: Cmd+Shift+F',
      },
    ];

    const csv = shortcutsToCsv(trickyShortcuts, STARTER_COLLECTIONS);
    const reimported = parseAndValidateCsvImport(csv, STARTER_COLLECTIONS);
    expect(reimported.shortcuts).toHaveLength(1);
    expect(reimported.shortcuts[0].name).toBe('Search "Exact", Match');
    expect(reimported.shortcuts[0].description).toBe(
      'Finds text across files, including "quoted" strings\nand multiline blocks.'
    );
    expect(reimported.shortcuts[0].collections).toContain('col-coding');
  });

  it('rejects malformed CSV with unclosed quotes or missing required headers', () => {
    expect(() =>
      parseAndValidateCsvImport('Name,Application,Windows Keys\n"Unclosed quote,VS Code,Ctrl+P')
    ).toThrow(/unclosed quotation mark/i);

    expect(() =>
      parseAndValidateCsvImport('WrongHeader1,WrongHeader2\nVal1,Val2')
    ).toThrow(/Malformed CSV header/i);
  });

  it('validates JSON import and rejects invalid JSON syntax or missing required fields', () => {
    expect(() => parseAndValidateJsonImport('{invalid json')).toThrow(/Invalid JSON syntax/i);
    expect(() => parseAndValidateJsonImport('{"notShortcuts": []}')).toThrow(
      /Invalid JSON structure/i
    );
    expect(() =>
      parseAndValidateJsonImport(
        JSON.stringify([{ name: 'Missing Keys', application: 'Chrome', description: 'Test' }])
      )
    ).toThrow(/Invalid shortcut/i);

    const payload = createJsonExportPayload(SEED_SHORTCUTS.slice(0, 2), STARTER_COLLECTIONS);
    const parsed = parseAndValidateJsonImport(JSON.stringify(payload));
    expect(parsed.shortcuts).toHaveLength(2);
    expect(parsed.collections).toHaveLength(4);
  });
});

describe('KeyFlow Search, Filtering, and Dashboard Statistics', () => {
  it('filters by search query across name, key combo, tags, and application', () => {
    const byKeyCombo = filterAndSortShortcuts(SEED_SHORTCUTS, {
      searchQuery: 'Ctrl + Shift + P',
    });
    expect(byKeyCombo.some((s) => s.name === 'Command Palette')).toBe(true);

    const byTag = filterAndSortShortcuts(SEED_SHORTCUTS, {
      searchQuery: 'multi-cursor',
    });
    expect(byTag).toHaveLength(1);
    expect(byTag[0].name).toBe('Add Selection to Next Find Match');
  });

  it('computes accurate dashboard statistics from stored shortcuts', () => {
    const stats = computeDashboardStats(SEED_SHORTCUTS);
    expect(stats.totalShortcuts).toBe(22);
    expect(stats.applicationsCount).toBe(5);
    expect(stats.favoritesCount).toBe(SEED_SHORTCUTS.filter((s) => s.favorite).length);
  });
});
