/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Wand2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Plus,
  Bookmark,
  BookmarkCheck,
  CornerDownRight,
  Lightbulb,
} from 'lucide-react';
import { ShoppableProduct, generateShoppingSearchUrl } from '../utils/design-engine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  shoppableItems?: ShoppableProduct[];
  isRefinement?: boolean;
}

interface ChatConsultantProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  activeStyleName: string;
  roomType: string;
  onApplyRefinementToImage: (instruction: string) => Promise<void>;
  isApplyingRefinement: boolean;
  onToggleSaveItem: (item: ShoppableProduct) => void;
  savedItemIds: Set<string>;
  onClearHistory: () => void;
}

const SUGGESTED_PROMPTS = [
  'Keep this layout but make the rug navy blue',
  'Swap the coffee table for fluted travertine',
  'Add ambient brass floor lamps and linen curtains',
  'Recommend pet-friendly fabric alternatives',
  'What wall art would complement this palette?',
];

export const ChatConsultant: React.FC<ChatConsultantProps> = ({
  messages,
  onSendMessage,
  isLoading,
  activeStyleName,
  roomType,
  onApplyRefinementToImage,
  isApplyingRefinement,
  onToggleSaveItem,
  savedItemIds,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    await onSendMessage(textToSend);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  // Helper to render markdown-like text cleanly without external dependencies
  const renderMessageText = (text: string) => {
    // Strip JSON codeblock if present from displaying raw
    const cleaned = text.replace(/```json[\s\S]*?```/g, '').trim();

    return cleaned.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-serif text-sm font-bold text-amber-300 mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={idx} className="font-semibold text-stone-100 text-xs mt-1.5 mb-0.5">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletContent = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-stone-300 leading-relaxed my-0.5">
            <span
              dangerouslySetInnerHTML={{
                __html: bulletContent.replace(
                  /\*\*([^*]+)\*\*/g,
                  '<strong class="text-stone-100 font-semibold">$1</strong>'
                ),
              }}
            />
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-stone-300 leading-relaxed">
          <span
            dangerouslySetInnerHTML={{
              __html: line.replace(
                /\*\*([^*]+)\*\*/g,
                '<strong class="text-stone-100 font-semibold">$1</strong>'
              ),
            }}
          />
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-stone-800 bg-stone-900/90 shadow-xl overflow-hidden">
      {/* Consultant Header */}
      <div className="flex items-center justify-between border-b border-stone-800/90 bg-stone-950/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm font-bold text-stone-100">
                Atelier AI Design Consultant
              </h3>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Context: <span className="text-stone-300 font-medium">{roomType}</span> in{' '}
              <span className="text-amber-300 font-medium">{activeStyleName}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
          title="Reset conversation"
        >
          Reset Chat
        </button>
      </div>

      {/* Suggested quick prompt pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-stone-800/60 bg-stone-950/40 px-4 py-2 scrollbar-none">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400/90 flex-none mr-1">
          <Lightbulb className="h-3 w-3" /> Quick Refinements:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handlePromptClick(prompt)}
            disabled={isLoading}
            className="flex-none rounded-full bg-stone-800/80 px-2.5 py-1 text-[11px] text-stone-300 hover:bg-amber-600/20 hover:text-amber-200 hover:border-amber-500/40 border border-stone-750 transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Scrollable Conversation Thread */}
      <div ref={chatScrollContainerRef} className="h-[420px] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for Assistant */}
              {!isUser && (
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-md ${
                  isUser
                    ? 'bg-amber-600 text-stone-950 font-medium ml-8'
                    : 'bg-stone-950/80 border border-stone-800 text-stone-200'
                }`}
              >
                {/* User Message Header */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isUser ? 'text-amber-950' : 'text-amber-400'
                    }`}
                  >
                    {isUser ? 'You' : 'Atelier Consultant'}
                  </span>
                  <span className={`text-[10px] ${isUser ? 'text-amber-950/80' : 'text-stone-400'}`}>
                    {message.timestamp}
                  </span>
                </div>

                {/* Content */}
                {isUser ? (
                  <p className="text-xs leading-relaxed text-stone-950 font-medium">
                    {message.text}
                  </p>
                ) : (
                  <div className="space-y-1">{renderMessageText(message.text)}</div>
                )}

                {/* Refinement trigger for User's prompts */}
                {isUser && (
                  <div className="mt-2.5 pt-2 border-t border-amber-700/40 flex justify-end">
                    <button
                      onClick={() => onApplyRefinementToImage(message.text)}
                      disabled={isApplyingRefinement}
                      className="flex items-center gap-1.5 rounded-lg bg-stone-950/90 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-stone-950 hover:text-white transition-all shadow-sm disabled:opacity-50"
                      title="Apply this exact prompt to the AI room image"
                    >
                      <Wand2 className="h-3 w-3 text-amber-400" />
                      <span>{isApplyingRefinement ? 'Applying to Image...' : 'Regenerate Image with This Edit'}</span>
                    </button>
                  </div>
                )}

                {/* Recommended Shoppable Items embedded inside assistant message */}
                {message.shoppableItems && message.shoppableItems.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-stone-800">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Suggested Shoppable Pieces for this Refinement:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {message.shoppableItems.map((item) => {
                        const isSaved = savedItemIds.has(item.id);
                        const shopUrl = generateShoppingSearchUrl(item.name, item.retailer);
                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-stone-800 bg-stone-900/90 p-2.5 hover:border-amber-500/40 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="font-serif text-xs font-bold text-stone-100 line-clamp-1">
                                {item.name}
                              </h5>
                              <button
                                onClick={() => onToggleSaveItem(item)}
                                className={`rounded p-1 text-xs transition-colors ${
                                  isSaved
                                    ? 'text-amber-400 bg-amber-500/10'
                                    : 'text-stone-400 hover:text-stone-200'
                                }`}
                                title={isSaved ? 'Remove from Moodboard' : 'Save to Moodboard'}
                                aria-label={isSaved ? 'Saved item' : 'Save item'}
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-amber-400">
                                {item.priceEstimate}
                              </span>
                              <span className="text-stone-400 font-medium">
                                at {item.retailer}
                              </span>
                            </div>

                            {item.description && (
                              <p className="mt-1 text-[10px] text-stone-400 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            <a
                              href={shopUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-stone-800 py-1 text-[11px] font-medium text-stone-200 hover:bg-amber-600 hover:text-stone-950 transition-colors"
                            >
                              <span>Shop Match</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar for User */}
              {isUser && (
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-stone-800 text-stone-300 border border-stone-700 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-stone-950/80 border border-stone-800 p-3.5 shadow-md">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Atelier Consultant is analyzing space ergonomics and materials...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-stone-800/90 bg-stone-950/80 p-3 backdrop-blur-sm"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask consultant to refine: e.g., 'Make the rug blue and add a brass floor lamp'..."
            disabled={isLoading}
            className="w-full rounded-xl border border-stone-700 bg-stone-900 py-2.5 pl-4 pr-12 text-xs text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-1.5 rounded-lg bg-amber-600 p-2 text-stone-950 hover:bg-amber-500 transition-colors disabled:opacity-40"
            aria-label="Send design instruction"
          >
            <Send className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </div>
  );
};
