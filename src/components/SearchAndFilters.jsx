import React from 'react';
import {
  Search,
  X,
  LayoutGrid,
  List,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  FolderKanban,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_APPLICATIONS, DEFAULT_CATEGORIES } from '../data/seedData';

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedApp,
  onAppChange,
  selectedCategory,
  onCategoryChange,
  selectedCollection,
  onCollectionChange,
  onlyFavorites,
  onToggleOnlyFavorites,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  collections = [],
  allShortcuts = [],
  totalMatching = 0,
  onResetFilters,
  searchInputRef,
}) {
  // Discover any custom applications and categories dynamically
  const dynamicApps = Array.from(
    new Set([
      ...DEFAULT_APPLICATIONS,
      ...allShortcuts.map((s) => (s.application || '').trim()).filter(Boolean),
    ])
  );

  const dynamicCategories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...allShortcuts.map((s) => (s.category || '').trim()).filter(Boolean),
    ])
  );

  const hasCustomShortcuts = allShortcuts.some(
    (s) =>
      s.isCustom ||
      !DEFAULT_APPLICATIONS.some(
        (app) => app.toLowerCase() === (s.application || '').toLowerCase()
      )
  );

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedApp !== 'All' ||
    selectedCategory !== 'All' ||
    selectedCollection !== 'All' ||
    onlyFavorites;

  return (
    <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-4 sm:p-5 shadow-card-subtle">
      {/* Row 1: Instant Search Bar + Favorites Toggle + View Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shortcuts by name, key combo (e.g. Ctrl+P), app, tag, or description..."
            aria-label="Search shortcuts"
            className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Favorites Filter Button */}
          <button
            type="button"
            onClick={onToggleOnlyFavorites}
            aria-pressed={onlyFavorites}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              onlyFavorites
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <Star
              className="w-3.5 h-3.5 text-amber-500"
              fill={onlyFavorites ? 'currentColor' : 'none'}
            />
            <span>Favorites</span>
          </button>

          {/* Category Dropdown */}
          <div className="relative flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by category"
              className="pl-8 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {dynamicCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Collection Dropdown */}
          <div className="relative flex items-center">
            <FolderKanban className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedCollection}
              onChange={(e) => onCollectionChange(e.target.value)}
              aria-label="Filter by collection"
              className="pl-8 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="All">All Collections</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort shortcuts by"
              className="pl-8 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="date">Sort: Recently Added</option>
              <option value="name">Sort: Name (A–Z)</option>
              <option value="application">Sort: Application</option>
              <option value="favorites">Sort: Favorites First</option>
            </select>
          </div>

          {/* Grid / List View Switcher */}
          <div
            className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800"
            role="group"
            aria-label="View mode toggle"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Application Filter Pills + Result Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div
          className="flex items-center flex-wrap gap-1.5"
          role="group"
          aria-label="Filter by application"
        >
          <button
            type="button"
            onClick={() => onAppChange('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedApp === 'All'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
            }`}
          >
            All Apps ({allShortcuts.length})
          </button>

          {dynamicApps.map((app) => {
            const count = allShortcuts.filter(
              (s) => (s.application || '').toLowerCase() === app.toLowerCase()
            ).length;
            const isSelected = selectedApp.toLowerCase() === app.toLowerCase();
            return (
              <button
                key={app}
                type="button"
                onClick={() => onAppChange(app)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                    : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {app} ({count})
              </button>
            );
          })}

          {hasCustomShortcuts && (
            <button
              type="button"
              onClick={() => onAppChange('Custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedApp === 'Custom'
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
            >
              Custom Entries
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{totalMatching}</strong>{' '}
            {totalMatching === 1 ? 'shortcut' : 'shortcuts'}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
