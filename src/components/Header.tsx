/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, UploadCloud, SlidersHorizontal, Palette, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenMoodboard: () => void;
  savedItemsCount: number;
  activeStyleName: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenMoodboard,
  savedItemsCount,
  activeStyleName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 shadow-md shadow-amber-900/30 ring-1 ring-amber-500/30 shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif text-base font-bold tracking-wider text-stone-100 sm:text-xl whitespace-nowrap">
                ATELIER AI
              </span>
              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wide text-amber-400 border border-amber-500/20">
                v2.1
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              Architectural Room Makeover & Context-Aware Interior Stylist
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-stone-900/90 px-3 py-1.5 border border-stone-800 text-xs text-stone-300">
            <Palette className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-stone-400">Active Style:</span>
            <span className="font-medium text-stone-200">{activeStyleName}</span>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-stone-800/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-stone-200 transition-all hover:bg-stone-700 hover:text-white border border-stone-700"
            aria-label="Upload or switch space photo"
          >
            <UploadCloud className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Change Space</span>
            <span className="sm:hidden text-[11px]">Space</span>
          </button>

          <button
            onClick={onOpenMoodboard}
            className="relative flex items-center gap-1 sm:gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-stone-950 transition-all hover:from-amber-500 hover:to-amber-600 shadow-sm shadow-amber-950/50"
            aria-label="View Moodboard & Shoppable List"
          >
            <BookmarkCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-stone-950 shrink-0" />
            <span className="font-semibold text-stone-950 hidden sm:inline">Moodboard</span>
            <span className="font-semibold text-stone-950 sm:hidden text-[11px]">Saved</span>
            {savedItemsCount > 0 && (
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-stone-950 text-[9px] sm:text-[10px] font-bold text-amber-400 shrink-0">
                {savedItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
