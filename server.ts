/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Generous limit for high-resolution uploaded room photos
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize GoogleGenAI client with required 'aistudio-build' user agent header
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    models: {
      chat: 'gemini-3.8-flash',
      imageGeneration: 'gemini-nano-banana-2.1',
    },
  });
});

// Multi-turn Context-Aware Chat Endpoint (gemini-3.8-flash)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, currentContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const ai = getAiClient();
    const systemInstruction = `You are Atelier AI, a world-class Architectural Interior Design Consultant & Decor Stylist.
Your expertise spans high-end residential interiors, ergonomics, color psychology, lighting temperature (Kelvin), material honesty, and spatial balance.

CURRENT ROOM CONTEXT:
- Space Type: ${currentContext?.roomType || 'Living Space'}
- Active Reimagined Style: ${currentContext?.styleName || 'Mid-Century Modern'}
- Style Characteristics: ${currentContext?.styleDescription || 'Clean lines, warm timber, balanced textures'}
- Space Notes / User Modifications: ${currentContext?.userNotes || 'None yet'}

YOUR GOALS:
1. Offer warm, encouraging, authoritative interior designer critique and suggestions.
2. If the user asks for a refinement (e.g. "make the rug blue", "swap out the coffee table", "add pet-friendly fabrics"), explain why it works spatially and how it harmonizes with the active style.
3. Keep your advice structured, practical, and inspiring. Use markdown for headings and bullet points.
4. AT THE END of every response, provide 2 to 4 shoppable designer furniture and decor recommendations that match the user's inquiry and style. Output these inside a JSON block with this exact schema:
\`\`\`json
[
  {
    "id": "rec-1",
    "name": "Specific Product Name",
    "category": "Furniture" | "Lighting" | "Rugs & Textiles" | "Decor & Art" | "Storage",
    "retailer": "West Elm" | "CB2" | "Article" | "IKEA" | "Crate & Barrel" | "Pottery Barn" | "Nordic Knots",
    "priceEstimate": "$249 - $499",
    "description": "Short explanation of why this piece fits the design.",
    "searchQuery": "Search term for finding this product",
    "matchScore": 96,
    "tags": ["Hero Piece", "Pet Friendly", "Solid Wood"]
  }
]
\`\`\`
`;

    if (!ai) {
      // Graceful fallback when GEMINI_API_KEY is not yet attached
      const lastUserMsg = messages[messages.length - 1].text || '';
      const style = currentContext?.styleName || 'Mid-Century Modern';
      
      const reply = `### Design Consultation: ${style} Refinement\n\n` +
        `I love your design direction! For your ${currentContext?.roomType || 'room'}, addressing "${lastUserMsg}" ` +
        `creates a beautiful visual anchor while keeping the room feeling expansive and balanced.\n\n` +
        `**Stylist Recommendations:**\n` +
        `* **Layered Texture:** Pair smooth surfaces with tactile weaves like boucle or flat-weave wool to bring depth without clutter.\n` +
        `* **Lighting Temperature:** Aim for 2700K warm ambient fixtures (shaded pendants or indirect floor lamps) rather than harsh overhead beams.\n` +
        `* **Focal Proportion:** Ensure any secondary seating or tables follow a 2:3 proportion rule relative to your primary sofa.\n\n` +
        `*Note: You can attach your GEMINI_API_KEY in the Settings > Secrets panel for live streaming inference.*`;

      const shoppable = [
        {
          id: `demo-${Date.now()}-1`,
          name: `${style} Accent Piece`,
          category: 'Furniture',
          retailer: 'West Elm',
          priceEstimate: '$349 - $620',
          description: `Custom-tailored piece harmonizing directly with your ${style} palette.`,
          searchQuery: `${style} accent furniture`,
          matchScore: 97,
          tags: ['Stylist Pick', 'In Stock'],
        },
        {
          id: `demo-${Date.now()}-2`,
          name: 'Architectural Opal Globe Lamp',
          category: 'Lighting',
          retailer: 'CB2',
          priceEstimate: '$199',
          description: 'Diffused 2700K ambient illumination with weighted brass base.',
          searchQuery: 'Opal globe floor lamp brushed brass',
          matchScore: 95,
          tags: ['Warm Glow', 'Dimmable'],
        },
      ];

      res.json({
        text: `${reply}\n\n\`\`\`json\n${JSON.stringify(shoppable, null, 2)}\n\`\`\``,
        shoppable,
      });
      return;
    }

    // Format chat history for GoogleGenAI
    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction,
      },
    });

    // Send preceding turns if any
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      if (msg.role === 'user') {
        await chat.sendMessage({ message: msg.text });
      }
    }

    const latestMessage = messages[messages.length - 1].text;
    const response = await chat.sendMessage({ message: latestMessage });
    const replyText = response.text || 'Thank you for your design request.';

    res.json({ text: replyText });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error.message || 'Failed to process interior design consultation chat.',
    });
  }
});

// Image Makeover & Style Transfer Endpoint (gemini-nano-banana-2.1)
app.post('/api/generate-makeover', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', styleName, stylePrompt, userInstruction, aspectRatio = '4:3' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 image data is required.' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(403).json({
        error: 'GEMINI_API_KEY is not configured. Please attach a Gemini API key via the Settings > Secrets panel.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const promptText = `High-end architectural interior redesign of this exact room space into ${styleName} aesthetic. ` +
      `PRESERVE ROOM ARCHITECTURE: Maintain the exact window openings, natural light direction, ceiling perimeter, and floor plan. ` +
      `REPLACE & UPGRADE: Replace the existing furniture, wall finishes, rug, art, and light fixtures with authentic ${styleName} design elements: ${stylePrompt}. ` +
      (userInstruction ? `USER CUSTOM REFINEMENT: ${userInstruction}. ` : '') +
      `Ultra-photorealistic, high-end interior architecture photography, 8K resolution, crisp textures, natural ambient shadows, Architectural Digest feature quality.`;

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: '1K',
        },
      },
    });

    let generatedImageUrl: string | null = null;
    let descriptionText = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        descriptionText += part.text;
      }
    }

    if (!generatedImageUrl) {
      // If the model returned text description or safety filter prevented image return
      res.status(422).json({
        error: 'The AI model completed the request but did not return image pixels.',
        details: descriptionText,
      });
      return;
    }

    res.json({
      imageUrl: generatedImageUrl,
      description: descriptionText,
      style: styleName,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-makeover:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate AI room makeover.',
      code: error.code || 'GENERATION_ERROR',
    });
  }
});

// Refine Existing Design with Text Prompt Endpoint (gemini-nano-banana-2.1)
app.post('/api/refine-design', async (req: Request, res: Response) => {
  try {
    const { currentImageUrl, mimeType = 'image/png', refinementPrompt, styleName } = req.body;

    if (!currentImageUrl || !refinementPrompt) {
      res.status(400).json({ error: 'currentImageUrl and refinementPrompt are required.' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(403).json({
        error: 'GEMINI_API_KEY is not configured. Please attach a Gemini API key via the Settings > Secrets panel.',
        code: 'API_KEY_MISSING',
      });
      return;
    }

    const cleanBase64 = currentImageUrl.replace(/^data:image\/[a-z]+;base64,/, '');

    const promptText = `Modify this interior design photo with the following specific refinement: "${refinementPrompt}". ` +
      `Keep the overall ${styleName || 'interior'} room structure, furniture layout, and camera angle identical, ` +
      `only altering the requested items or colorways. Ultra-photorealistic interior architecture render, 8K quality.`;

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
          imageSize: '1K',
        },
      },
    });

    let generatedImageUrl: string | null = null;
    let descriptionText = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        descriptionText += part.text;
      }
    }

    if (!generatedImageUrl) {
      res.status(422).json({
        error: 'No image output generated by the model.',
        details: descriptionText,
      });
      return;
    }

    res.json({
      imageUrl: generatedImageUrl,
      description: descriptionText,
    });
  } catch (error: any) {
    console.error('Error in /api/refine-design:', error);
    res.status(500).json({
      error: error.message || 'Failed to refine design with AI.',
      code: error.code || 'REFINE_ERROR',
    });
  }
});

// Mount Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atelier AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
