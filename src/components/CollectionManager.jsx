import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import KeycapCombo from './KeycapCombo';
import { getAppStyle } from './ShortcutCard';

export default function CollectionManager({
  collections = [],
  shortcuts = [],
  platform = 'windows',
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onToggleCollectionMembership,
  onNavigateToLibraryCollection,
}) {
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [createError, setCreateError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [activeCollectionId, setActiveCollectionId] = useState(
    collections[0]?.id || null
  );
  const [assignSearch, setAssignSearch] = useState('');

  const selectedCollection =
    collections.find((c) => c.id === activeCollectionId) || collections[0] || null;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmedName = newColName.trim();
    if (!trimmedName) {
      setCreateError('Collection name is required.');
      return;
    }
    const duplicate = collections.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      setCreateError('A collection with this name already exists.');
      return;
    }

    const created = onCreateCollection?.({
      name: trimmedName,
      description: newColDesc.trim() || 'Personal shortcut collection.',
    });
    setNewColName('');
    setNewColDesc('');
    setCreateError('');
    if (created?.id) {
      setActiveCollectionId(created.id);
    }
  };

  const startEditing = (col) => {
    setEditingId(col.id);
    setEditName(col.name);
    setEditDesc(col.description || '');
  };

  const saveEdit = (colId) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    onRenameCollection?.(colId, {
      name: trimmed,
      description: editDesc.trim(),
    });
    setEditingId(null);
  };

  const filteredShortcutsForAssignment = shortcuts.filter((sc) => {
    if (!assignSearch.trim()) return true;
    const q = assignSearch.trim().toLowerCase();
    return (
      (sc.name || '').toLowerCase().includes(q) ||
      (sc.application || '').toLowerCase().includes(q) ||
      (sc.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Create Collection Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-5 sm:p-6 shadow-card-subtle">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Create New Collection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Group shortcuts by project, role, or workflow
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5" noValidate>
            <div>
              <label
                htmlFor="new-col-name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Collection Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="new-col-name"
                type="text"
                value={newColName}
                onChange={(e) => {
                  setNewColName(e.target.value);
                  if (createError) setCreateError('');
                }}
                placeholder="e.g., Video Editing, Terminal Mastery, Daily Top 10"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="new-col-desc"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Description (Optional)
              </label>
              <input
                id="new-col-desc"
                type="text"
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                placeholder="Short summary of this collection..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            {createError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {createError}
              </p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Collection</span>
            </button>
          </form>
        </div>

        {/* Collections List */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-5 sm:p-6 shadow-card-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-900/60">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Your Collections ({collections.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a collection below to manage its assigned shortcuts
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {collections.map((col) => {
              const memberCount = shortcuts.filter(
                (s) => Array.isArray(s.collections) && s.collections.includes(col.id)
              ).length;
              const isSelected = selectedCollection?.id === col.id;
              const isEditingThis = editingId === col.id;

              return (
                <div
                  key={col.id}
                  onClick={() => {
                    if (!isEditingThis) setActiveCollectionId(col.id);
                  }}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  {isEditingThis ? (
                    <div
                      className="space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label="Edit collection name"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-400 text-xs font-semibold text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        aria-label="Edit collection description"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                      />
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(col.id)}
                          aria-label="Save collection name"
                          className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {col.name}
                            </h3>
                            {col.isStarter && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                                Starter
                              </span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
                            {memberCount} {memberCount === 1 ? 'shortcut' : 'shortcuts'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {col.description || 'Personal shortcut collection'}
                        </p>
                      </div>

                      <div
                        className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onNavigateToLibraryCollection?.(col.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>Filter in Library</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(col)}
                            aria-label={`Rename ${col.name}`}
                            title="Rename collection"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCollection?.(col)}
                            aria-label={`Delete ${col.name}`}
                            title="Delete collection"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Panel: Assign / Manage Shortcuts in Selected Collection */}
      {selectedCollection && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-5 sm:p-6 shadow-card-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Collection Membership Manager</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {selectedCollection.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any shortcut below to add or remove it from{' '}
                <strong>{selectedCollection.name}</strong>. Shortcuts can belong to multiple
                collections simultaneously.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Filter shortcuts to assign..."
                aria-label="Filter shortcuts to assign to collection"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {filteredShortcutsForAssignment.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
              No shortcuts match your filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredShortcutsForAssignment.map((sc) => {
                const isIncluded =
                  Array.isArray(sc.collections) &&
                  sc.collections.includes(selectedCollection.id);
                const appStyle = getAppStyle(sc.application);

                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() =>
                      onToggleCollectionMembership?.(sc.id, selectedCollection.id)
                    }
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isIncluded
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-700'
                        : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${appStyle.badge}`}
                        >
                          {sc.application}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {sc.name}
                        </span>
                      </div>
                      <KeycapCombo shortcut={sc} platform={platform} size="sm" />
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                        isIncluded
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
