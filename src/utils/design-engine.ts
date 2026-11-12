/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShoppableProduct {
  id: string;
  name: string;
  category: 'Furniture' | 'Lighting' | 'Rugs & Textiles' | 'Decor & Art' | 'Storage';
  retailer: string;
  priceEstimate: string;
  description: string;
  searchQuery: string;
  matchScore: number;
  tags: string[];
}

export interface DesignStyle {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  colors: string[];
  materials: string[];
  vibe: string;
  promptModifier: string;
  previewImage: string;
}

export interface SpacePreset {
  id: string;
  title: string;
  roomType: string;
  description: string;
  originalImage: string;
  defaultStyleId: string;
  styleRenders: Record<string, string>;
}

/**
 * Bounds checking and calculating percentage split for the before/after slider.
 */
export function calculateSplitPosition(
  clientX: number,
  containerLeft: number,
  containerWidth: number
): number {
  if (containerWidth <= 0) return 50;
  const relativeX = clientX - containerLeft;
  const percentage = (relativeX / containerWidth) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));
}

/**
 * Builds a valid Google Shopping search URL for a product query and retailer.
 */
export function generateShoppingSearchUrl(productTitle: string, retailer?: string): string {
  const query = retailer ? `${productTitle} ${retailer}` : productTitle;
  const encoded = encodeURIComponent(query.trim());
  return `https://www.google.com/search?tbm=shop&q=${encoded}`;
}

/**
 * Builds an enhanced AI prompt for image reimagining using gemini-nano-banana-2.1.
 */
export function buildRefinementPrompt(
  currentStyleName: string,
  userInstruction: string,
  roomType: string = 'Living Room'
): string {
  const cleanInstruction = userInstruction.trim();
  return (
    `Interior architectural redesign of this ${roomType} in ${currentStyleName} style. ` +
    `Preserve the exact room geometry, window placements, ceiling height, and floor layout. ` +
    `Refinement requested: "${cleanInstruction}". ` +
    `High-end editorial interior photograph, photorealistic 8K render, architectural digest style, natural daylight, balanced composition.`
  );
}

/**
 * Extracts structured product recommendations from assistant text if provided as JSON or parsed markdown.
 */
export function parseShoppableItems(text: string): ShoppableProduct[] {
  const products: ShoppableProduct[] = [];
  
  // Try extracting JSON block if present: ```json [ ... ] ```
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          id: item.id || `item-${idx + 1}-${Date.now()}`,
          name: item.name || 'Designer Furniture Piece',
          category: item.category || 'Furniture',
          retailer: item.retailer || 'West Elm',
          priceEstimate: item.priceEstimate || '$299 - $599',
          description: item.description || '',
          searchQuery: item.searchQuery || item.name || 'Modern Furniture',
          matchScore: typeof item.matchScore === 'number' ? item.matchScore : 95,
          tags: Array.isArray(item.tags) ? item.tags : ['Curated Match'],
        }));
      }
    } catch {
      // fallback to regex parsing
    }
  }

  // Fallback regex detection for markdown lists with prices like: - **Product Name** ($199 at CB2) - Description
  const lineRegex = /[-*]\s+\*\*([^*]+)\*\*\s*(?:\(([^)]+)\))?[:\s-]*(.*)/g;
  let match;
  let index = 1;

  while ((match = lineRegex.exec(text)) !== null) {
    const name = match[1].trim();
    const meta = match[2] || '';
    const desc = match[3] ? match[3].trim() : '';

    let price = '$150 - $450';
    let retailer = 'CB2';

    if (meta) {
      const priceMatch = meta.match(/(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/);
      if (priceMatch) price = priceMatch[1];
      const retailerMatch = meta.match(/at\s+([A-Za-z0-9\s&]+)/i);
      if (retailerMatch) retailer = retailerMatch[1].trim();
    }

    products.push({
      id: `extracted-${index++}`,
      name,
      category: 'Furniture',
      retailer,
      priceEstimate: price,
      description: desc,
      searchQuery: `${name} ${retailer}`,
      matchScore: 92,
      tags: ['AI Recommended'],
    });
  }

  return products;
}

/**
 * Formats currency values cleanly.
 */
export function formatPriceEstimate(raw: string): string {
  if (!raw) return '$249';
  if (raw.startsWith('$')) return raw;
  return `$${raw}`;
}
