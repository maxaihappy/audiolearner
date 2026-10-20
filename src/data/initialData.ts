import { Folder, UploadedFile } from '../types';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'folder-bio',
    name: 'Biology: Cellular Respiration',
    color: '#10B981', // Emerald
    icon: 'Leaf',
    description: 'Biochemical pathways, ATP synthesis, glycolysis, and mitochondria.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'folder-history',
    name: 'World History: The Silk Road',
    color: '#F59E0B', // Amber
    icon: 'Compass',
    description: 'Ancient trade networks across Eurasia connecting Chang’an to Rome.',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'folder-tech',
    name: 'AI & Computing: Transformers',
    color: '#6366F1', // Indigo
    icon: 'Cpu',
    description: 'Self-attention, neural network architectures, and modern language models.',
    createdAt: Date.now() - 86400000 * 1,
  },
];

export const INITIAL_FILES: UploadedFile[] = [
  {
    id: 'file-bio-1',
    name: 'Glycolysis_and_ATP_Production.md',
    folderId: 'folder-bio',
    type: 'markdown',
    size: 3200,
    content: `# Glycolysis and Cellular Energy Production

Cellular respiration is the fundamental metabolic pathway through which aerobic organisms harvest chemical energy from nutrients to synthesize adenosine triphosphate, commonly known as ATP. 

The entire process occurs in three successive stages: glycolysis in the cytosol, the citric acid cycle within the mitochondrial matrix, and oxidative phosphorylation along the inner mitochondrial cristae.

Glycolysis begins with a single molecule of six-carbon glucose. Through a sequence of ten enzyme-catalyzed steps, glucose is cleaved into two molecules of three-carbon pyruvate. During this reaction, a net yield of two ATP molecules is produced via substrate-level phosphorylation, alongside two molecules of reduced nicotinamide adenine dinucleotide (NADH).

Notably, glycolysis requires no molecular oxygen, making it an evolutionarily ancient process shared by nearly all living cells. When oxygen is abundant, pyruvate is transported across the double membrane of the mitochondrion into the matrix, where the enzyme pyruvate dehydrogenase converts it into acetyl coenzyme A, carbon dioxide, and additional NADH. This marks the transition to the Krebs cycle.`,
    duration: 85,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'file-bio-2',
    name: 'Mitochondria_and_Electron_Transport.txt',
    folderId: 'folder-bio',
    type: 'text',
    size: 2800,
    content: `The Mitochondrion: The Powerhouse and Electron Transport Chain

Mitochondria are often celebrated as the powerhouses of eukaryotic cells due to their ability to generate up to 34 ATP molecules per molecule of oxidized glucose. 

The inner mitochondrial membrane houses four major protein complexes known as the electron transport chain. High-energy electrons donated by NADH and FADH2 travel through Complex I, Complex II, Coenzyme Q, Complex III, Cytochrome c, and Complex IV. As electrons pass through these complexes, protons are actively pumped out of the mitochondrial matrix into the intermembrane space.

This creates a steep electrochemical proton gradient known as the proton-motive force. Peter Mitchell won the Nobel Prize for discovering chemiosmosis: protons flow back down this gradient into the matrix exclusively through ATP synthase. The physical rotation of the ATP synthase enzyme catalyzes the phosphorylation of ADP to ATP. Finally, oxygen acts as the terminal electron acceptor, binding free protons and low-energy electrons to produce pure metabolic water.`,
    duration: 90,
    createdAt: Date.now() - 86400000 * 3 + 3600000,
  },
  {
    id: 'file-hist-1',
    name: 'Silk_Road_Geography_and_Trade.md',
    folderId: 'folder-history',
    type: 'markdown',
    size: 3100,
    content: `# The Silk Road: Crossroads of Continents

The Silk Road was not a single paved highway, but rather an intricate, shifting network of overland caravan tracks and maritime routes stretching over 4,000 miles across Eurasia. 

Originating during the Han Dynasty around 130 BCE when diplomat Zhang Qian was dispatched on imperial missions westward, the network connected the ancient Chinese capital of Chang'an through the perilous Taklamakan Desert and the towering Pamir Mountains into Central Asia, Persia, the Levant, and ultimately the Mediterranean port cities of Antioch and Rome.

While silk was indeed the preeminent luxury commodity valued by Roman elites for its delicate sheen and weightlessness, merchants also transported porcelain, spices, jade, glassware, textiles, and lapis lazuli. The trade was largely segmented: individual merchants rarely traveled the entire 4,000-mile expanse. Instead, goods were bought, traded, and marked up at strategic oasis caravan cities like Samarkand, Kashgar, Dunhuang, and Bukhara.`,
    duration: 88,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'file-hist-2',
    name: 'Cultural_and_Technological_Exchange.txt',
    folderId: 'folder-history',
    type: 'text',
    size: 2900,
    content: `The Silk Road: Exchange of Ideas, Religions, and Technologies

The true enduring legacy of the Silk Road was far greater than physical merchandise. It served as the primary conduit for the transmission of ideas, scientific philosophies, and world religions across continents.

Buddhism spread from northern India through the Gandhara region into China and East Asia via traveling monks and pilgrims who built monastic grottos such as the Mogao Caves at Dunhuang. Later, Islam traveled across Central Asian trading routes, leading to blossoming centers of astronomy, mathematics, and medicine in cities like Bukhara and Samarkand during the Islamic Golden Age.

Crucial technologies revolutionized the Western world after migrating westward along these routes. Foremost among them was paper making, which originated in China and spread westward following the Battle of Talas in 751 CE. Printing techniques, gunpowder, and the magnetic mariner's compass all traversed the Silk Road, laying the groundwork for the European Renaissance and the Age of Discovery.`,
    duration: 86,
    createdAt: Date.now() - 86400000 * 2 + 3600000,
  },
  {
    id: 'file-tech-1',
    name: 'Self_Attention_Mechanism_Deep_Dive.md',
    folderId: 'folder-tech',
    type: 'markdown',
    size: 3300,
    content: `# Self-Attention Mechanism: The Heart of Modern Transformers

Introduced in the landmark 2017 paper "Attention Is All You Need" by Vaswani and colleagues, the Transformer architecture superseded recurrent neural networks (RNNs) and LSTMs by replacing sequential processing with parallel self-attention.

In standard sequence models, hidden states had to be computed sequentially step by step, which hindered parallelization on GPUs and made learning long-range dependencies prone to vanishing gradients. 

Self-attention overcomes this by computing representations of a sequence by relating different positions of that same sequence simultaneously. For every token in an input text, the model projects the token embedding into three vectors: Query (Q), Key (K), and Value (V).

The attention weights are computed using the scaled dot-product attention formula:
Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V

Here, taking the dot product between the Query of one word and the Keys of all other words measures their semantic affinity. Dividing by the square root of the key dimension prevents the dot products from growing excessively large, ensuring smooth gradients during backpropagation. Multi-head attention repeats this mechanism across distinct projection subspaces, enabling the model to jointly attend to syntactic structure, pronoun references, and factual connections.`,
    duration: 95,
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'file-tech-2',
    name: 'Transformer_Architectures_Summary.txt',
    folderId: 'folder-tech',
    type: 'text',
    size: 2600,
    content: `Overview of Transformer Architectures: Encoders, Decoders, and Hybrids

Modern Transformer models fall broadly into three architectural paradigms, each tailored to distinct computational objectives:

1. Encoder-Only Models (e.g., BERT, RoBERTa):
These models use bidirectional attention to process all input tokens at once. They are ideal for comprehension tasks such as text classification, sentiment analysis, entity extraction, and semantic search, where understanding full context in both directions is critical.

2. Decoder-Only Models (e.g., GPT series, Gemini Flash, Claude):
These models use causal masked self-attention, ensuring that token predictions at position t can only depend on previous tokens from position 1 to t-1. Because generation occurs autoregressively token by token, decoder models excel at open-ended creative writing, code generation, reasoning, and conversational dialogue.

3. Encoder-Decoder Models (e.g., T5, BART):
These models combine a bidirectional encoder with an autoregressive decoder. They are particularly well-suited for sequence-to-sequence transformation tasks such as language translation, document summarization, and question answering where input and output formats differ significantly.`,
    duration: 82,
    createdAt: Date.now() - 86400000 * 1 + 3600000,
  },
];
