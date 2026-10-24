import React, { useState } from 'react';
import { Star, Copy, Check, Pencil, Trash2 } from 'lucide-react';
import KeycapCombo from './KeycapCombo';
import { getAppStyle } from './ShortcutCard';
import { formatComboString } from '../utils/shortcutValidation';

export default function ShortcutTable({
  shortcuts = [],
  platform = 'windows',
  collections = [],
  onToggleFavorite,
  onEdit,
  onDelete,
  onCopyCombo,
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (shortcut) => {
    const comboText = formatComboString(shortcut, platform);
    await onCopyCombo?.(shortcut, comboText);
    setCopiedId(shortcut.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === shortcut.id ? null : prev));
    }, 1800);
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/90 shadow-card-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 pl-5 pr-2 w-10">Fav</th>
              <th className="py-3.5 px-3">Shortcut & Description</th>
              <th className="py-3.5 px-3">Application</th>
              <th className="py-3.5 px-3 hidden md:table-cell">Category</th>
              <th className="py-3.5 px-3">Key Combination</th>
              <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
            {shortcuts.map((shortcut) => {
              const appStyle = getAppStyle(shortcut.application);
              const isCopied = copiedId === shortcut.id;
              const assignedCols = collections.filter(
                (c) => Array.isArray(shortcut.collections) && shortcut.collections.includes(c.id)
              );

              return (
                <tr
                  key={shortcut.id}
                  className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 pl-5 pr-2 align-middle">
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
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                          : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                      }`}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={shortcut.favorite ? 'currentColor' : 'none'}
                      />
                    </button>
                  </td>

                  <td className="py-3.5 px-3 align-middle max-w-xs sm:max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {shortcut.name}
                      </span>
                      {shortcut.isCustom && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {shortcut.description}
                    </p>
                    {assignedCols.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {assignedCols.map((col) => (
                          <span
                            key={col.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                          >
                            {col.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${appStyle.badge}`}
                    >
                      {appStyle.icon}
                      <span>{shortcut.application}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 align-middle whitespace-nowrap hidden md:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {shortcut.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <KeycapCombo shortcut={shortcut} platform={platform} size="sm" />
                  </td>

                  <td className="py-3.5 pl-3 pr-5 align-middle whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(shortcut)}
                        aria-label={`Copy key combination for ${shortcut.name}`}
                        title="Copy combination"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isCopied
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
