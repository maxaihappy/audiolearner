import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser (allow up to 50mb for audio/documents)
app.use(express.json({ limit: '50mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// CENTRAL SERVER DATA STORE (Sync across PC & Mobile)
// ==========================================
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_FOLDERS = [
  {
    id: 'folder-bio',
    name: 'Biology: Cellular Respiration',
    color: '#10B981',
    icon: 'Leaf',
    description: 'Biochemical pathways, ATP synthesis, glycolysis, and mitochondria.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'folder-history',
    name: 'World History: The Silk Road',
    color: '#F59E0B',
    icon: 'Compass',
    description: 'Ancient trade networks across Eurasia connecting Chang’an to Rome.',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'folder-tech',
    name: 'AI & Computing: Transformers',
    color: '#6366F1',
    icon: 'Cpu',
    description: 'Self-attention, neural network architectures, and modern language models.',
    createdAt: Date.now() - 86400000 * 1,
  },
];

const INITIAL_FILES = [
  {
    id: 'file-bio-1',
    name: 'Glycolysis_and_ATP_Production.md',
    folderId: 'folder-bio',
    type: 'markdown',
    size: 3200,
    content: `# Glycolysis and Cellular Energy Production\n\nCellular respiration is the fundamental metabolic pathway through which aerobic organisms harvest chemical energy from nutrients to synthesize adenosine triphosphate, commonly known as ATP.\n\nThe entire process occurs in three successive stages: glycolysis in the cytosol, the citric acid cycle within the mitochondrial matrix, and oxidative phosphorylation along the inner mitochondrial cristae.\n\nGlycolysis begins with a single molecule of six-carbon glucose. Through a sequence of ten enzyme-catalyzed steps, glucose is cleaved into two molecules of three-carbon pyruvate. During this reaction, a net yield of two ATP molecules is produced via substrate-level phosphorylation, alongside two molecules of reduced nicotinamide adenine dinucleotide (NADH).\n\nNotably, glycolysis requires no molecular oxygen, making it an evolutionarily ancient process shared by nearly all living cells. When oxygen is abundant, pyruvate is transported across the double membrane of the mitochondrion into the matrix, where the enzyme pyruvate dehydrogenase converts it into acetyl coenzyme A, carbon dioxide, and additional NADH. This marks the transition to the Krebs cycle.`,
    duration: 85,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'file-bio-2',
    name: 'Mitochondria_and_Electron_Transport.txt',
    folderId: 'folder-bio',
    type: 'text',
    size: 2800,
    content: `The Mitochondrion: The Powerhouse and Electron Transport Chain\n\nMitochondria are often celebrated as the powerhouses of eukaryotic cells due to their ability to generate up to 34 ATP molecules per molecule of oxidized glucose.\n\nThe inner mitochondrial membrane houses four major protein complexes known as the electron transport chain. High-energy electrons donated by NADH and FADH2 travel through Complex I, Complex II, Coenzyme Q, Complex III, Cytochrome c, and Complex IV. As electrons pass through these complexes, protons are actively pumped out of the mitochondrial matrix into the intermembrane space.\n\nThis creates a steep electrochemical proton gradient known as the proton-motive force. Peter Mitchell won the Nobel Prize for discovering chemiosmosis: protons flow back down this gradient into the matrix exclusively through ATP synthase. The physical rotation of the ATP synthase enzyme catalyzes the phosphorylation of ADP to ATP. Finally, oxygen acts as the terminal electron acceptor, binding free protons and low-energy electrons to produce pure metabolic water.`,
    duration: 90,
    createdAt: Date.now() - 86400000 * 3 + 3600000,
  },
  {
    id: 'file-hist-1',
    name: 'Silk_Road_Geography_and_Trade.md',
    folderId: 'folder-history',
    type: 'markdown',
    size: 3100,
    content: `# The Silk Road: Crossroads of Continents\n\nThe Silk Road was not a single paved highway, but rather an intricate, shifting network of overland caravan tracks and maritime routes stretching over 4,000 miles across Eurasia.\n\nOriginating during the Han Dynasty around 130 BCE when diplomat Zhang Qian was dispatched on imperial missions westward, the network connected the ancient Chinese capital of Chang'an through the perilous Taklamakan Desert and the towering Pamir Mountains into Central Asia, Persia, the Levant, and ultimately the Mediterranean port cities of Antioch and Rome.\n\nWhile silk was indeed the preeminent luxury commodity valued by Roman elites for its delicate sheen and weightlessness, merchants also transported porcelain, spices, jade, glassware, textiles, and lapis lazuli. The trade was largely segmented: individual merchants rarely traveled the entire 4,000-mile expanse. Instead, goods were bought, traded, and marked up at strategic oasis caravan cities like Samarkand, Kashgar, Dunhuang, and Bukhara.`,
    duration: 88,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'file-hist-2',
    name: 'Cultural_and_Technological_Exchange.txt',
    folderId: 'folder-history',
    type: 'text',
    size: 2900,
    content: `The Silk Road: Exchange of Ideas, Religions, and Technologies\n\nThe true enduring legacy of the Silk Road was far greater than physical merchandise. It served as the primary conduit for the transmission of ideas, scientific philosophies, and world religions across continents.\n\nBuddhism spread from northern India through the Gandhara region into China and East Asia via traveling monks and pilgrims who built monastic grottos such as the Mogao Caves at Dunhuang. Later, Islam traveled across Central Asian trading routes, leading to blossoming centers of astronomy, mathematics, and medicine in cities like Bukhara and Samarkand during the Islamic Golden Age.\n\nCrucial technologies revolutionized the Western world after migrating westward along these routes. Foremost among them was paper making, which originated in China and spread westward following the Battle of Talas in 751 CE. Printing techniques, gunpowder, and the magnetic mariner's compass all traversed the Silk Road, laying the groundwork for the European Renaissance and the Age of Discovery.`,
    duration: 86,
    createdAt: Date.now() - 86400000 * 2 + 3600000,
  },
  {
    id: 'file-tech-1',
    name: 'Self_Attention_Mechanism_Deep_Dive.md',
    folderId: 'folder-tech',
    type: 'markdown',
    size: 3300,
    content: `# Self-Attention Mechanism: The Heart of Modern Transformers\n\nIntroduced in the landmark 2017 paper "Attention Is All You Need" by Vaswani and colleagues, the Transformer architecture superseded recurrent neural networks (RNNs) and LSTMs by replacing sequential processing with parallel self-attention.\n\nIn standard sequence models, hidden states had to be computed sequentially step by step, which hindered parallelization on GPUs and made learning long-range dependencies prone to vanishing gradients.\n\nSelf-attention overcomes this by computing representations of a sequence by relating different positions of that same sequence simultaneously. For every token in an input text, the model projects the token embedding into three vectors: Query (Q), Key (K), and Value (V).\n\nThe attention weights are computed using the scaled dot-product attention formula:\nAttention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V\n\nHere, taking the dot product between the Query of one word and the Keys of all other words measures their semantic affinity. Dividing by the square root of the key dimension prevents the dot products from growing excessively large, ensuring smooth gradients during backpropagation. Multi-head attention repeats this mechanism across distinct projection subspaces, enabling the model to jointly attend to syntactic structure, pronoun references, and factual connections.`,
    duration: 95,
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'file-tech-2',
    name: 'Transformer_Architectures_Summary.txt',
    folderId: 'folder-tech',
    type: 'text',
    size: 2600,
    content: `Overview of Transformer Architectures: Encoders, Decoders, and Hybrids\n\nModern Transformer models fall broadly into three architectural paradigms, each tailored to distinct computational objectives:\n\n1. Encoder-Only Models (e.g., BERT, RoBERTa):\nThese models use bidirectional attention to process all input tokens at once. They are ideal for comprehension tasks such as text classification, sentiment analysis, entity extraction, and semantic search, where understanding full context in both directions is critical.\n\n2. Decoder-Only Models (e.g., GPT series, Gemini Flash, Claude):\nThese models use causal masked self-attention, ensuring that token predictions at position t can only depend on previous tokens from position 1 to t-1. Because generation occurs autoregressively token by token, decoder models excel at open-ended creative writing, code generation, reasoning, and conversational dialogue.\n\n3. Encoder-Decoder Models (e.g., T5, BART):\nThese models combine a bidirectional encoder with an autoregressive decoder. They are particularly well-suited for sequence-to-sequence transformation tasks such as language translation, document summarization, and question answering where input and output formats differ significantly.`,
    duration: 82,
    createdAt: Date.now() - 86400000 * 1 + 3600000,
  },
];

interface ServerStore {
  folders: any[];
  files: any[];
  playbackSettings: any;
  lastUpdated: number;
}

function loadStore(): ServerStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.folders) && Array.isArray(parsed.files)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading store file, initializing default:', err);
  }

  const defaultStore: ServerStore = {
    folders: INITIAL_FOLDERS,
    files: INITIAL_FILES,
    playbackSettings: {
      speed: 1.0,
      voiceId: 'gemini-Kore',
      voiceEngine: 'gemini',
      voiceName: 'Kore (Studio Neural)',
      loopMode: 'off',
      autoPlayNext: true,
      volume: 1.0,
    },
    lastUpdated: Date.now(),
  };

  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: ServerStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    store.lastUpdated = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store to disk:', err);
  }
}

// In-memory cache synced with disk
let serverStore = loadStore();

// ==========================================
// SYNC API ENDPOINTS (PC <-> Mobile Sharing)
// ==========================================

// Get all files & folders
app.get('/api/data', (req, res) => {
  res.json({
    folders: serverStore.folders,
    files: serverStore.files,
    playbackSettings: serverStore.playbackSettings,
    lastUpdated: serverStore.lastUpdated,
  });
});

// Upload new files
app.post('/api/files', (req, res) => {
  const { newFiles } = req.body;
  if (!newFiles || !Array.isArray(newFiles)) {
    return res.status(400).json({ error: 'newFiles array is required' });
  }

  serverStore.files = [...newFiles, ...serverStore.files];
  saveStore(serverStore);

  res.json({
    success: true,
    count: newFiles.length,
    totalFiles: serverStore.files.length,
    lastUpdated: serverStore.lastUpdated,
  });
});

// Delete a file
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;
  serverStore.files = serverStore.files.filter((f) => f.id !== id);
  saveStore(serverStore);
  res.json({ success: true, lastUpdated: serverStore.lastUpdated });
});

// Move a file to another folder
app.put('/api/files/:id/folder', (req, res) => {
  const { id } = req.params;
  const { targetFolderId } = req.body;
  serverStore.files = serverStore.files.map((f) =>
    f.id === id ? { ...f, folderId: targetFolderId } : f
  );
  saveStore(serverStore);
  res.json({ success: true, lastUpdated: serverStore.lastUpdated });
});

// Create folder
app.post('/api/folders', (req, res) => {
  const { folder } = req.body;
  if (!folder || !folder.name) {
    return res.status(400).json({ error: 'folder with name is required' });
  }

  serverStore.folders.push(folder);
  saveStore(serverStore);
  res.json({ success: true, folder, lastUpdated: serverStore.lastUpdated });
});

// Delete folder and its files
app.delete('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  serverStore.folders = serverStore.folders.filter((f) => f.id !== id);
  serverStore.files = serverStore.files.filter((f) => f.folderId !== id);
  saveStore(serverStore);
  res.json({ success: true, lastUpdated: serverStore.lastUpdated });
});

// Update global playback settings
app.put('/api/settings', (req, res) => {
  const { settings } = req.body;
  if (settings) {
    serverStore.playbackSettings = { ...serverStore.playbackSettings, ...settings };
    saveStore(serverStore);
  }
  res.json({ success: true, settings: serverStore.playbackSettings });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    fileCount: serverStore.files.length,
    folderCount: serverStore.folders.length,
  });
});

// Text-To-Speech endpoint via Gemini 3.8 Flash Lite TTS
app.post('/api/ai/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured on server; fallback to browser speech synthesis.',
      });
    }

    const trimmedText = text.slice(0, 1500);
    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Natural, articulate, engaging educational narrator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(200).json({
        fallback: true,
        message: 'No audio returned from Gemini TTS; fallback to browser speech synthesis.',
      });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voice: chosenVoice,
    });
  } catch (err: any) {
    console.error('Error generating speech with Gemini:', err?.message || err);
    return res.status(200).json({
      fallback: true,
      error: err?.message || 'Gemini TTS request failed',
    });
  }
});

// AI Question Generator for Folder Content
app.post('/api/ai/folder-questions', async (req, res) => {
  try {
    const { folderTitle, files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      const sampleFile = files[0];
      return res.json({
        folderSummary: `Overview of ${folderTitle} covering key principles from ${files.map(f => f.name).join(', ')}.`,
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: `Based on "${sampleFile.name}", what is the primary takeaway or fundamental mechanism described?`,
            options: [
              'It provides structured methodology for deep comprehension and application',
              'It replaces systematic study with passive listening only',
              'It focuses exclusively on unrelated historical dates without context',
              'None of the above',
            ],
            correctOptionIndex: 0,
            explanation: 'The materials focus on core foundational comprehension and retention.',
            relatedFile: sampleFile.name,
          },
          {
            id: 'q2',
            type: 'open-ended',
            question: `In your own words, summarize how the core themes in "${folderTitle}" connect to practical real-world problems.`,
            options: [],
            correctOptionIndex: -1,
            explanation: 'A strong answer connects key concepts from the uploaded text to real applications.',
            relatedFile: sampleFile.name,
          },
        ],
      });
    }

    const fileSnippets = files
      .map((f: { name: string; content?: string }, idx: number) => {
        const text = (f.content || '').slice(0, 4000);
        return `--- File ${idx + 1}: ${f.name} ---\n${text}\n`;
      })
      .join('\n');

    const prompt = `You are an expert tutor creating an interactive study & comprehension session for the folder "${folderTitle}".
Analyze the following uploaded files carefully and produce a comprehensive set of 3 to 5 engaging learning questions to test and deepen the student's understanding.

Uploaded Materials:
${fileSnippets}

Instructions:
1. Provide a concise 2-sentence study summary of what this folder is about.
2. Formulate 3 to 5 high-quality questions:
   - Include 2 or 3 'multiple-choice' questions (each with exactly 4 options, a 0-indexed correctOptionIndex, and a clear explanation).
   - Include 1 or 2 'open-ended' conceptual questions that prompt the student to explain or synthesize concepts in their own words. For open-ended questions, provide an empty options array and correctOptionIndex -1, but give a thorough guideline explanation of what a great answer covers.
3. Identify which file each question is most directly based upon.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            folderSummary: {
              type: Type.STRING,
              description: 'A brief 1-2 sentence overview of the folder subject matter.',
            },
            questions: {
              type: Type.ARRAY,
              description: 'List of interactive quiz questions based on the folder files.',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "'multiple-choice' or 'open-ended'",
                  },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Four choices for multiple choice, or empty for open-ended',
                  },
                  correctOptionIndex: {
                    type: Type.INTEGER,
                    description: '0-3 for multiple choice, or -1 for open-ended',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Educational rationale and explanation',
                  },
                  relatedFile: {
                    type: Type.STRING,
                    description: 'Name of the source file',
                  },
                },
                required: ['id', 'type', 'question', 'explanation'],
              },
            },
          },
          required: ['folderSummary', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating folder questions:', err?.message || err);
    return res.status(500).json({
      error: 'Failed to generate study questions.',
      details: err?.message,
    });
  }
});

// Evaluate user's open-ended answer
app.post('/api/ai/evaluate-answer', async (req, res) => {
  try {
    const { question, userAnswer, explanation, folderTitle } = req.body;

    if (!userAnswer || !question) {
      return res.status(400).json({ error: 'Question and userAnswer are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        score: 85,
        verdict: 'Good understanding!',
        feedback:
          'Your answer captures the core concept nicely. Review the source file for further details.',
        keyPointsCovered: ['Key concept identified', 'Relevant practical reasoning'],
        keyPointsMissed: ['Specific terminology mentioned in the file'],
      });
    }

    const prompt = `You are a supportive, encouraging academic tutor. A student is studying the folder "${folderTitle}".
Question asked: "${question}"
Guideline answer/rubric: "${explanation}"
Student's response: "${userAnswer}"

Evaluate the student's answer fairly and constructively.
Rate their understanding on a scale of 0 to 100, give a short 1-line verdict, specific encouraging feedback, bullet points of key points they covered, and any nuances they missed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: 'Score from 0 to 100 representing comprehension quality',
            },
            verdict: {
              type: Type.STRING,
              description: "Short punchy status like 'Spot on!', 'Strong effort!', or 'Needs review'",
            },
            feedback: {
              type: Type.STRING,
              description: 'Constructive 2-3 sentence personalized feedback',
            },
            keyPointsCovered: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyPointsMissed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['score', 'verdict', 'feedback', 'keyPointsCovered'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error evaluating answer:', err?.message || err);
    return res.status(500).json({
      error: 'Failed to evaluate answer',
      details: err?.message,
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AudioLearner server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
