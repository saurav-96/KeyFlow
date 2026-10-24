import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Keyboard,
  Star,
  AlertTriangle,
  Info,
  Check,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import KeycapCombo from './KeycapCombo';
import { DEFAULT_APPLICATIONS, DEFAULT_CATEGORIES } from '../data/seedData';
import {
  parseKeyCombo,
  normalizeKeyToken,
  validateShortcutInput,
  findDuplicateShortcuts,
  isBrowserReservedCombo,
} from '../utils/shortcutValidation';

export default function ShortcutForm({
  isOpen,
  initialShortcut = null,
  allShortcuts = [],
  collections = [],
  platform = 'windows',
  onSave,
  onClose,
}) {
  const isEditing = Boolean(initialShortcut?.id);

  const [name, setName] = useState('');
  const [application, setApplication] = useState('VS Code');
  const [customApp, setCustomApp] = useState('');
  const [isCustomAppMode, setIsCustomAppMode] = useState(false);
  const [category, setCategory] = useState('Productivity');
  const [keysInput, setKeysInput] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [platformNote, setPlatformNote] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [preRecordKeys, setPreRecordKeys] = useState('');
  const [errors, setErrors] = useState({});

  const recorderButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      return;
    }

    if (initialShortcut) {
      setName(initialShortcut.name || '');
      const appName = initialShortcut.application || 'VS Code';
      const isPresetApp = DEFAULT_APPLICATIONS.some(
        (a) => a.toLowerCase() === appName.toLowerCase()
      );
      if (isPresetApp) {
        setApplication(appName);
        setIsCustomAppMode(false);
        setCustomApp('');
      } else {
        setApplication('__custom__');
        setIsCustomAppMode(true);
        setCustomApp(appName);
      }
      setCategory(initialShortcut.category || 'Productivity');
      setKeysInput(
        Array.isArray(initialShortcut.keys)
          ? initialShortcut.keys.join(' + ')
          : String(initialShortcut.keys || '')
      );
      setDescription(initialShortcut.description || '');
      setTagsInput(
        Array.isArray(initialShortcut.tags) ? initialShortcut.tags.join(', ') : ''
      );
      setPlatformNote(initialShortcut.platformNote || '');
      setFavorite(Boolean(initialShortcut.favorite));
      setSelectedCollections(
        Array.isArray(initialShortcut.collections) ? [...initialShortcut.collections] : []
      );
    } else {
      setName('');
      setApplication('VS Code');
      setCustomApp('');
      setIsCustomAppMode(false);
      setCategory('Productivity');
      setKeysInput('');
      setDescription('');
      setTagsInput('');
      setPlatformNote('');
      setFavorite(false);
      setSelectedCollections([]);
    }
    setErrors({});
    setIsRecording(false);
  }, [isOpen, initialShortcut]);

  // Isolated interactive key combination capture ONLY when `isRecording` is true
  useEffect(() => {
    if (!isOpen || !isRecording) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels recording and restores previous key state
      if (e.key === 'Escape') {
        setKeysInput(preRecordKeys);
        setIsRecording(false);
        return;
      }

      // Backspace or Delete clears the recorded combination if no modifiers are held
      if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        !e.metaKey
      ) {
        setKeysInput('');
        return;
      }

      const captured = [];
      if (e.ctrlKey) captured.push('Ctrl');
      if (e.metaKey) captured.push(platform === 'mac' ? 'Cmd' : 'Win');
      if (e.altKey) captured.push('Alt');
      if (e.shiftKey) captured.push('Shift');

      const rawKey = e.key;
      const isModifierKey = ['Control', 'Shift', 'Alt', 'Meta', 'OS'].includes(rawKey);

      if (!isModifierKey) {
        const normalizedMainKey = normalizeKeyToken(rawKey, platform);
        if (normalizedMainKey && !captured.includes(normalizedMainKey)) {
          captured.push(normalizedMainKey);
        }
        if (captured.length > 0) {
          setKeysInput(captured.join(' + '));
          setIsRecording(false);
          if (errors.keys) {
            setErrors((prev) => ({ ...prev, keys: undefined }));
          }
        }
      } else if (captured.length > 0) {
        // Show live modifier preview while holding modifiers
        setKeysInput(captured.join(' + '));
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, isRecording, preRecordKeys, platform, errors.keys]);

  if (!isOpen) return null;

  const resolvedApp = isCustomAppMode ? customApp.trim() : application;
  const parsedKeys = parseKeyCombo(keysInput, platform);
  const duplicates = findDuplicateShortcuts(
    allShortcuts,
    { name, application: resolvedApp, keys: parsedKeys },
    initialShortcut?.id || null
  );
  const reservedWarning = isBrowserReservedCombo(parsedKeys);

  const toggleModifierToken = (modToken) => {
    const current = parseKeyCombo(keysInput, platform);
    const exists = current.includes(modToken);
    const updated = exists
      ? current.filter((k) => k !== modToken)
      : [...current, modToken];
    setKeysInput(parseKeyCombo(updated, platform).join(' + '));
    if (errors.keys) {
      setErrors((prev) => ({ ...prev, keys: undefined }));
    }
  };

  const toggleCollectionSelection = (colId) => {
    setSelectedCollections((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRecording) {
      setIsRecording(false);
    }

    const validation = validateShortcutInput({
      name,
      application: resolvedApp,
      category,
      keys: keysInput,
      description,
      tags: tagsInput,
      favorite,
      collections: selectedCollections,
      platformNote,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave?.({
      ...(initialShortcut || {}),
      ...validation.normalizedData,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-form-title"
      onClick={() => {
        if (!isRecording) onClose?.();
      }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shadow-indigo-600/30">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="shortcut-form-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                {isEditing ? 'Edit Keyboard Shortcut' : 'Add New Keyboard Shortcut'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record a combination interactively or type it manually.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Row 1: Shortcut Name & Favorite */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            <div className="sm:col-span-9">
              <label
                htmlFor="sc-name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Shortcut Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="sc-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g., Toggle Integrated Terminal"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-500/30'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="sm:col-span-3 sm:pt-6">
              <button
                type="button"
                onClick={() => setFavorite((prev) => !prev)}
                aria-pressed={favorite}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  favorite
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <Star
                  className="w-4 h-4 text-amber-500"
                  fill={favorite ? 'currentColor' : 'none'}
                />
                <span>{favorite ? 'Favorited' : 'Favorite'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Application & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sc-app"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Application <span className="text-rose-500">*</span>
              </label>
              <select
                id="sc-app"
                value={isCustomAppMode ? '__custom__' : application}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setIsCustomAppMode(true);
                  } else {
                    setIsCustomAppMode(false);
                    setApplication(val);
                  }
                  if (errors.application) {
                    setErrors((prev) => ({ ...prev, application: undefined }));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {DEFAULT_APPLICATIONS.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
                <option value="__custom__">+ Custom Application...</option>
              </select>

              {isCustomAppMode && (
                <input
                  type="text"
                  value={customApp}
                  onChange={(e) => {
                    setCustomApp(e.target.value);
                    if (errors.application) {
                      setErrors((prev) => ({ ...prev, application: undefined }));
                    }
                  }}
                  placeholder="Enter custom app name (e.g., Notion, Slack, Blender)"
                  aria-label="Custom application name"
                  className={`mt-2 w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    errors.application
                      ? 'border-rose-400 focus:ring-rose-500/30'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500'
                  }`}
                />
              )}
              {errors.application && (
                <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.application}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="sc-category"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="sc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Interactive Key Combination Capture Box */}
          <div className="rounded-2xl p-4 bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label
                  htmlFor="sc-keys"
                  className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  Key Combination <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click &ldquo;Record Keys&rdquo; and press a shortcut, or type keys separated by{' '}
                  <code className="font-mono text-indigo-600 dark:text-indigo-400">+</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={() => {
                      setKeysInput(preRecordKeys);
                      setIsRecording(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white shadow-sm animate-pulse"
                  >
                    <span>Listening... (Esc to cancel)</span>
                  </button>
                ) : (
                  <button
                    ref={recorderButtonRef}
                    type="button"
                    onClick={() => {
                      setPreRecordKeys(keysInput);
                      setIsRecording(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Record Keys</span>
                  </button>
                )}

                {keysInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeysInput('');
                      setIsRecording(false);
                    }}
                    title="Clear keys"
                    aria-label="Clear key combination"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Manual Input + Quick Modifier Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7">
                <input
                  id="sc-keys"
                  type="text"
                  value={keysInput}
                  onChange={(e) => {
                    setKeysInput(e.target.value);
                    if (errors.keys) setErrors((prev) => ({ ...prev, keys: undefined }));
                  }}
                  placeholder="e.g., Ctrl + Shift + P"
                  className={`w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                    isRecording
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                      : errors.keys
                      ? 'border-rose-400 focus:ring-rose-500/30'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Quick Modifier Toggle Buttons */}
              <div className="sm:col-span-5 flex items-center flex-wrap gap-1">
                {['Ctrl', 'Shift', 'Alt', platform === 'mac' ? 'Cmd' : 'Win'].map((mod) => {
                  const isActive = parsedKeys.includes(mod);
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleModifierToken(mod)}
                      className={`px-2 py-1 rounded-lg font-mono text-[11px] font-semibold border transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      +{mod}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Keycap Preview */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Visual Preview ({platform === 'mac' ? 'macOS' : 'Windows/Linux'}):
              </span>
              <KeycapCombo keys={parsedKeys} platform={platform} active={isRecording} />
            </div>

            {errors.keys && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.keys}
              </p>
            )}

            {reservedWarning && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  Note: <strong>{parsedKeys.join(' + ')}</strong> is commonly reserved by web
                  browsers or the OS window manager, so browsers may intercept it during live
                  capture. You can still save it as a reference entry.
                </span>
              </div>
            )}
          </div>

          {/* Duplicate Warning (Non-blocking) */}
          {duplicates.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">Potential Duplicate Entry Detected</p>
                <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                  <strong>{resolvedApp}</strong> already has a matching shortcut:{' '}
                  <span className="underline font-medium">
                    {duplicates.map((d) => `${d.name} (${d.keys.join(' + ')})`).join(', ')}
                  </span>
                  . You can still save this shortcut if it is a legitimate alternative or
                  context-specific command.
                </p>
              </div>
            </div>
          )}

          {/* Row 4: Description */}
          <div>
            <label
              htmlFor="sc-description"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="sc-description"
              rows={2}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              placeholder="Explain concisely what this shortcut does and when to use it..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-rose-400 focus:ring-rose-500/30'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/30 focus:border-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.description}
              </p>
            )}
          </div>

          {/* Row 5: Collections & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Assign to Collections (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[42px]">
                {collections.map((col) => {
                  const selected = selectedCollections.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => toggleCollectionSelection(col.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="sc-tags"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Tags (Optional, comma-separated)
              </label>
              <input
                id="sc-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g., terminal, debug, refactor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Optional Platform Note */}
          <div>
            <label
              htmlFor="sc-platform-note"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Platform Variation Note (Optional)
            </label>
            <input
              id="sc-platform-note"
              type="text"
              value={platformNote}
              onChange={(e) => setPlatformNote(e.target.value)}
              placeholder="e.g., Windows: Ctrl + Shift + P • macOS: ⌘ + ⇧ + P"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Safety & Reference Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 px-3 py-2 rounded-xl">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              Saved combinations are personal reference records for learning and lookup—they do
              not override or register global OS system shortcuts.
            </span>
          </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="shrink-0 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Save Shortcut'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
