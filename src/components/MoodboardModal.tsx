/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  BookmarkCheck,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { DesignStyle, ShoppableProduct, generateShoppingSearchUrl } from '../utils/design-engine';

interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: ShoppableProduct[];
  activeStyle: DesignStyle;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const MoodboardModal: React.FC<MoodboardModalProps> = ({
  isOpen,
  onClose,
  savedProducts,
  activeStyle,
  onRemoveItem,
  onClearAll,
}) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <BookmarkCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Project Moodboard & Furniture Spec Sheet
              </h3>
              <p className="text-xs text-stone-400">
                Saved items, color swatches, and material palette for {activeStyle.name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-2.5 py-1.5 text-xs text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700"
              title="Print spec sheet"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Section 1: Color Palette */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              Color Architecture Palette ({activeStyle.name})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {activeStyle.colors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => handleCopyColor(color)}
                  className="group flex flex-col items-center rounded-xl border border-stone-800 bg-stone-950 p-2 text-center transition-all hover:border-stone-700"
                >
                  <div
                    className="h-10 w-full rounded-lg shadow-inner ring-1 ring-black/40"
                    style={{ backgroundColor: color }}
                  />
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-medium text-stone-300">
                    <span>{color}</span>
                    {copiedColor === color ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-stone-400 group-hover:text-stone-300" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Materials & Finishes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              Architectural Materials & Textures
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeStyle.materials.map((mat, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-stone-700 bg-stone-800/80 px-3 py-1.5 text-xs font-medium text-stone-200"
                >
                  {mat}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Saved Shoppable Items */}
          <div className="border-t border-stone-800 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Curated Furnishings Spec ({savedProducts.length} items)
                </h4>
              </div>

              {savedProducts.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Clear All
                </button>
              )}
            </div>

            {savedProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-800 p-8 text-center text-xs text-stone-400">
                You haven't saved any shoppable furniture pieces yet. Click the bookmark icon on any piece in the shopping grid or chat recommendations to add it here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedProducts.map((item) => {
                  const url = generateShoppingSearchUrl(item.name, item.retailer);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-800 bg-stone-950 p-3.5 transition-colors hover:border-stone-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] text-stone-400">
                            {item.category}
                          </span>
                          <h5 className="font-serif text-xs font-bold text-stone-100">
                            {item.name}
                          </h5>
                        </div>
                        <p className="mt-1 text-xs text-stone-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block text-xs font-semibold text-amber-400">
                            {item.priceEstimate}
                          </span>
                          <span className="block text-[11px] text-stone-400">
                            {item.retailer}
                          </span>
                        </div>

                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg bg-stone-800 px-2.5 py-1.5 text-xs text-stone-200 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                        >
                          <span>Shop</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="rounded p-1.5 text-stone-400 hover:bg-stone-800 hover:text-rose-400"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
