import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Command,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Code,
} from 'lucide-react';
import KeycapCombo from './KeycapCombo';

export default function SettingsPanel({
  settings,
  shortcutsCount = 0,
  collectionsCount = 0,
  onUpdateSettings,
  onExportJson,
  onExportCsv,
  onImportDataText,
  onRequestRestoreSample,
  onRequestClearAll,
}) {
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [pasteFormat, setPasteFormat] = useState('json'); // 'json' | 'csv'
  const [pasteText, setPasteText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [showRawImporter, setShowRawImporter] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    try {
      const text = await file.text();
      const format = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
      const result = onImportDataText?.(text, format, importMode);
      if (result?.success) {
        setImportSuccess(result.message);
      } else if (result?.error) {
        setImportError(result.error);
      }
    } catch (err) {
      setImportError(err.message || 'Failed to read imported file.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasteImport = (e) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess('');

    const result = onImportDataText?.(pasteText, pasteFormat, importMode);
    if (result?.success) {
      setImportSuccess(result.message);
      setPasteText('');
    } else if (result?.error) {
      setImportError(result.error);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1. Appearance & Theme */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-6 shadow-card-subtle">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Appearance & Theme
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Choose between our crisp light studio surface or low-glare obsidian dark theme.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onUpdateSettings({ theme: 'light' })}
            aria-pressed={settings.theme === 'light'}
            className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all ${
              settings.theme === 'light'
                ? 'bg-indigo-50/60 border-indigo-500 ring-1 ring-indigo-500/20 dark:bg-indigo-950/40'
                : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Light Theme
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-contrast alabaster cards with subtle slate borders
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            aria-pressed={settings.theme === 'dark'}
            className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all ${
              settings.theme === 'dark'
                ? 'bg-indigo-50/60 border-indigo-500 ring-1 ring-indigo-500/20 dark:bg-indigo-950/40'
                : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Dark Theme
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deep slate surfaces tailored for night coding sessions
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 2. Keyboard Modifier Layout Preference */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-6 shadow-card-subtle">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Keyboard Layout & Modifier Preference
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Select how modifier keycaps and copied combinations are formatted across the entire app.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onUpdateSettings({ platform: 'windows' })}
            aria-pressed={settings.platform === 'windows'}
            className={`flex flex-col justify-between gap-3 p-4 rounded-xl border text-left transition-all ${
              settings.platform === 'windows'
                ? 'bg-indigo-50/60 border-indigo-500 ring-1 ring-indigo-500/20 dark:bg-indigo-950/40'
                : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Windows / Linux Standard
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Displays Ctrl, Alt, Shift, and Win keycaps
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <KeycapCombo keys={['Ctrl', 'Shift', 'P']} platform="windows" size="sm" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onUpdateSettings({ platform: 'mac' })}
            aria-pressed={settings.platform === 'mac'}
            className={`flex flex-col justify-between gap-3 p-4 rounded-xl border text-left transition-all ${
              settings.platform === 'mac'
                ? 'bg-indigo-50/60 border-indigo-500 ring-1 ring-indigo-500/20 dark:bg-indigo-950/40'
                : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <Command className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  macOS Apple Layout
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Displays ⌘ Cmd, ⌥ Opt, ⇧ Shift, and ⌃ Ctrl keycaps
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <KeycapCombo
                shortcut={{ keys: ['Ctrl', 'Shift', 'P'], macKeys: ['Cmd', 'Shift', 'P'] }}
                platform="mac"
                size="sm"
              />
            </div>
          </button>
        </div>
      </section>

      {/* 3. Import & Export Controls */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-6 shadow-card-subtle space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Backup, Import & Export
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Export your entire library ({shortcutsCount} shortcuts, {collectionsCount}{' '}
            collections) as validated JSON or RFC 4180-escaped CSV, or import existing backups.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onExportJson}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-950 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Export as JSON
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full lossless backup with collections & tags
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/60 dark:bg-slate-950 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  Export as CSV
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Spreadsheet-ready with RFC 4180 quote escaping
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
          </button>
        </div>

        {/* Import Section */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Import Shortcuts (.json or .csv)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All imported entries are strictly validated before modifying local storage.
              </p>
            </div>

            {/* Merge vs Replace Mode */}
            <div
              className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium shrink-0"
              role="group"
              aria-label="Import mode"
            >
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  importMode === 'merge'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Merge with existing
              </button>
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  importMode === 'replace'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Replace library
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,application/json,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="keyflow-file-import"
            />
            <label
              htmlFor="keyflow-file-import"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Choose JSON or CSV File</span>
            </label>

            <button
              type="button"
              onClick={() => setShowRawImporter((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>{showRawImporter ? 'Hide Raw Text Importer' : 'Paste JSON / CSV Text'}</span>
            </button>
          </div>

          {/* Raw JSON / CSV Paste Importer */}
          {showRawImporter && (
            <form
              onSubmit={handlePasteImport}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Paste Raw Payload for Validation & Import
                </span>
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPasteFormat('json')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      pasteFormat === 'json'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasteFormat('csv')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      pasteFormat === 'csv'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    CSV
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                aria-label="Raw JSON or CSV import payload"
                placeholder={
                  pasteFormat === 'json'
                    ? '[{"name": "Quick Terminal", "application": "VS Code", "category": "Developer Tools", "keys": ["Ctrl", "`"], "description": "Toggle terminal"}]'
                    : 'Name,Application,Category,Windows Keys,Description\n"Quick Open",VS Code,Navigation,"Ctrl + P","Open file by name"'
                }
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Validate & Import {pasteFormat.toUpperCase()}
                </button>
              </div>
            </form>
          )}

          {importError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div
              role="status"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{importSuccess}</span>
            </div>
          )}
        </div>
      </section>

      {/* 4. Data Reset & Destructive Zone */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-6 shadow-card-subtle space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Dataset Management & Reset
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Restore the built-in verified reference dataset or wipe all locally stored shortcuts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Restore Verified Sample Dataset
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Re-populate KeyFlow with 22 verified shortcuts for VS Code, Chrome, Windows, Figma,
              and Photoshop.
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestRestoreSample}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 shrink-0 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Sample Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60">
          <div>
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Clear All Locally Stored Data
            </p>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
              Permanently remove all saved shortcuts and custom collections from this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestClearAll}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs shadow-rose-600/20 shrink-0 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </section>

      {/* 5. Privacy & Local Storage Notice */}
      <section className="rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/50 p-5 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            100% Local-First Privacy & Keyboard Safety Notice
          </p>
          <p>
            KeyFlow stores your shortcuts, collections, and preferences exclusively in your
            browser&apos;s <code className="font-mono">localStorage</code>. No data is ever
            transmitted to external servers, analytics trackers, or third-party APIs. Key
            combinations are captured only when you explicitly click{' '}
            <strong>&ldquo;Record Keys&rdquo;</strong> inside the shortcut form, and saved
            combinations serve as personal reference records rather than globally active OS hooks.
          </p>
        </div>
      </section>
    </div>
  );
}
