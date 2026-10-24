import React, { useState, useEffect, useRef, useMemo } from 'react';
import AppShell from './components/AppShell';
import DashboardStats from './components/DashboardStats';
import SearchAndFilters from './components/SearchAndFilters';
import ShortcutCard from './components/ShortcutCard';
import ShortcutTable from './components/ShortcutTable';
import ShortcutForm from './components/ShortcutForm';
import CollectionManager from './components/CollectionManager';
import SettingsPanel from './components/SettingsPanel';
import ConfirmDialog from './components/ConfirmDialog';
import { ToastProvider, useToast } from './components/ToastProvider';

import {
  loadInitialState,
  saveShortcuts,
  saveCollections,
  saveSettings,
  restoreSampleDataset,
  clearAllStoredData,
  generateId,
} from './utils/shortcutStorage';
import { filterAndSortShortcuts } from './utils/shortcutFilters';
import {
  createJsonExportPayload,
  parseAndValidateJsonImport,
  shortcutsToCsv,
  parseAndValidateCsvImport,
  triggerFileDownload,
} from './utils/importExport';

import { Keyboard, Plus, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

function KeyFlowWorkspace() {
  const { addToast } = useToast();

  // Load persisted state once on mount
  const initialState = useMemo(() => loadInitialState(), []);

  const [shortcuts, setShortcuts] = useState(initialState.shortcuts);
  const [collections, setCollections] = useState(initialState.collections);
  const [settings, setSettings] = useState(initialState.settings);

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Library Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Add/Edit Shortcut Modal State
  const [isShortcutFormOpen, setIsShortcutFormOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    onConfirm: null,
  });

  const searchInputRef = useRef(null);

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist changes to localStorage
  useEffect(() => {
    saveShortcuts(shortcuts);
  }, [shortcuts]);

  useEffect(() => {
    saveCollections(collections);
  }, [collections]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedApp,
    selectedCategory,
    selectedCollection,
    onlyFavorites,
    sortBy,
    pageSize,
  ]);

  // Safe non-intrusive '/' shortcut to focus library search when not typing in an input
  useEffect(() => {
    const handleGlobalSlash = (e) => {
      if (isShortcutFormOpen || confirmDialog.isOpen) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        document.activeElement?.isContentEditable;

      if (!isEditable && e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setActiveTab('library');
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 40);
      }
    };

    window.addEventListener('keydown', handleGlobalSlash);
    return () => window.removeEventListener('keydown', handleGlobalSlash);
  }, [isShortcutFormOpen, confirmDialog.isOpen]);

  // Update settings helper
  const updateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  // Filtered & sorted shortcuts
  const filteredShortcuts = useMemo(
    () =>
      filterAndSortShortcuts(shortcuts, {
        searchQuery,
        application: selectedApp,
        category: selectedCategory,
        collectionId: selectedCollection,
        onlyFavorites,
        sortBy,
        platform: settings.platform,
      }),
    [
      shortcuts,
      searchQuery,
      selectedApp,
      selectedCategory,
      selectedCollection,
      onlyFavorites,
      sortBy,
      settings.platform,
    ]
  );

  const totalPages = Math.max(1, Math.ceil(filteredShortcuts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedShortcuts = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredShortcuts.slice(start, start + pageSize);
  }, [filteredShortcuts, safeCurrentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedApp('All');
    setSelectedCategory('All');
    setSelectedCollection('All');
    setOnlyFavorites(false);
    setSortBy('date');
  };

  // Navigate helper with optional preset filters
  const handleNavigate = (tab, filterPatch = {}) => {
    if (filterPatch.onlyFavorites !== undefined) {
      setOnlyFavorites(Boolean(filterPatch.onlyFavorites));
    }
    if (filterPatch.collectionId !== undefined) {
      setSelectedCollection(filterPatch.collectionId);
    }
    if (filterPatch.application !== undefined) {
      setSelectedApp(filterPatch.application);
    }
    setActiveTab(tab);
  };

  // Create or Update Shortcut
  const handleSaveShortcut = (shortcutData) => {
    if (shortcutData.id) {
      setShortcuts((prev) =>
        prev.map((item) =>
          item.id === shortcutData.id
            ? {
                ...item,
                ...shortcutData,
              }
            : item
        )
      );
      addToast({
        title: 'Shortcut Updated',
        message: `"${shortcutData.name}" in ${shortcutData.application} has been updated.`,
        type: 'success',
      });
    } else {
      const newShortcut = {
        ...shortcutData,
        id: generateId('sc'),
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      setShortcuts((prev) => [newShortcut, ...prev]);
      addToast({
        title: 'Shortcut Added',
        message: `"${newShortcut.name}" (${newShortcut.keys.join(' + ')}) saved to your library.`,
        type: 'success',
      });
    }
    setIsShortcutFormOpen(false);
    setEditingShortcut(null);
  };

  // Toggle Favorite
  const handleToggleFavorite = (shortcutId) => {
    const target = shortcuts.find((s) => s.id === shortcutId);
    if (!target) return;
    const nextState = !target.favorite;
    setShortcuts((prev) =>
      prev.map((item) =>
        item.id === shortcutId ? { ...item, favorite: nextState } : item
      )
    );
    addToast({
      title: nextState ? 'Added to Favorites' : 'Removed from Favorites',
      message: `"${target.name}" ${
        nextState ? 'is now pinned to your favorites.' : 'was unpinned.'
      }`,
      type: 'info',
      duration: 2500,
    });
  };

  // Request Delete Shortcut with Confirmation
  const handleRequestDeleteShortcut = (shortcut) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Shortcut?',
      description: `Are you sure you want to permanently delete "${shortcut.name}" (${shortcut.keys.join(
        ' + '
      )}) from ${shortcut.application}?`,
      confirmLabel: 'Delete Shortcut',
      variant: 'danger',
      onConfirm: () => {
        setShortcuts((prev) => prev.filter((item) => item.id !== shortcut.id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast({
          title: 'Shortcut Deleted',
          message: `"${shortcut.name}" was removed from your library.`,
          type: 'success',
        });
      },
    });
  };

  // Copy Combination to Clipboard with resilient fallback
  const handleCopyCombo = async (shortcut, comboText) => {
    const copyWithFallbackTextarea = (text) => {
      const tempArea = document.createElement('textarea');
      tempArea.value = text;
      tempArea.setAttribute('readonly', '');
      tempArea.style.position = 'fixed';
      tempArea.style.opacity = '0';
      document.body.appendChild(tempArea);
      tempArea.focus();
      tempArea.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(tempArea);
      }
      return true;
    };

    try {
      let copiedOk = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(comboText);
          copiedOk = true;
        } catch {
          copiedOk = copyWithFallbackTextarea(comboText);
        }
      } else {
        copiedOk = copyWithFallbackTextarea(comboText);
      }

      if (copiedOk !== false) {
        addToast({
          title: 'Copied to Clipboard',
          message: `${comboText} (${shortcut.name})`,
          type: 'success',
          duration: 2400,
        });
      } else {
        throw new Error('Copy command rejected');
      }
    } catch {
      addToast({
        title: 'Clipboard Error',
        message: `Could not copy automatically. Combination: ${comboText}`,
        type: 'error',
      });
    }
  };

  // Collections Management
  const handleCreateCollection = ({ name, description }) => {
    const newCol = {
      id: generateId('col'),
      name,
      description,
      color: 'indigo',
      createdAt: new Date().toISOString(),
      isStarter: false,
    };
    setCollections((prev) => [...prev, newCol]);
    addToast({
      title: 'Collection Created',
      message: `"${name}" is ready for organizing shortcuts.`,
      type: 'success',
    });
    return newCol;
  };

  const handleRenameCollection = (colId, { name, description }) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, name, description: description ?? col.description }
          : col
      )
    );
    addToast({
      title: 'Collection Updated',
      message: `Renamed collection to "${name}".`,
      type: 'success',
    });
  };

  const handleRequestDeleteCollection = (collection) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete "${collection.name}" Collection?`,
      description: `This removes the "${collection.name}" collection tag. The shortcuts inside it will remain safely in your library.`,
      confirmLabel: 'Delete Collection',
      variant: 'danger',
      onConfirm: () => {
        setCollections((prev) => prev.filter((c) => c.id !== collection.id));
        setShortcuts((prev) =>
          prev.map((sc) => ({
            ...sc,
            collections: Array.isArray(sc.collections)
              ? sc.collections.filter((id) => id !== collection.id)
              : [],
          }))
        );
        if (selectedCollection === collection.id) {
          setSelectedCollection('All');
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast({
          title: 'Collection Deleted',
          message: `"${collection.name}" has been removed.`,
          type: 'success',
        });
      },
    });
  };

  const handleToggleCollectionMembership = (shortcutId, collectionId) => {
    setShortcuts((prev) =>
      prev.map((sc) => {
        if (sc.id !== shortcutId) return sc;
        const current = Array.isArray(sc.collections) ? sc.collections : [];
        const exists = current.includes(collectionId);
        const nextCollections = exists
          ? current.filter((id) => id !== collectionId)
          : [...current, collectionId];
        return { ...sc, collections: nextCollections };
      })
    );
  };

  // Export JSON & CSV
  const handleExportJson = () => {
    const payload = createJsonExportPayload(shortcuts, collections);
    const jsonString = JSON.stringify(payload, null, 2);
    const dateStamp = new Date().toISOString().slice(0, 10);
    triggerFileDownload(jsonString, `keyflow-shortcuts-${dateStamp}.json`, 'application/json');
    addToast({
      title: 'JSON Export Complete',
      message: `Exported ${shortcuts.length} shortcuts and ${collections.length} collections.`,
      type: 'success',
    });
  };

  const handleExportCsv = () => {
    const csvString = shortcutsToCsv(shortcuts, collections);
    const dateStamp = new Date().toISOString().slice(0, 10);
    triggerFileDownload(csvString, `keyflow-shortcuts-${dateStamp}.csv`, 'text/csv');
    addToast({
      title: 'CSV Export Complete',
      message: `Exported ${shortcuts.length} shortcuts as RFC 4180 CSV.`,
      type: 'success',
    });
  };

  // Import JSON or CSV
  const handleImportDataText = (rawText, format = 'json', mode = 'merge') => {
    try {
      const parsed =
        format === 'csv'
          ? parseAndValidateCsvImport(rawText, collections)
          : parseAndValidateJsonImport(rawText);

      const importedShortcuts = parsed.shortcuts;
      const importedCollections = parsed.collections || [];

      if (mode === 'replace') {
        setShortcuts(importedShortcuts);
        if (importedCollections.length > 0) {
          setCollections(importedCollections);
        }
      } else {
        // Merge without duplicating identical IDs
        setShortcuts((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const normalizedIncoming = importedShortcuts.map((item) =>
            existingIds.has(item.id) ? { ...item, id: generateId('sc') } : item
          );
          return [...normalizedIncoming, ...prev];
        });

        if (importedCollections.length > 0) {
          setCollections((prev) => {
            const existingNames = new Set(prev.map((c) => c.name.toLowerCase()));
            const newCols = importedCollections.filter(
              (c) => !existingNames.has(c.name.toLowerCase())
            );
            return [...prev, ...newCols];
          });
        }
      }

      const successMessage = `Successfully imported ${importedShortcuts.length} ${
        importedShortcuts.length === 1 ? 'shortcut' : 'shortcuts'
      } (${mode === 'replace' ? 'replaced library' : 'merged with library'}).`;

      addToast({
        title: 'Import Successful',
        message: successMessage,
        type: 'success',
      });

      return { success: true, message: successMessage };
    } catch (err) {
      const errorMsg = err.message || 'Invalid import data.';
      addToast({
        title: 'Import Rejected',
        message: errorMsg,
        type: 'error',
      });
      return { success: false, error: errorMsg };
    }
  };

  // Restore Sample Dataset
  const handleRequestRestoreSample = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Verified Sample Dataset?',
      description:
        'This will reset your shortcut library to the 22 verified default shortcuts and 4 starter collections. Any unsaved custom changes will be replaced.',
      confirmLabel: 'Restore Sample Data',
      variant: 'primary',
      onConfirm: () => {
        const restored = restoreSampleDataset();
        setShortcuts(restored.shortcuts);
        setCollections(restored.collections);
        handleResetFilters();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast({
          title: 'Sample Dataset Restored',
          message: `Restored ${restored.shortcuts.length} verified shortcuts across 5 applications.`,
          type: 'success',
        });
      },
    });
  };

  // Clear All Stored Data
  const handleRequestClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Locally Stored Data?',
      description:
        'This action will permanently remove all shortcuts from your browser localStorage. Consider exporting a JSON backup first.',
      confirmLabel: 'Yes, Clear All Data',
      variant: 'danger',
      onConfirm: () => {
        const cleared = clearAllStoredData();
        setShortcuts(cleared.shortcuts);
        setCollections(cleared.collections);
        handleResetFilters();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        addToast({
          title: 'Workspace Cleared',
          message: 'All shortcuts have been removed from localStorage.',
          type: 'warning',
        });
      },
    });
  };

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      sidebarCollapsed={settings.sidebarCollapsed}
      onToggleSidebarCollapse={() =>
        updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })
      }
      mobileMenuOpen={mobileMenuOpen}
      onOpenMobileMenu={() => setMobileMenuOpen(true)}
      onCloseMobileMenu={() => setMobileMenuOpen(false)}
      platform={settings.platform}
      theme={settings.theme}
      onTogglePlatform={() =>
        updateSettings({
          platform: settings.platform === 'mac' ? 'windows' : 'mac',
        })
      }
      onToggleTheme={() =>
        updateSettings({
          theme: settings.theme === 'dark' ? 'light' : 'dark',
        })
      }
      shortcuts={shortcuts}
      collections={collections}
      selectedCollectionId={selectedCollection}
      onSelectCollectionFilter={(colId) => setSelectedCollection(colId)}
      onOpenAddShortcut={() => {
        setEditingShortcut(null);
        setIsShortcutFormOpen(true);
      }}
      onQuickSearchClick={() => {
        setActiveTab('library');
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }}
    >
      {/* SECTION 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <DashboardStats
          shortcuts={shortcuts}
          collections={collections}
          platform={settings.platform}
          onOpenAddShortcut={() => {
            setEditingShortcut(null);
            setIsShortcutFormOpen(true);
          }}
          onNavigate={handleNavigate}
          onToggleFavorite={handleToggleFavorite}
          onEditShortcut={(sc) => {
            setEditingShortcut(sc);
            setIsShortcutFormOpen(true);
          }}
          onDeleteShortcut={handleRequestDeleteShortcut}
          onCopyCombo={handleCopyCombo}
          onToggleCollectionMembership={handleToggleCollectionMembership}
          onRestoreSampleData={handleRequestRestoreSample}
        />
      )}

      {/* SECTION 2: SHORTCUT LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedApp={selectedApp}
            onAppChange={setSelectedApp}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedCollection={selectedCollection}
            onCollectionChange={setSelectedCollection}
            onlyFavorites={onlyFavorites}
            onToggleOnlyFavorites={() => setOnlyFavorites((prev) => !prev)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={settings.viewMode}
            onViewModeChange={(mode) => updateSettings({ viewMode: mode })}
            collections={collections}
            allShortcuts={shortcuts}
            totalMatching={filteredShortcuts.length}
            onResetFilters={handleResetFilters}
            searchInputRef={searchInputRef}
          />

          {filteredShortcuts.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
                <Keyboard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {shortcuts.length === 0
                  ? 'No Shortcuts in Your Library Yet'
                  : 'No Matching Shortcuts Found'}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {shortcuts.length === 0
                  ? 'Add your first custom shortcut or restore the sample reference library.'
                  : 'Try adjusting your search query, application filter, or category filter.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                {shortcuts.length === 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingShortcut(null);
                        setIsShortcutFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Shortcut</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestRestoreSample}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Sample Dataset</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear All Filters</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {settings.viewMode === 'list' ? (
                <ShortcutTable
                  shortcuts={paginatedShortcuts}
                  platform={settings.platform}
                  collections={collections}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={(sc) => {
                    setEditingShortcut(sc);
                    setIsShortcutFormOpen(true);
                  }}
                  onDelete={handleRequestDeleteShortcut}
                  onCopyCombo={handleCopyCombo}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedShortcuts.map((shortcut) => (
                    <ShortcutCard
                      key={shortcut.id}
                      shortcut={shortcut}
                      platform={settings.platform}
                      collections={collections}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={(sc) => {
                        setEditingShortcut(sc);
                        setIsShortcutFormOpen(true);
                      }}
                      onDelete={handleRequestDeleteShortcut}
                      onCopyCombo={handleCopyCombo}
                      onToggleCollectionMembership={handleToggleCollectionMembership}
                    />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Items per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    aria-label="Items per page"
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                      Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* SECTION 3: COLLECTIONS */}
      {activeTab === 'collections' && (
        <CollectionManager
          collections={collections}
          shortcuts={shortcuts}
          platform={settings.platform}
          onCreateCollection={handleCreateCollection}
          onRenameCollection={handleRenameCollection}
          onDeleteCollection={handleRequestDeleteCollection}
          onToggleCollectionMembership={handleToggleCollectionMembership}
          onNavigateToLibraryCollection={(colId) =>
            handleNavigate('library', { collectionId: colId })
          }
        />
      )}

      {/* SECTION 4: SETTINGS */}
      {activeTab === 'settings' && (
        <SettingsPanel
          settings={settings}
          shortcutsCount={shortcuts.length}
          collectionsCount={collections.length}
          onUpdateSettings={updateSettings}
          onExportJson={handleExportJson}
          onExportCsv={handleExportCsv}
          onImportDataText={handleImportDataText}
          onRequestRestoreSample={handleRequestRestoreSample}
          onRequestClearAll={handleRequestClearAll}
        />
      )}

      {/* ADD / EDIT SHORTCUT MODAL */}
      <ShortcutForm
        isOpen={isShortcutFormOpen}
        initialShortcut={editingShortcut}
        allShortcuts={shortcuts}
        collections={collections}
        platform={settings.platform}
        onSave={handleSaveShortcut}
        onClose={() => {
          setIsShortcutFormOpen(false);
          setEditingShortcut(null);
        }}
      />

      {/* DESTRUCTIVE / RESTORE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <KeyFlowWorkspace />
    </ToastProvider>
  );
}
