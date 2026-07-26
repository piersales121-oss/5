import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCBHrYEcUwBMFDfVXcSfPLVvXd2CavmCKM';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Gemini Tool / Chat API Endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, imageBase64, mimeType = 'image/jpeg', isImageOutput = false } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    if (isImageOutput) {
      // Use image model
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [
            ...(imageBase64 ? [{ inlineData: { data: imageBase64, mimeType } }] : []),
            { text: prompt || 'Generate educational diagram or illustration.' },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
          },
        },
      });

      let imageUrl = null;
      let outputText = '';

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
          if (part.text) {
            outputText += part.text;
          }
        }
      }

      return res.json({ text: outputText || 'Generated Image:', imageUrl });
    }

    // Default text & vision generation
    const contents: any = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }
    contents.push({ text: prompt });

    const modelName = 'gemini-3.6-flash';
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemInstruction || 'You are EduZoon AI, an expert Bengali & English AI educational assistant for students and teachers. Provide accurate, clear, and well-formatted answers with Bengali explanations where appropriate. Use bullet points and bold headers for legibility.',
      },
    });

    const textOutput = response.text || 'No response generated.';
    return res.json({ text: textOutput });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: err.message || 'Gemini API Error',
      details: 'Please check your API key or network connection.',
    });
  }
});

// Google Sheets Proxy endpoint (Permanent Apps Script WebApp)
app.post('/api/auth/sheets-proxy', async (req, res) => {
  try {
    const { scriptUrl, action, data } = req.body;
    const targetScriptUrl = scriptUrl || 'https://script.google.com/macros/s/AKfycbxZ9zi8tz1h8lMDp_T_n9V_3upMTNvo5bkjVFNpMgXf-I6dkpXC63ajG4ONgJN3wCKY/exec';

    const response = await fetch(targetScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });

    const result = await response.json().catch(() => ({ status: 'SUCCESS' }));
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Google Sheets sync failed: ' + err.message });
  }
});

// Vite / Production Static Serve
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Vite Dev Server middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`EduZoon server running at http://localhost:${PORT}`);
});
