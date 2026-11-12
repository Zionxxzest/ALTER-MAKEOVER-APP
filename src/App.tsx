/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { CompareSlider } from './components/CompareSlider';
import { StyleCarousel } from './components/StyleCarousel';
import { ChatConsultant, ChatMessage } from './components/ChatConsultant';
import { ShoppableGrid } from './components/ShoppableGrid';
import { SpaceSelectorModal } from './components/SpaceSelectorModal';
import { MoodboardModal } from './components/MoodboardModal';
import { CustomPromptModal } from './components/CustomPromptModal';
import {
  DESIGN_STYLES,
  SPACE_PRESETS,
  STYLE_SHOPPING_CATALOG,
} from './data/design-presets';
import {
  DesignStyle,
  ShoppableProduct,
  SpacePreset,
  parseShoppableItems,
  buildRefinementPrompt,
} from './utils/design-engine';
import {
  SlidersHorizontal,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export default function App() {
  // Active Space & Style States
  const [activePreset, setActivePreset] = useState<SpacePreset>(SPACE_PRESETS[0]);
  const [originalImage, setOriginalImage] = useState<string>(SPACE_PRESETS[0].originalImage);
  const [activeStyle, setActiveStyle] = useState<DesignStyle>(DESIGN_STYLES[0]);
  const [customRenders, setCustomRenders] = useState<Record<string, string>>({});

  // Modals & Drawers
  const [isSpaceSelectorOpen, setIsSpaceSelectorOpen] = useState<boolean>(false);
  const [isMoodboardOpen, setIsMoodboardOpen] = useState<boolean>(false);
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState<boolean>(false);

  // AI & Generation States
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isApplyingRefinement, setIsApplyingRefinement] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Moodboard Products
  const [savedProducts, setSavedProducts] = useState<ShoppableProduct[]>([
    STYLE_SHOPPING_CATALOG['mid-century'][0], // Default saved hero piece
  ]);

  const savedItemIds = useMemo(() => {
    return new Set(savedProducts.map((p) => p.id));
  }, [savedProducts]);

  // Current Makeover Image (Resolved between custom renders, preset style renders, and default)
  const currentRedesignImage = useMemo(() => {
    const key = `${activePreset.id}-${activeStyle.id}`;
    if (customRenders[key]) return customRenders[key];
    if (activePreset.styleRenders && activePreset.styleRenders[activeStyle.id]) {
      return activePreset.styleRenders[activeStyle.id];
    }
    return activeStyle.previewImage;
  }, [activePreset, activeStyle, customRenders]);

  // Initial Multi-turn Chat Conversation History
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `### Welcome to Atelier AI Room Studio\n\nI have evaluated your **${SPACE_PRESETS[0].title}** and prepared a **${DESIGN_STYLES[0].name}** architectural makeover.\n\n* **Structural Balance:** We kept the existing window perimeter while clearing visual weight.\n* **Material Palette:** Swapped dated tones for rich walnut, brushed brass, and textured bouclé upholstery.\n* **Lighting Temperature:** Introduced layered 2700K ambient luminaires for restorative warmth.\n\nHow would you like to refine this design? You can ask me to change materials, adjust color schemes, or query specific shoppable links!`,
      timestamp: 'Just now',
      shoppableItems: STYLE_SHOPPING_CATALOG['mid-century'].slice(0, 2),
    },
  ]);

  // Trigger transient toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Handle Style Selection from Carousel
  const handleSelectStyle = (style: DesignStyle) => {
    setActiveStyle(style);
    showToast(`Switched to ${style.name} aesthetic`);

    // Add brief consultant note in chat about style switch
    const newMsg: ChatMessage = {
      id: `style-switch-${Date.now()}`,
      role: 'model',
      text: `### Reimagined as ${style.name}\n\nWe have updated the design visualization to **${style.name}**. Key design traits in play:\n* **Materials:** ${style.materials.join(' • ')}\n* **Design Vibe:** ${style.vibe}\n\nNotice how the lighting and furnishings now echo this aesthetic. What elements would you like to explore or customize next?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shoppableItems: STYLE_SHOPPING_CATALOG[style.id] || [],
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Handle selecting a starter preset space
  const handleSelectPreset = (preset: SpacePreset) => {
    setActivePreset(preset);
    setOriginalImage(preset.originalImage);
    const defaultStyle = DESIGN_STYLES.find((s) => s.id === preset.defaultStyleId) || DESIGN_STYLES[0];
    setActiveStyle(defaultStyle);
    showToast(`Loaded ${preset.title}`);
  };

  // Handle custom photo upload
  const handleCustomImageUploaded = (dataUrl: string, roomType: string) => {
    const customPreset: SpacePreset = {
      id: `custom-${Date.now()}`,
      title: `Custom ${roomType}`,
      roomType,
      description: 'User-uploaded room photo',
      originalImage: dataUrl,
      defaultStyleId: activeStyle.id,
      styleRenders: {
        [activeStyle.id]: dataUrl, // Initial placeholder until AI generates
      },
    };

    setActivePreset(customPreset);
    setOriginalImage(dataUrl);
    showToast(`Uploaded ${roomType}. Click "Regenerate" or prompt in chat to apply AI makeover!`);
  };

  // Send message to Gemini 3.8 Flash Chatbot
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
          currentContext: {
            roomType: activePreset.roomType,
            styleName: activeStyle.name,
            styleDescription: activeStyle.description,
            userNotes: `Original: ${activePreset.title}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.text || 'Thank you for your design refinement.';
      const extractedShoppable = data.shoppable || parseShoppableItems(replyText);

      const consultantMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shoppableItems: extractedShoppable.length > 0 ? extractedShoppable : undefined,
      };

      setChatMessages((prev) => [...prev, consultantMsg]);
    } catch (err: any) {
      console.warn('Chat request fallback:', err);
      // Fallback response with helpful styling guidance
      const fallbackMsg: ChatMessage = {
        id: `model-fallback-${Date.now()}`,
        role: 'model',
        text: `### Stylist Guidance for "${text}"\n\nThat is an exquisite refinement for your **${activeStyle.name}** space. Incorporating "${text}" helps ground the room while maintaining architectural flow.\n\n* **Focal Accentuation:** Ensure the element balances the natural daylight entering from the windows.\n* **Color Calibration:** Echo this tone in at least two smaller accents (such as a ceramic vessel or pillow trim) for cohesive luxury.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shoppableItems: (STYLE_SHOPPING_CATALOG[activeStyle.id] || []).slice(0, 2),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Refine Makeover Image using Gemini Nano Banana 2.1
  const handleApplyRefinementToImage = async (instruction: string) => {
    setIsApplyingRefinement(true);
    showToast(`Applying "${instruction}" to room makeover...`);

    try {
      const response = await fetch('/api/refine-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentImageUrl: currentRedesignImage,
          refinementPrompt: instruction,
          styleName: activeStyle.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        const key = `${activePreset.id}-${activeStyle.id}`;
        setCustomRenders((prev) => ({ ...prev, [key]: data.imageUrl }));
        showToast('Makeover image refined with AI!');
      } else {
        // If API key is not attached, provide simulated visual feedback
        showToast(data.error || 'Refinement noted by consultant! Attach Gemini API Key in Settings > Secrets for live renders.');
      }
    } catch (err) {
      console.warn('Refinement render error:', err);
      showToast('Refinement noted by consultant! Attach Gemini API Key in Settings > Secrets for live renders.');
    } finally {
      setIsApplyingRefinement(false);
    }
  };

  // Generate Makeover for style using Gemini Nano Banana 2.1
  const handleRegenerateClick = async () => {
    setIsGeneratingImage(true);
    showToast(`Generating ${activeStyle.name} makeover using gemini-nano-banana-2.1...`);

    try {
      const response = await fetch('/api/generate-makeover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalImage,
          styleName: activeStyle.name,
          stylePrompt: activeStyle.promptModifier,
          aspectRatio: '4:3',
        }),
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        const key = `${activePreset.id}-${activeStyle.id}`;
        setCustomRenders((prev) => ({ ...prev, [key]: data.imageUrl }));
        showToast(`Render complete for ${activeStyle.name}!`);
      } else {
        showToast(data.error || 'Showing high-definition curated render. Attach API Key in Settings for custom renders.');
      }
    } catch (err) {
      console.warn('Generate makeover error:', err);
      showToast('Showing high-definition curated render. Attach API Key in Settings for live image generation.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Custom Prompt Submission (Feature: Create & edit images using gemini-nano-banana-2.1)
  const handleCustomPromptSubmit = async (
    customStyleName: string,
    promptText: string,
    aspectRatio: string
  ) => {
    setIsGeneratingImage(true);
    showToast(`Synthesizing custom ${customStyleName} using gemini-nano-banana-2.1...`);

    const bespokeStyle: DesignStyle = {
      id: `custom-${Date.now()}`,
      name: customStyleName,
      subtitle: 'Bespoke AI Prompted Vision',
      description: promptText,
      colors: ['#2F3E46', '#CAD2C5', '#84A98C', '#52796F', '#354F52'],
      materials: ['Custom Finishes', 'Curated Lighting', 'Bespoke Textiles'],
      vibe: 'Tailored architectural synthesis',
      promptModifier: promptText,
      previewImage: currentRedesignImage,
    };

    try {
      const response = await fetch('/api/generate-makeover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalImage,
          styleName: customStyleName,
          stylePrompt: promptText,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        bespokeStyle.previewImage = data.imageUrl;
        const key = `${activePreset.id}-${bespokeStyle.id}`;
        setCustomRenders((prev) => ({ ...prev, [key]: data.imageUrl }));
      }
    } catch (e) {
      console.warn('Custom prompt error:', e);
    } finally {
      setActiveStyle(bespokeStyle);
      setIsGeneratingImage(false);
      showToast(`Applied ${customStyleName}!`);
    }
  };

  // Toggle saving shoppable items to moodboard
  const handleToggleSaveItem = (item: ShoppableProduct) => {
    setSavedProducts((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) {
        showToast(`Removed "${item.name}" from moodboard`);
        return prev.filter((p) => p.id !== item.id);
      } else {
        showToast(`Saved "${item.name}" to moodboard!`);
        return [...prev, item];
      }
    });
  };

  const handleRemoveSavedItem = (id: string) => {
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearSavedAll = () => {
    setSavedProducts([]);
    showToast('Moodboard cleared');
  };

  const handleClearChatHistory = () => {
    setChatMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        text: `Consultation reset for **${activePreset.title}** (${activeStyle.name}). Ask any question about spatial flow, lighting, or shoppable furniture pieces!`,
        timestamp: 'Just now',
      },
    ]);
    showToast('Chat history reset');
  };

  // All current products to show in the Shoppable Grid
  const shoppableProductsForGrid = useMemo(() => {
    return STYLE_SHOPPING_CATALOG[activeStyle.id] || STYLE_SHOPPING_CATALOG['mid-century'];
  }, [activeStyle]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      {/* Header */}
      <Header
        onOpenUpload={() => setIsSpaceSelectorOpen(true)}
        onOpenMoodboard={() => setIsMoodboardOpen(true)}
        savedItemsCount={savedProducts.length}
        activeStyleName={activeStyle.name}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 space-y-6">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 shadow-2xl transition-all animate-bounce">
            <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Section 1: Hero Visualization & Interactive Compare Slider */}
        <section aria-label="Makeover Visualization & Compare Slider">
          <CompareSlider
            originalImage={originalImage}
            redesignImage={currentRedesignImage}
            originalLabel={`Before: ${activePreset.title}`}
            redesignLabel={activeStyle.name}
            isGenerating={isGeneratingImage || isApplyingRefinement}
            onRegenerateClick={handleRegenerateClick}
          />
        </section>

        {/* Section 2: Reimagined Styles Carousel */}
        <section aria-label="Reimagined Architectural Styles Carousel">
          <StyleCarousel
            styles={DESIGN_STYLES}
            activeStyleId={activeStyle.id}
            onSelectStyle={handleSelectStyle}
            onOpenCustomPromptModal={() => setIsCustomPromptOpen(true)}
            isGenerating={isGeneratingImage || isApplyingRefinement}
          />
        </section>

        {/* Section 3: Dual Column - Context-Aware Chat Consultant & Shoppable Furniture Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Context-Aware Chat Interface */}
          <section className="lg:col-span-6 w-full" aria-label="AI Interior Design Consultant Chat">
            <ChatConsultant
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              activeStyleName={activeStyle.name}
              roomType={activePreset.roomType}
              onApplyRefinementToImage={handleApplyRefinementToImage}
              isApplyingRefinement={isApplyingRefinement}
              onToggleSaveItem={handleToggleSaveItem}
              savedItemIds={savedItemIds}
              onClearHistory={handleClearChatHistory}
            />
          </section>

          {/* Right Column: Curated Shoppable Items Grid */}
          <section className="lg:col-span-6 w-full" aria-label="Shoppable Decor and Furniture Items">
            <ShoppableGrid
              products={shoppableProductsForGrid}
              activeStyleName={activeStyle.name}
              onToggleSaveItem={handleToggleSaveItem}
              savedItemIds={savedItemIds}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-800/80 bg-stone-950 py-6 text-center text-xs text-stone-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-300">ATELIER AI</span>
            <span>•</span>
            <span>Architectural Room Makeovers & Interior Design Consultant</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Powered by Gemini 3.8 Flash & Nano Banana 2.1</span>
            <span>•</span>
            <button
              onClick={() => setIsMoodboardOpen(true)}
              className="text-amber-400 hover:underline"
            >
              Moodboard ({savedProducts.length})
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SpaceSelectorModal
        isOpen={isSpaceSelectorOpen}
        onClose={() => setIsSpaceSelectorOpen(false)}
        presets={SPACE_PRESETS}
        activePresetId={activePreset.id}
        onSelectPreset={handleSelectPreset}
        onCustomImageUploaded={handleCustomImageUploaded}
      />

      <MoodboardModal
        isOpen={isMoodboardOpen}
        onClose={() => setIsMoodboardOpen(false)}
        savedProducts={savedProducts}
        activeStyle={activeStyle}
        onRemoveItem={handleRemoveSavedItem}
        onClearAll={handleClearSavedAll}
      />

      <CustomPromptModal
        isOpen={isCustomPromptOpen}
        onClose={() => setIsCustomPromptOpen(false)}
        onSubmitPrompt={handleCustomPromptSubmit}
        isGenerating={isGeneratingImage}
      />
    </div>
  );
}
