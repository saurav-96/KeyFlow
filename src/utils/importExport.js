import { generateId } from './shortcutStorage';
import { validateShortcutInput, parseKeyCombo } from './shortcutValidation';

/**
 * Escape a single CSV cell value per RFC 4180.
 * Wraps in double quotes if value contains comma, double quote, newline, or leading/trailing whitespace.
 * Doubles any internal double quotes.
 */
export function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const needsQuotes = /[",\r\n]/.test(str) || str.startsWith(' ') || str.endsWith(' ');
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/**
 * Convert an array of shortcuts into an RFC 4180 compliant CSV string.
 */
export function shortcutsToCsv(shortcuts = [], collections = []) {
  const safeShortcuts = Array.isArray(shortcuts) ? shortcuts : [];
  const collectionMap = new Map(
    (Array.isArray(collections) ? collections : []).map((c) => [c.id, c.name])
  );

  const headers = [
    'Name',
    'Application',
    'Category',
    'Windows Keys',
    'macOS Keys',
    'Description',
    'Tags',
    'Favorite',
    'Collections',
    'Platform Note',
  ];

  const rows = safeShortcuts.map((item) => {
    const winKeys = Array.isArray(item.keys) ? item.keys.join(' + ') : '';
    const macKeys = Array.isArray(item.macKeys)
      ? item.macKeys.join(' + ')
      : winKeys;
    const tags = Array.isArray(item.tags) ? item.tags.join(', ') : '';
    const collectionNames = Array.isArray(item.collections)
      ? item.collections
          .map((id) => collectionMap.get(id) || id)
          .filter(Boolean)
          .join(', ')
      : '';

    return [
      escapeCsvCell(item.name || ''),
      escapeCsvCell(item.application || ''),
      escapeCsvCell(item.category || ''),
      escapeCsvCell(winKeys),
      escapeCsvCell(macKeys),
      escapeCsvCell(item.description || ''),
      escapeCsvCell(tags),
      escapeCsvCell(item.favorite ? 'true' : 'false'),
      escapeCsvCell(collectionNames),
      escapeCsvCell(item.platformNote || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Parse an RFC 4180 CSV string into rows of string cells.
 * Throws a descriptive error if quotes are unbalanced or the CSV is malformed.
 */
export function parseCsvRows(csvText) {
  if (typeof csvText !== 'string' || !csvText.trim()) {
    throw new Error('CSV content is empty.');
  }

  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        if (currentCell.length > 0) {
          throw new Error(
            `Malformed CSV: unexpected quote inside unquoted field at character ${i + 1}.`
          );
        }
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++; // skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (inQuotes) {
    throw new Error('Malformed CSV: unclosed quotation mark detected.');
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim() !== ''));
}

/**
 * Parse and validate imported CSV text into normalized shortcuts.
 */
export function parseAndValidateCsvImport(csvText, existingCollections = []) {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('CSV file must include a header row and at least one shortcut row.');
  }

  const headerRow = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = headerRow.findIndex((h) => h === 'name' || h === 'shortcut name');
  const appIdx = headerRow.findIndex((h) => h === 'application' || h === 'app');
  const catIdx = headerRow.findIndex((h) => h === 'category');
  const keysIdx = headerRow.findIndex(
    (h) => h === 'windows keys' || h === 'keys' || h === 'key combination' || h === 'shortcut'
  );
  const macKeysIdx = headerRow.findIndex((h) => h === 'macos keys' || h === 'mac keys');
  const descIdx = headerRow.findIndex((h) => h === 'description');
  const tagsIdx = headerRow.findIndex((h) => h === 'tags');
  const favIdx = headerRow.findIndex((h) => h === 'favorite');
  const colIdx = headerRow.findIndex((h) => h === 'collections');
  const noteIdx = headerRow.findIndex((h) => h === 'platform note');

  if (nameIdx === -1 || appIdx === -1 || keysIdx === -1) {
    throw new Error(
      'Malformed CSV header: required columns "Name", "Application", and "Windows Keys" (or "Keys") are missing.'
    );
  }

  const collectionByName = new Map(
    (Array.isArray(existingCollections) ? existingCollections : []).map((c) => [
      c.name.toLowerCase(),
      c.id,
    ])
  );

  const validShortcuts = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < 3) {
      throw new Error(`Malformed CSV at row ${r + 1}: insufficient columns.`);
    }

    const rawCollectionNames = colIdx !== -1 && row[colIdx] ? row[colIdx].split(',') : [];
    const matchedCollectionIds = rawCollectionNames
      .map((n) => collectionByName.get(n.trim().toLowerCase()))
      .filter(Boolean);

    const candidate = {
      name: row[nameIdx] || '',
      application: row[appIdx] || '',
      category: (catIdx !== -1 && row[catIdx]) || 'Productivity',
      keys: row[keysIdx] || '',
      macKeys: macKeysIdx !== -1 && row[macKeysIdx] ? row[macKeysIdx] : '',
      description:
        (descIdx !== -1 && row[descIdx]) ||
        `${row[nameIdx] || 'Shortcut'} in ${row[appIdx] || 'Application'}`,
      tags: tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx] : '',
      favorite:
        favIdx !== -1 && row[favIdx]
          ? ['true', 'yes', '1'].includes(row[favIdx].trim().toLowerCase())
          : false,
      collections: matchedCollectionIds,
      platformNote: noteIdx !== -1 && row[noteIdx] ? row[noteIdx] : '',
    };

    const validation = validateShortcutInput(candidate);
    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0];
      throw new Error(`Row ${r + 1} invalid: ${firstErr}`);
    }

    validShortcuts.push({
      id: generateId('sc'),
      ...validation.normalizedData,
      isCustom: true,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    shortcuts: validShortcuts,
    collections: [],
  };
}

/**
 * Create a structured JSON export payload.
 */
export function createJsonExportPayload(shortcuts = [], collections = []) {
  return {
    app: 'KeyFlow',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    shortcuts: Array.isArray(shortcuts) ? shortcuts : [],
    collections: Array.isArray(collections) ? collections : [],
  };
}

/**
 * Parse and strictly validate an imported JSON string.
 * Supports either a KeyFlow bundle `{ shortcuts, collections }` or a direct array of shortcut objects.
 */
export function parseAndValidateJsonImport(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('The selected JSON file is empty.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    throw new Error(`Invalid JSON syntax: ${err.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('JSON root must be an object or an array of shortcuts.');
  }

  const rawShortcuts = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.shortcuts)
    ? parsed.shortcuts
    : null;

  if (!rawShortcuts) {
    throw new Error(
      'Invalid JSON structure: expected a "shortcuts" array or a top-level array of shortcut objects.'
    );
  }

  if (rawShortcuts.length === 0) {
    throw new Error('The JSON file contains 0 shortcuts to import.');
  }

  const validatedShortcuts = [];

  for (let i = 0; i < rawShortcuts.length; i++) {
    const item = rawShortcuts[i];
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Item at index ${i} is not a valid shortcut object.`);
    }

    const validation = validateShortcutInput({
      name: item.name,
      application: item.application,
      category: item.category || 'Productivity',
      keys: item.keys,
      macKeys: item.macKeys,
      description: item.description,
      tags: item.tags,
      favorite: item.favorite,
      collections: item.collections,
      platformNote: item.platformNote,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(
        `Invalid shortcut at item #${i + 1} (${item.name || 'Unnamed'}): ${firstError}`
      );
    }

    validatedShortcuts.push({
      id:
        typeof item.id === 'string' && item.id.trim()
          ? item.id.trim()
          : generateId('sc'),
      ...validation.normalizedData,
      isCustom: item.isCustom !== undefined ? Boolean(item.isCustom) : true,
      createdAt:
        typeof item.createdAt === 'string' && !Number.isNaN(Date.parse(item.createdAt))
          ? item.createdAt
          : new Date().toISOString(),
    });
  }

  const rawCollections =
    !Array.isArray(parsed) && Array.isArray(parsed.collections)
      ? parsed.collections
      : [];

  const validatedCollections = [];
  for (let i = 0; i < rawCollections.length; i++) {
    const col = rawCollections[i];
    if (col && typeof col === 'object' && typeof col.name === 'string' && col.name.trim()) {
      validatedCollections.push({
        id:
          typeof col.id === 'string' && col.id.trim()
            ? col.id.trim()
            : generateId('col'),
        name: col.name.trim().slice(0, 45),
        description:
          typeof col.description === 'string'
            ? col.description.trim().slice(0, 140)
            : 'Imported collection',
        color: typeof col.color === 'string' ? col.color : 'indigo',
        createdAt: col.createdAt || new Date().toISOString(),
        isStarter: Boolean(col.isStarter),
      });
    }
  }

  return {
    shortcuts: validatedShortcuts,
    collections: validatedCollections,
  };
}

/**
 * Trigger a browser file download for a text payload.
 */
export function triggerFileDownload(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
