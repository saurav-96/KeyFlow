import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell({
  activeTab,
  onSelectTab,
  sidebarCollapsed,
  onToggleSidebarCollapse,
  mobileMenuOpen,
  onOpenMobileMenu,
  onCloseMobileMenu,
  platform,
  theme,
  onTogglePlatform,
  onToggleTheme,
  shortcuts,
  collections,
  selectedCollectionId,
  onSelectCollectionFilter,
  onOpenAddShortcut,
  onQuickSearchClick,
  children,
}) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={onToggleSidebarCollapse}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={onCloseMobileMenu}
        shortcuts={shortcuts}
        collections={collections}
        selectedCollectionId={selectedCollectionId}
        onSelectCollectionFilter={onSelectCollectionFilter}
        onOpenAddShortcut={onOpenAddShortcut}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          platform={platform}
          theme={theme}
          onTogglePlatform={onTogglePlatform}
          onToggleTheme={onToggleTheme}
          onOpenMobileMenu={onOpenMobileMenu}
          onOpenAddShortcut={onOpenAddShortcut}
          onQuickSearchClick={onQuickSearchClick}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
