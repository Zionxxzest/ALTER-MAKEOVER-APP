/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronsLeftRight,
  Maximize2,
  Minimize2,
  Download,
  Split,
  Eye,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import { calculateSplitPosition } from '../utils/design-engine';

interface CompareSliderProps {
  originalImage: string;
  redesignImage: string;
  originalLabel?: string;
  redesignLabel: string;
  isGenerating?: boolean;
  onRegenerateClick?: () => void;
  aspectRatioClass?: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  originalImage,
  redesignImage,
  originalLabel = 'Original Space',
  redesignLabel,
  isGenerating = false,
  onRegenerateClick,
}) => {
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'original' | 'redesign'>('split');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate mouse or touch coordinate to slider percentage
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPos = calculateSplitPosition(clientX, rect.left, rect.width);
      setSplitPos(newPos);
      if (viewMode !== 'split') setViewMode('split');
    },
    [viewMode]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      handleMove(e.touches[0].clientX);
    };

    const handleGlobalEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, handleMove]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPos((prev) => Math.max(0, prev - 5));
      setViewMode('split');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPos((prev) => Math.min(100, prev + 5));
      setViewMode('split');
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSplitPos(0);
      setViewMode('split');
    } else if (e.key === 'End') {
      e.preventDefault();
      setSplitPos(100);
      setViewMode('split');
    }
  };

  const currentSplit = viewMode === 'original' ? 100 : viewMode === 'redesign' ? 0 : splitPos;

  const downloadRedesign = () => {
    const link = document.createElement('a');
    link.href = redesignImage;
    link.download = `atelier-makeover-${redesignLabel.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none bg-stone-950 p-4 md:p-8 flex items-center justify-center'
          : 'w-full overflow-hidden'
      }`}
    >
      {/* Top Slider Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 bg-stone-950/60 px-4 py-2.5 backdrop-blur-sm">
        {/* View mode toggle buttons */}
        <div className="flex items-center rounded-lg bg-stone-900/90 p-0.5 border border-stone-800 text-xs">
          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'original'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            aria-label="View original space"
          >
            <Eye className="h-3 w-3" />
            <span>Before</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-amber-600 text-stone-950 shadow-sm font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            aria-label="View split comparison slider"
          >
            <Split className="h-3 w-3" />
            <span>Compare Slider</span>
          </button>
          <button
            onClick={() => setViewMode('redesign')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'redesign'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            aria-label="View AI redesigned space"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">After ({redesignLabel})</span>
            <span className="sm:hidden">After</span>
          </button>
        </div>

        {/* Action utility buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onRegenerateClick && (
            <button
              onClick={onRegenerateClick}
              disabled={isGenerating}
              className="flex items-center gap-1 rounded-lg bg-stone-800 px-2 py-1 sm:px-2.5 sm:py-1 text-xs text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700 disabled:opacity-50"
              title="Regenerate with AI"
              aria-label="Regenerate with AI"
            >
              <RefreshCw className={`h-3 w-3 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          <button
            onClick={downloadRedesign}
            className="flex items-center gap-1 rounded-lg bg-stone-800 px-2 py-1 sm:px-2.5 sm:py-1 text-xs text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700"
            title="Download makeover image"
            aria-label="Download makeover image"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Save Image</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg bg-stone-800 p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Comparison Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Before and after makeover comparison slider. Use left and right arrow keys to adjust split."
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(currentSplit)}
        className={`relative w-full cursor-ew-resize select-none overflow-hidden bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
          isFullscreen ? 'max-h-[85vh] max-w-6xl aspect-[16/10]' : 'aspect-[16/10] sm:aspect-[16/9]'
        }`}
      >
        {/* Layer 1: Redesigned (Underneath base) */}
        <div className="absolute inset-0 h-full w-full">
          <img
            src={redesignImage}
            alt={`AI Makeover: ${redesignLabel}`}
            className="h-full w-full object-cover object-center pointer-events-none"
            loading="eager"
          />
        </div>

        {/* Layer 2: Original (Clipped on top based on splitPos) */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden transition-[clip-path] duration-75"
          style={{
            clipPath: `inset(0 ${100 - currentSplit}% 0 0)`,
          }}
        >
          <img
            src={originalImage}
            alt={originalLabel}
            className="h-full w-full object-cover object-center pointer-events-none"
            loading="eager"
          />
        </div>

        {/* Floating Badges */}
        {/* Left Badge: Original */}
        <div
          className={`pointer-events-none absolute left-2 sm:left-4 top-2 sm:top-4 rounded-full bg-stone-950/85 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold tracking-wide text-stone-200 backdrop-blur-md border border-stone-700/60 shadow-lg transition-opacity ${
            currentSplit < 15 ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
            <span className="hidden sm:inline">{originalLabel}</span>
            <span className="sm:hidden">Original</span>
          </span>
        </div>

        {/* Right Badge: Redesigned */}
        <div
          className={`pointer-events-none absolute right-2 sm:right-4 top-2 sm:top-4 rounded-full bg-amber-950/85 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold tracking-wide text-amber-200 backdrop-blur-md border border-amber-600/40 shadow-lg transition-opacity ${
            currentSplit > 85 ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">AI: {redesignLabel}</span>
            <span className="sm:hidden">{redesignLabel}</span>
          </span>
        </div>

        {/* Divider Line & Tactile Drag Handle */}
        {viewMode === 'split' && (
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: `${currentSplit}%` }}
          >
            {/* Vertical hairline */}
            <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" />

            {/* Center Grab Handle */}
            <div className="absolute top-1/2 -left-5 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900 shadow-2xl ring-4 ring-black/30 backdrop-blur-sm transition-transform active:scale-95">
              <ChevronsLeftRight className="h-5 w-5 text-stone-900 stroke-[2.5]" />
            </div>

            {/* Floating percentage indicator at bottom of line */}
            <div className="absolute bottom-4 -left-7 rounded-md bg-stone-950/90 px-1.5 py-0.5 text-[10px] font-mono font-medium text-stone-300 border border-stone-800 shadow">
              {Math.round(currentSplit)}%
            </div>
          </div>
        )}

        {/* AI Generating Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-stone-950/75 backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 animate-pulse">
              <Sparkles className="h-8 w-8 animate-spin" />
            </div>
            <h4 className="mt-4 font-serif text-lg font-semibold text-stone-100">
              Generating Makeover...
            </h4>
            <p className="mt-1 max-w-sm text-center text-xs text-stone-400">
              Applying {redesignLabel} architectural materials, lighting balance, and furnishings using Gemini Nano Banana 2.1.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Hint Bar */}
      <div className="flex items-center justify-between border-t border-stone-800/80 bg-stone-950/40 px-4 py-2 text-[11px] text-stone-400">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-stone-400" />
          <span>Drag slider or click anywhere to compare transformation. Arrow keys also navigate.</span>
        </div>
        <div className="hidden sm:block text-stone-400">
          Photorealistic 8K Architectural Render
        </div>
      </div>
    </div>
  );
};
