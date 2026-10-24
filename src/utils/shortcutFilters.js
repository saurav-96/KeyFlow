import { DEFAULT_APPLICATIONS } from '../data/seedData';
import { formatComboString } from './shortcutValidation';

/**
 * Filter and sort shortcuts according to active query, filters, and sort order.
 */
export function filterAndSortShortcuts(shortcuts, options = {}) {
  const {
    searchQuery = '',
    application = 'All',
    category = 'All',
    collectionId = 'All',
    onlyFavorites = false,
    sortBy = 'date', // 'name' | 'application' | 'date' | 'favorites'
    platform = 'windows',
  } = options;

  if (!Array.isArray(shortcuts)) return [];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = shortcuts.filter((item) => {
    if (!item) return false;

    // Favorites filter
    if (onlyFavorites && !item.favorite) {
      return false;
    }

    // Application filter
    if (application && application !== 'All') {
      if (application === 'Custom') {
        const isBuiltInApp = DEFAULT_APPLICATIONS.some(
          (app) => app.toLowerCase() === (item.application || '').toLowerCase()
        );
        if (isBuiltInApp && !item.isCustom) return false;
      } else if ((item.application || '').toLowerCase() !== application.toLowerCase()) {
        return false;
      }
    }

    // Category filter
    if (category && category !== 'All') {
      if ((item.category || '').toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    // Collection filter
    if (collectionId && collectionId !== 'All') {
      if (!Array.isArray(item.collections) || !item.collections.includes(collectionId)) {
        return false;
      }
    }

    // Search query across name, description, application, category, tags, and key combinations
    if (normalizedQuery) {
      const winCombo = formatComboString(item, 'windows').toLowerCase();
      const macCombo = formatComboString(item, 'mac').toLowerCase();
      const rawKeys = Array.isArray(item.keys) ? item.keys.join(' ').toLowerCase() : '';
      const rawComboCompact = Array.isArray(item.keys) ? item.keys.join('+').toLowerCase() : '';
      const activeCombo = formatComboString(item, platform).toLowerCase();
      const tagsText = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';

      const searchableText = [
        item.name || '',
        item.description || '',
        item.application || '',
        item.category || '',
        item.platformNote || '',
        tagsText,
        winCombo,
        macCombo,
        rawKeys,
        rawComboCompact,
        activeCombo,
      ]
        .join(' ')
        .toLowerCase();

      // Support multi-token queries (every word in search query must match somewhere)
      const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
      const matchesAllTokens = queryTokens.every((token) => searchableText.includes(token));
      if (!matchesAllTokens) return false;
    }

    return true;
  });

  // Sort results
  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'application': {
        const appCmp = (a.application || '').localeCompare(b.application || '');
        return appCmp !== 0 ? appCmp : (a.name || '').localeCompare(b.name || '');
      }
      case 'favorites': {
        if (Boolean(a.favorite) !== Boolean(b.favorite)) {
          return a.favorite ? -1 : 1;
        }
        return (a.name || '').localeCompare(b.name || '');
      }
      case 'date':
      default: {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (a.name || '').localeCompare(b.name || '');
      }
    }
  });
}

/**
 * Compute real-time statistics from the stored shortcuts array.
 */
export function computeDashboardStats(shortcuts = []) {
  const safeList = Array.isArray(shortcuts) ? shortcuts : [];

  const totalShortcuts = safeList.length;
  const favoritesCount = safeList.filter((s) => Boolean(s.favorite)).length;

  const uniqueApps = new Set(
    safeList.map((s) => (s.application || '').trim()).filter(Boolean)
  );
  const applicationsCount = uniqueApps.size;

  const customShortcutsCount = safeList.filter((s) => {
    if (s.isCustom) return true;
    const isStandardApp = DEFAULT_APPLICATIONS.some(
      (app) => app.toLowerCase() === (s.application || '').toLowerCase()
    );
    return !isStandardApp;
  }).length;

  const recentlyAdded = [...safeList]
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 6);

  const favoriteShortcuts = safeList.filter((s) => Boolean(s.favorite)).slice(0, 6);

  // Per-application breakdown
  const appCounts = {};
  safeList.forEach((s) => {
    const app = (s.application || 'Other').trim();
    appCounts[app] = (appCounts[app] || 0) + 1;
  });

  return {
    totalShortcuts,
    favoritesCount,
    applicationsCount,
    customShortcutsCount,
    recentlyAdded,
    favoriteShortcuts,
    appCounts,
  };
}
