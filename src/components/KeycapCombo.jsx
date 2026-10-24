import React from 'react';
import { getDisplayKeys } from '../utils/shortcutValidation';

const MODIFIER_PATTERNS = /^(Ctrl|⌃ Ctrl|Cmd|⌘ Cmd|Alt|⌥ Opt|Opt|Shift|⇧ Shift|Win)$/i;

/**
 * Renders realistic 3D keyboard keycaps for a shortcut combination.
 */
export default function KeycapCombo({
  shortcut,
  keys,
  platform = 'windows',
  size = 'md', // 'sm' | 'md' | 'lg'
  active = false,
  className = '',
}) {
  const displayKeys = shortcut
    ? getDisplayKeys(shortcut, platform, true)
    : getDisplayKeys({ keys: Array.isArray(keys) ? keys : [] }, platform, true);

  if (!displayKeys || displayKeys.length === 0) {
    return (
      <span className="text-xs italic text-slate-400 dark:text-slate-500">
        No keys assigned
      </span>
    );
  }

  const sizeClass =
    size === 'sm' ? 'keycap-sm' : size === 'lg' ? 'keycap-lg' : '';
  const activeClass = active ? 'keycap-active' : '';

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 ${className}`}
      aria-label={`Shortcut combination: ${displayKeys.join(' plus ')}`}
    >
      {displayKeys.map((keyLabel, index) => {
        const isMod = MODIFIER_PATTERNS.test(keyLabel);
        return (
          <React.Fragment key={`${keyLabel}-${index}`}>
            <kbd
              className={`keycap ${isMod ? 'keycap-modifier' : ''} ${sizeClass} ${activeClass}`}
            >
              {keyLabel}
            </kbd>
            {index < displayKeys.length - 1 && (
              <span
                aria-hidden="true"
                className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-0.5 select-none"
              >
                +
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
