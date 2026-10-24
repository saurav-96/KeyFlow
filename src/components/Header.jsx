import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  Monitor,
  Command,
  Search,
} from 'lucide-react';

export default function Header({
  activeTab,
  platform = 'windows',
  theme = 'light',
  onTogglePlatform,
  onToggleTheme,
  onOpenMobileMenu,
  onOpenAddShortcut,
  onQuickSearchClick,
}) {
  const sectionTitles = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your keyboard shortcuts and collections',
    },
    library: {
      title: 'Shortcut Library',
      subtitle: 'Search, filter, and copy verified keyboard combinations',
    },
    collections: {
      title: 'Collections',
      subtitle: 'Curate custom workflow bundles across applications',
    },
    settings: {
      title: 'Settings & Data',
      subtitle: 'Configure theme, modifier layout, and JSON/CSV backups',
    },
  };

  const currentSection = sectionTitles[activeTab] || sectionTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/85 dark:border-slate-800/90 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile Menu Button + Page Heading */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {currentSection.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
            {currentSection.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Search Pill, OS Modifier Switcher, Theme Toggle, Add Button */}
      <div className="flex items-center gap-2 shrink-0">
        {activeTab !== 'library' && (
          <button
            type="button"
            onClick={onQuickSearchClick}
            aria-label="Jump to shortcut library search"
            className="hidden lg:inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Quick search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
              /
            </kbd>
          </button>
        )}

        {/* OS Modifier Switcher (Win/Linux vs macOS) */}
        <button
          type="button"
          onClick={onTogglePlatform}
          aria-label={`Switch keyboard layout display. Currently ${
            platform === 'mac' ? 'macOS' : 'Windows/Linux'
          }`}
          title="Switch displayed modifier keys between Windows/Linux and macOS"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
        >
          {platform === 'mac' ? (
            <>
              <Command className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>macOS ⌘</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Win / Linux</span>
            </>
          )}
        </button>

        {/* Light / Dark Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
          }
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Primary Add Shortcut CTA */}
        <button
          type="button"
          onClick={onOpenAddShortcut}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/25 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Shortcut</span>
        </button>
      </div>
    </header>
  );
}
