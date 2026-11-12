/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Wand2, Sparkles, AlertCircle } from 'lucide-react';

interface CustomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrompt: (customStyleName: string, promptText: string, aspectRatio: string) => Promise<void>;
  isGenerating: boolean;
}

const PRESET_IDEAS = [
  {
    name: 'Tuscan Farmhouse',
    prompt: 'Rustic Tuscan farmhouse interior with exposed terracotta ceiling beams, rough-hewn stone walls, reclaimed oak dining table, linen slipcovered armchairs, wrought iron sconces, warm golden afternoon sun.',
  },
  {
    name: 'Cyberpunk Industrial Loft',
    prompt: 'Futuristic cyberpunk industrial loft with exposed cast-concrete columns, subtle amber and cyan neon accent cove lighting, matte black steel mesh divider, oversized dark leather sectional.',
  },
  {
    name: 'Coastal Mediterranean Villa',
    prompt: 'Sun-drenched Aegean coastal living room with curved whitewashed plaster walls, raw jute woven rug, weathered driftwood coffee table, sea salt blue linen pillows, panoramic ocean breeze.',
  },
  {
    name: '1970s Retro Lounge',
    prompt: '1970s sunken living room conversation pit with burnt orange velvet upholstery, walnut timber paneling, brass arc floor lamp, low shag rug, vintage vinyl turntable console.',
  },
];

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrompt,
  isGenerating,
}) => {
  const [styleName, setStyleName] = useState<string>('Custom Vision');
  const [promptText, setPromptText] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('4:3');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isGenerating) return;
    await onSubmitPrompt(styleName.trim() || 'Custom Aesthetic', promptText.trim(), aspectRatio);
    onClose();
  };

  const handlePickPreset = (preset: { name: string; prompt: string }) => {
    setStyleName(preset.name);
    setPromptText(preset.prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Custom Architectural Style Prompt
              </h3>
              <p className="text-xs text-stone-400">
                Powered by <span className="text-amber-400 font-medium">gemini-nano-banana-2.1</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              Style Name
            </label>
            <input
              type="text"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              placeholder="e.g. 70s Conversation Pit, Tuscan Farmhouse"
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Detailed Aesthetic Prompt
              </label>
              <span className="text-[11px] text-stone-400">Describe materials, lighting & furnishings</span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={4}
              placeholder="Describe your architectural vision: e.g., 'Warm limewash plaster walls, low modular linen sofa, Noguchi paper lantern floor lamp, honed travertine coffee table, large fiddle leaf fig tree...'"
              className="w-full rounded-xl border border-stone-700 bg-stone-950 p-3 text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
              required
            />
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
              Render Aspect Ratio
            </label>
            <div className="flex gap-2">
              {['4:3', '16:9', '1:1', '3:4'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-amber-600 text-stone-950 font-semibold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Ideas */}
          <div>
            <span className="text-[11px] font-semibold text-stone-400 block mb-1.5">
              Or pick an editorial inspiration idea:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_IDEAS.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePickPreset(idea)}
                  className="rounded-lg border border-stone-800 bg-stone-950 p-2 text-left hover:border-amber-500/40 transition-colors"
                >
                  <span className="font-serif text-xs font-semibold text-stone-200 block">
                    {idea.name}
                  </span>
                  <span className="text-[10px] text-stone-400 line-clamp-1 block mt-0.5">
                    {idea.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!promptText.trim() || isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-3 text-xs font-bold text-stone-950 hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 shadow-md shadow-amber-950/50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isGenerating ? 'Synthesizing Room Architecture...' : 'Generate Reimagined Space'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
