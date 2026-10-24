import React, { useState } from 'react';
import {
  Star,
  Copy,
  Check,
  Pencil,
  Trash2,
  FolderPlus,
  Code2,
  Globe,
  Monitor,
  Figma as FigmaIcon,
  Palette,
  Sparkles,
  Tag,
} from 'lucide-react';
import KeycapCombo from './KeycapCombo';
import { formatComboString } from '../utils/shortcutValidation';

export function getAppStyle(application = '') {
  const lower = application.toLowerCase();
  if (lower.includes('vs code') || lower.includes('vscode')) {
    return {
      badge:
        'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/70',
      icon: <Code2 className="w-3.5 h-3.5" />,
    };
  }
  if (lower.includes('chrome') || lower.includes('browser')) {
    return {
      badge:
        'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
      icon: <Globe className="w-3.5 h-3.5" />,
    };
  }
  if (lower.includes('windows') || lower.includes('system') || lower.includes('macos')) {
    return {
      badge:
        'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70',
      icon: <Monitor className="w-3.5 h-3.5" />,
    };
  }
  if (lower.includes('figma')) {
    return {
      badge:
        'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/70',
      icon: <FigmaIcon className="w-3.5 h-3.5" />,
    };
  }
  if (lower.includes('photoshop') || lower.includes('adobe')) {
    return {
      badge:
        'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/70',
      icon: <Palette className="w-3.5 h-3.5" />,
    };
  }
  return {
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  };
}

export default function ShortcutCard({
  shortcut,
  platform = 'windows',
  collections = [],
  onToggleFavorite,
  onEdit,
  onDelete,
  onCopyCombo,
  onToggleCollectionMembership,
}) {
  const [copied, setCopied] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);

  const appStyle = getAppStyle(shortcut.application);

  const assignedCollections = collections.filter(
    (col) => Array.isArray(shortcut.collections) && shortcut.collections.includes(col.id)
  );

  const handleCopy = async () => {
    const comboText = formatComboString(shortcut, platform);
    await onCopyCombo?.(shortcut, comboText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 p-5 shadow-card-subtle hover:shadow-card-hover hover:border-indigo-200 dark:hover:border-indigo-900/80 transition-all duration-200">
      <div>
        {/* Top Metadata Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5 min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${appStyle.badge}`}
            >
              {appStyle.icon}
              <span className="truncate max-w-[120px]">{shortcut.application}</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {shortcut.category}
            </span>
            {shortcut.isCustom && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                Custom
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite?.(shortcut.id)}
            aria-label={
              shortcut.favorite
                ? `Remove ${shortcut.name} from favorites`
                : `Add ${shortcut.name} to favorites`
            }
            className={`p-1.5 rounded-lg transition-colors ${
              shortcut.favorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star
              className="w-4 h-4"
              fill={shortcut.favorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Shortcut Title & Keycap Box */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {shortcut.name}
        </h3>

        <div className="mt-3 p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <KeycapCombo shortcut={shortcut} platform={platform} />
          <button
            type="button"
            onClick={handleCopy}
            title="Copy key combination"
            aria-label={`Copy key combination for ${shortcut.name}`}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              copied
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
          {shortcut.description}
        </p>

        {/* Platform variation note if present */}
        {shortcut.platformNote && (
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {shortcut.platformNote}
          </p>
        )}
      </div>

      {/* Footer: Tags, Collections & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center flex-wrap gap-1 min-w-0">
          {assignedCollections.map((col) => (
            <span
              key={col.id}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
            >
              {col.name}
            </span>
          ))}
          {Array.isArray(shortcut.tags) &&
            shortcut.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/70"
              >
                <Tag className="w-2.5 h-2.5 opacity-70" />
                {tag}
              </span>
            ))}
        </div>

        {/* Action Toolbar */}
        <div className="relative flex items-center gap-1 shrink-0">
          {onToggleCollectionMembership && collections.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCollectionMenu((prev) => !prev)}
                aria-label={`Manage collections for ${shortcut.name}`}
                title="Add/remove from collections"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
              </button>

              {showCollectionMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowCollectionMenu(false)}
                  />
                  <div className="absolute right-0 bottom-9 z-30 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5">
                    <p className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Collections
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {collections.map((col) => {
                        const isMember =
                          Array.isArray(shortcut.collections) &&
                          shortcut.collections.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() =>
                              onToggleCollectionMembership(shortcut.id, col.id)
                            }
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isMember
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{col.name}</span>
                            {isMember && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onEdit?.(shortcut)}
            aria-label={`Edit ${shortcut.name}`}
            title="Edit shortcut"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(shortcut)}
            aria-label={`Delete ${shortcut.name}`}
            title="Delete shortcut"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
