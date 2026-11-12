/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShoppingBag,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Tag,
  Filter,
} from 'lucide-react';
import { ShoppableProduct, generateShoppingSearchUrl } from '../utils/design-engine';

interface ShoppableGridProps {
  products: ShoppableProduct[];
  activeStyleName: string;
  onToggleSaveItem: (item: ShoppableProduct) => void;
  savedItemIds: Set<string>;
}

export const ShoppableGrid: React.FC<ShoppableGridProps> = ({
  products,
  activeStyleName,
  onToggleSaveItem,
  savedItemIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Furniture', 'Lighting', 'Rugs & Textiles', 'Decor & Art', 'Storage'];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="w-full rounded-2xl border border-stone-800 bg-stone-900/80 p-5 shadow-xl">
      {/* Title & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-100">
              Shoppable Designer Pieces
            </h3>
            <span className="rounded-md bg-stone-800 px-2 py-0.5 text-xs text-amber-400 border border-stone-700">
              Curated for {activeStyleName}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-world furniture and lighting selected by our architectural AI to replicate this makeover.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-stone-950 font-semibold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredProducts.map((product) => {
          const isSaved = savedItemIds.has(product.id);
          const shoppingUrl = generateShoppingSearchUrl(product.name, product.retailer);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between rounded-xl border border-stone-800 bg-stone-950/70 p-4 transition-all duration-200 hover:border-amber-500/40 hover:bg-stone-950 hover:shadow-lg"
            >
              <div>
                {/* Category & Save Button */}
                <div className="flex items-center justify-between">
                  <span className="rounded bg-stone-800/90 px-2 py-0.5 text-[10px] font-medium text-stone-300 border border-stone-750">
                    {product.category}
                  </span>
                  <button
                    onClick={() => onToggleSaveItem(product)}
                    className={`rounded-lg p-1.5 transition-colors ${
                      isSaved
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                    title={isSaved ? 'Remove from Moodboard' : 'Save to Moodboard'}
                    aria-label={isSaved ? 'Saved piece' : 'Save piece'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Product Name */}
                <h4 className="mt-2.5 font-serif text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                  {product.name}
                </h4>

                {/* Price and Retailer */}
                <div className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-amber-400 text-sm">
                    {product.priceEstimate}
                  </span>
                  <span className="text-stone-400 font-medium">
                    {product.retailer}
                  </span>
                </div>

                {/* Description / Stylist Notes */}
                <p className="mt-2 text-xs text-stone-400 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-stone-900 px-1.5 py-0.5 text-[10px] text-stone-400 border border-stone-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button: Shop Online with Search Query */}
              <div className="mt-4 pt-3 border-t border-stone-800/60">
                <a
                  href={shoppingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-stone-800/90 py-2 text-xs font-semibold text-stone-200 hover:bg-amber-600 hover:text-stone-950 transition-all border border-stone-700"
                >
                  <span>Shop Similar on Google</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center text-stone-400 text-sm">
          No items found in this category for {activeStyleName}.
        </div>
      )}
    </div>
  );
};
