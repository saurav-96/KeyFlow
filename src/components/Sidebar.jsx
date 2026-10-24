import React from 'react';
import {
  LayoutDashboard,
  Library,
  FolderKanban,
  Settings,
  Keyboard,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  X,
  Folder,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  shortcuts = [],
  collections = [],
  selectedCollectionId = 'All',
  onSelectCollectionFilter,
  onOpenAddShortcut,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'library',
      label: 'Shortcut Library',
      icon: Library,
      badge: shortcuts.length,
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: FolderKanban,
      badge: collections.length,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId) => {
    onSelectTab(tabId);
    onCloseMobile?.();
  };

  const renderSidebarContent = (isMobileView = false) => {
    const isCompact = !isMobileView && collapsed;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/85 dark:border-slate-800/90 select-none">
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80 ${
            isCompact ? 'justify-center px-2' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/30 shrink-0 group-hover:scale-105 transition-transform">
              <Keyboard className="w-5 h-5" />
            </div>
            {!isCompact && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    KeyFlow
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                  Shortcut Manager
                </p>
              </div>
            )}
          </button>

          {isMobileView ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            !isCompact && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* Quick Add CTA */}
        <div className={`p-3 ${isCompact ? 'px-2' : ''}`}>
          <button
            type="button"
            onClick={() => {
              onOpenAddShortcut?.();
              onCloseMobile?.();
            }}
            title="Add New Shortcut"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/25 transition-all ${
              isCompact ? 'px-0' : ''
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCompact && <span>New Shortcut</span>}
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="flex-1 overflow-y-auto px-3 py-2 space-y-6"
        >
          <div className="space-y-1">
            {!isCompact && (
              <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace
              </p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id &&
                (item.id !== 'library' || selectedCollectionId === 'All');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'library') {
                      onSelectCollectionFilter?.('All');
                    }
                    handleNavClick(item.id);
                  }}
                  title={isCompact ? item.label : undefined}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isCompact ? 'justify-center px-2' : ''
                  } ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    {!isCompact && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCompact && item.badge !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-200'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Collections Quick Access */}
          {!isCompact && collections.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2.5 pb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Collections
                </p>
                <button
                  type="button"
                  onClick={() => handleNavClick('collections')}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              {collections.map((col) => {
                const count = shortcuts.filter(
                  (s) => Array.isArray(s.collections) && s.collections.includes(col.id)
                ).length;
                const isSelected =
                  activeTab === 'library' && selectedCollectionId === col.id;

                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      onSelectCollectionFilter?.(col.id);
                      handleNavClick('library');
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom Collapse / Expand Control */}
        {!isMobileView && (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
            {isCompact ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Local-First Storage
                </p>
                <p className="mt-0.5 leading-snug">
                  Saved in browser localStorage. Press <kbd className="font-mono">/</kbd> to
                  search anytime.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Desktop Sidebar"
        className={`hidden md:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[70] md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
