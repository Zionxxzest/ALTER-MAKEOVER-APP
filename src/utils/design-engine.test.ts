/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSplitPosition,
  generateShoppingSearchUrl,
  buildRefinementPrompt,
  parseShoppableItems,
  formatPriceEstimate,
} from './design-engine';

test('calculateSplitPosition clamps to 0-100 and computes accurate percentage', () => {
  // Center: 500 in 1000px container starting at 0
  assert.equal(calculateSplitPosition(500, 0, 1000), 50);

  // Left boundary: 0
  assert.equal(calculateSplitPosition(-50, 0, 1000), 0);

  // Right boundary: 100
  assert.equal(calculateSplitPosition(1200, 0, 1000), 100);

  // Container with offset left of 200px
  assert.equal(calculateSplitPosition(450, 200, 1000), 25);

  // Zero container width returns safe 50
  assert.equal(calculateSplitPosition(100, 0, 0), 50);
});

test('generateShoppingSearchUrl formats valid google shopping links', () => {
  const url = generateShoppingSearchUrl('Boucle Armchair', 'West Elm');
  assert.ok(url.startsWith('https://www.google.com/search?tbm=shop&q='));
  assert.ok(url.includes('Boucle%20Armchair'));
  assert.ok(url.includes('West%20Elm'));
});

test('buildRefinementPrompt includes style, room geometry preservation, and user instruction', () => {
  const prompt = buildRefinementPrompt('Scandinavian', 'Make the rug deep navy and add brass wall sconces', 'Living Room');
  assert.ok(prompt.includes('Scandinavian'));
  assert.ok(prompt.includes('Living Room'));
  assert.ok(prompt.includes('Preserve the exact room geometry'));
  assert.ok(prompt.includes('Make the rug deep navy'));
});

test('parseShoppableItems parses JSON blocks accurately', () => {
  const sampleJson = `
Here are my recommendations for your space:
\`\`\`json
[
  {
    "id": "item-1",
    "name": "Noguchi Sculptural Coffee Table",
    "category": "Furniture",
    "retailer": "Herman Miller",
    "priceEstimate": "$895",
    "description": "Solid walnut base with organic curved tempered glass top."
  }
]
\`\`\`
Hope this elevates your living area!
`;
  const items = parseShoppableItems(sampleJson);
  assert.equal(items.length, 1);
  assert.equal(items[0].name, 'Noguchi Sculptural Coffee Table');
  assert.equal(items[0].retailer, 'Herman Miller');
  assert.equal(items[0].priceEstimate, '$895');
});

test('formatPriceEstimate prefixes dollar symbol if missing', () => {
  assert.equal(formatPriceEstimate('499'), '$499');
  assert.equal(formatPriceEstimate('$750'), '$750');
});
