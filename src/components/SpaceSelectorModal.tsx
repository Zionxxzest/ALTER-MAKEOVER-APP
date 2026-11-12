/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Check, Sparkles, Camera } from 'lucide-react';
import { SpacePreset } from '../utils/design-engine';

interface SpaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: SpacePreset[];
  activePresetId: string;
  onSelectPreset: (preset: SpacePreset) => void;
  onCustomImageUploaded: (imageDataUrl: string, roomType: string) => void;
}

export const SpaceSelectorModal: React.FC<SpaceSelectorModalProps> = ({
  isOpen,
  onClose,
  presets,
  activePresetId,
  onSelectPreset,
  onCustomImageUploaded,
}) => {
  const [selectedRoomType, setSelectedRoomType] = useState<string>('Living Room');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onCustomImageUploaded(event.target.result, selectedRoomType);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-100">
              Select or Upload Your Space
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Upload a snapshot of your room or pick from realistic architectural spaces.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: Upload Your Own Room Photo */}
        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Upload Your Own Photo
          </label>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-stone-400">Room Type:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Living Room', 'Bedroom', 'Studio Loft', 'Dining Space', 'Home Office'].map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedRoomType(type)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedRoomType === type
                        ? 'bg-amber-600 text-stone-950 font-semibold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              dragOver
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-stone-700 bg-stone-950/60 hover:border-amber-500/60 hover:bg-stone-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Upload className="h-6 w-6" />
            </div>
            <p className="mt-2 text-sm font-medium text-stone-200">
              Click to browse or drag & drop room photo
            </p>
            <p className="mt-0.5 text-xs text-stone-400">
              High resolution JPG, PNG, or WebP (Horizontal / wide photos work best)
            </p>
          </div>
        </div>

        {/* Section 2: Or Pick Curated Starter Space */}
        <div className="mt-6 border-t border-stone-800 pt-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Or Choose a Starter Space
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {presets.map((preset) => {
              const isSelected = preset.id === activePresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/40 bg-stone-800 shadow-md'
                      : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                    <img
                      src={preset.originalImage}
                      alt={preset.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute right-1.5 top-1.5 rounded-full bg-amber-500 p-0.5 text-stone-950">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h5 className="font-serif text-xs font-semibold text-stone-200 group-hover:text-amber-300">
                      {preset.title}
                    </h5>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                      {preset.roomType}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
