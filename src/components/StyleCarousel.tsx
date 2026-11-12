/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Check, Wand2 } from 'lucide-react';
import { DesignStyle } from '../utils/design-engine';

interface StyleCarouselProps {
  styles: DesignStyle[];
  activeStyleId: string;
  onSelectStyle: (style: DesignStyle) => void;
  onOpenCustomPromptModal: () => void;
  isGenerating?: boolean;
}

export const StyleCarousel: React.FC<StyleCarouselProps> = ({
  styles,
  activeStyleId,
  onSelectStyle,
  onOpenCustomPromptModal,
  isGenerating = false,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full">
      {/* Header with Title and Scroll Arrows */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-semibold tracking-wide text-stone-100">
              Reimagined Architectural Styles
            </h3>
            <span className="rounded-md bg-stone-800 px-2 py-0.5 text-xs text-amber-400 border border-stone-700">
              {styles.length} Curated Presets
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Select an aesthetic to transform your space with AI-curated lighting, textures, and geometry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCustomPromptModal}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            title="Prompt a custom style with AI"
            aria-label="Prompt custom style with AI"
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Custom Style</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="rounded-lg bg-stone-800 p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700"
              aria-label="Scroll styles left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="rounded-lg bg-stone-800 p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700"
              aria-label="Scroll styles right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {styles.map((style) => {
          const isActive = style.id === activeStyleId;
          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              disabled={isGenerating}
              className={`group relative flex-none w-[220px] sm:w-[260px] snap-start rounded-xl overflow-hidden text-left transition-all duration-200 border ${
                isActive
                  ? 'border-amber-500 ring-2 ring-amber-500/40 bg-stone-900 shadow-lg shadow-amber-950/40 scale-[1.01]'
                  : 'border-stone-800 bg-stone-900/80 hover:border-stone-700 hover:bg-stone-850'
              } disabled:opacity-60`}
            >
              {/* Thumbnail Image */}
              <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-stone-950">
                <img
                  src={style.previewImage}
                  alt={style.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                {/* Active check pill */}
                {isActive && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-stone-950 shadow-md">
                    <Check className="h-3 w-3 stroke-[3]" />
                    <span>ACTIVE</span>
                  </div>
                )}

                {/* Color Swatches Overlay */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-stone-950/80 backdrop-blur-sm px-2 py-1 rounded-md border border-stone-800">
                  {style.colors.slice(0, 4).map((color, idx) => (
                    <span
                      key={idx}
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-black/40"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Text Meta Content */}
              <div className="p-3">
                <h4 className="font-serif text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                  {style.name}
                </h4>
                <p className="text-[11px] font-medium text-amber-400/90 line-clamp-1 mt-0.5">
                  {style.subtitle}
                </p>
                <p className="mt-1.5 text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                  {style.description}
                </p>

                {/* Material tags */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {style.materials.slice(0, 2).map((mat, i) => (
                    <span
                      key={i}
                      className="rounded bg-stone-800/90 px-1.5 py-0.5 text-[10px] text-stone-300 border border-stone-750"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
