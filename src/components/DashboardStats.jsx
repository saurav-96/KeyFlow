import React from 'react';
import {
  Keyboard,
  Star,
  AppWindow,
  Sparkles,
  Plus,
  Upload,
  ArrowRight,
  Clock,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react';
import ShortcutCard, { getAppStyle } from './ShortcutCard';
import KeycapCombo from './KeycapCombo';
import { computeDashboardStats } from '../utils/shortcutFilters';

export default function DashboardStats({
  shortcuts = [],
  collections = [],
  platform = 'windows',
  onOpenAddShortcut,
  onNavigate,
  onToggleFavorite,
  onEditShortcut,
  onDeleteShortcut,
  onCopyCombo,
  onToggleCollectionMembership,
  onRestoreSampleData,
}) {
  const stats = computeDashboardStats(shortcuts);

  const statCards = [
    {
      id: 'total',
      label: 'Total Shortcuts',
      value: stats.totalShortcuts,
      subtitle: 'Indexed across your workspace',
      icon: <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      iconBg:
        'bg-indigo-50 border-indigo-200/60 dark:bg-indigo-950/60 dark:border-indigo-900/60',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      value: stats.favoritesCount,
      subtitle: 'Pinned for high-frequency lookup',
      icon: <Star className="w-5 h-5 text-amber-500" fill="currentColor" />,
      iconBg:
        'bg-amber-50 border-amber-200/60 dark:bg-amber-950/60 dark:border-amber-900/60',
    },
    {
      id: 'applications',
      label: 'Applications',
      value: stats.applicationsCount,
      subtitle: 'Distinct tools & OS environments',
      icon: <AppWindow className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      iconBg: 'bg-sky-50 border-sky-200/60 dark:bg-sky-950/60 dark:border-sky-900/60',
    },
    {
      id: 'custom',
      label: 'Custom Shortcuts',
      value: stats.customShortcutsCount,
      subtitle: 'Personal & imported bindings',
      icon: <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
      iconBg:
        'bg-violet-50 border-violet-200/60 dark:bg-violet-950/60 dark:border-violet-900/60',
    },
  ];

  const appEntries = Object.entries(stats.appCounts || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner + Quick Actions */}
      <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-6 sm:p-7 shadow-card-subtle bg-dot-grid">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/90 border border-indigo-200/70 dark:border-indigo-800/70 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personal Keyboard Command Center</span>
              <span className="hidden sm:inline text-indigo-300 dark:text-indigo-700">•</span>
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-normal">
                Press <kbd className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">/</kbd> to search
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome to KeyFlow
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Discover, organize, and master keyboard shortcuts across your favorite developer
              tools, design suites, and operating systems. Built for rapid muscle-memory lookup
              with tactile keycaps and instant filtering.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAddShortcut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shortcut</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 shadow-2xs transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Import / Export Data</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('library', { onlyFavorites: false, collectionId: 'All', application: 'All' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
            >
              <span>Browse Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Application Quick-Filter Strip */}
        {appEntries.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center flex-wrap gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
              Quick Filter by App:
            </span>
            {appEntries.map(([appName, count]) => {
              const style = getAppStyle(appName);
              return (
                <button
                  key={appName}
                  type="button"
                  onClick={() =>
                    onNavigate('library', {
                      application: appName,
                      onlyFavorites: false,
                      collectionId: 'All',
                    })
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border hover:scale-[1.02] transition-transform ${style.badge}`}
                >
                  {style.icon}
                  <span>{appName}</span>
                  <span className="opacity-70 font-mono text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4 Live KPI Cards */}
      <section
        aria-label="Shortcut Statistics"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {statCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-5 shadow-card-subtle flex items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p
                data-testid={`stat-${card.id}`}
                className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
              >
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {card.subtitle}
              </p>
            </div>
            <div className={`p-3 rounded-xl border shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {shortcuts.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 mb-4">
            <KeycapCombo keys={['Ctrl', 'Shift', 'P']} platform={platform} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your Shortcut Workspace is Empty
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Start building your personal shortcut library from scratch or restore our verified
            starter dataset for VS Code, Chrome, Windows, Figma, and Photoshop.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenAddShortcut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Shortcut</span>
            </button>
            <button
              type="button"
              onClick={onRestoreSampleData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <span>Restore Sample Dataset</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Favorite Shortcuts Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 border border-amber-200/60 dark:border-amber-900/60">
                  <Star className="w-4 h-4" fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Favorite Shortcuts
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your starred combinations for instant access
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate('library', {
                    onlyFavorites: true,
                    application: 'All',
                    collectionId: 'All',
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>View all ({stats.favoritesCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats.favoriteShortcuts.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No favorite shortcuts pinned yet
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Click the star icon on any shortcut card to pin it to your dashboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {stats.favoriteShortcuts.map((shortcut) => (
                  <ShortcutCard
                    key={shortcut.id}
                    shortcut={shortcut}
                    platform={platform}
                    collections={collections}
                    onToggleFavorite={onToggleFavorite}
                    onEdit={onEditShortcut}
                    onDelete={onDeleteShortcut}
                    onCopyCombo={onCopyCombo}
                    onToggleCollectionMembership={onToggleCollectionMembership}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recently Added Shortcuts Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Recently Added Shortcuts
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Latest additions to your shortcut repository
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate('library', {
                    onlyFavorites: false,
                    application: 'All',
                    collectionId: 'All',
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Open full library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stats.recentlyAdded.map((shortcut) => (
                <ShortcutCard
                  key={shortcut.id}
                  shortcut={shortcut}
                  platform={platform}
                  collections={collections}
                  onToggleFavorite={onToggleFavorite}
                  onEdit={onEditShortcut}
                  onDelete={onDeleteShortcut}
                  onCopyCombo={onCopyCombo}
                  onToggleCollectionMembership={onToggleCollectionMembership}
                />
              ))}
            </div>
          </section>

          {/* Collections Quick Overview */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-900/60">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Personal Collections
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Curated workflow bundles across applications
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('collections')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Manage collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {collections.map((col) => {
                const count = shortcuts.filter(
                  (s) => Array.isArray(s.collections) && s.collections.includes(col.id)
                ).length;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() =>
                      onNavigate('library', {
                        collectionId: col.id,
                        application: 'All',
                        onlyFavorites: false,
                      })
                    }
                    className="group text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-4 shadow-card-subtle hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {col.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {count}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {col.description || 'Curated shortcut collection'}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
