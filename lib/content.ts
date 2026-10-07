// Structured site content. Keep in sync with knowledge/about-me.md — that file
// is the chatbot's source of truth; this one drives the rendered sections.

export const identity = {
  name: "Asad Ansari",
  role: "AI/ML Engineer",
  tagline: "I build systems that learn",
  location: "Ottawa, Ontario, Canada",
  status: "open to AI/ML roles anywhere in Canada, willing to relocate",
  email: "asad.n.ansari.03@gmail.com",
  github: "https://github.com/anaCS-26",
  linkedin: "https://www.linkedin.com/in/asad-ansari-ontario/",
};

export type Project = {
  slug: string;
  name: string;
  pitch: string;
  bullets: string[];
  stack: string[];
  github?: string;
  demo?: string;
  site?: string;
  flagship?: boolean;
  /** Unreleased; shown under "In the works" instead of the main list */
  upcoming?: boolean;
};

export const projects: Project[] = [
  {
    slug: "pulmolens",
    name: "PulmoLens",
    pitch:
      "End-to-end chest X-ray diagnostic pipeline: 14 lung pathologies classified with visual explainability and guideline-grounded report generation.",
    bullets: [
      "Custom AttentionDenseNet (DenseNet121 + CBAM) in PyTorch with mean AUC 0.8511 and per-class thresholds calibrated to minimize false negatives; served with FastAPI on GCP Cloud Run",
      "Gemma-powered RAG layer (LangChain + Pinecone) grounds reports in BTS, NICE, and Fleischner clinical guidelines; Grad-CAM++ heatmaps show where the model looks",
      "Multimodal LLM eval harness with cross-family LLM-as-judge (Qwen rating Gemma) catching prompt-leakage and safety regressions in CI",
    ],
    stack: ["PyTorch", "FastAPI", "LangChain", "Pinecone", "Gemma", "Cloud Run"],
    github: "https://github.com/anaCS-26/Pulmolens-model",
    demo: "https://victorious-sky-0836ce10f.3.azurestaticapps.net",
    flagship: true,
  },
  {
    slug: "nexgen-vending",
    name: "NexGen Vending Manager",
    pitch:
      "Full-stack vending operations platform: procurement, dispatch, route tracking, and automated inventory reconciliation.",
    bullets: [
      "Next.js + TypeScript with PostgreSQL/Supabase, NextAuth RBAC, and Realtime WebSockets delivering ~50ms cross-tab dispatch updates",
      "Supabase + Vercel wired up via MCP servers so an LLM agent can query the production DB and inspect deployments in natural language",
    ],
    stack: ["TypeScript", "Next.js", "PostgreSQL", "Supabase", "MCP"],
    github: "https://github.com/anaCS-26/Vending-Manager",
  },
  {
    slug: "surgical-tracking",
    name: "Surgical Tool Detection",
    pitch:
      "Detects and tracks surgical instruments across laparoscopic video frames for surgical workflow analysis.",
    bullets: [
      "YOLO11m fine-tuned on Cholec80 to detect 7 instrument classes at 83.39% mAP@0.5, with ablations validating a 5.8-point gain from augmentation",
      "DeepSORT tracking (76.93% MOTP, 57.25% IDF1) over 3,374 frames; trajectory smoothing cut detection jitter by 36%",
    ],
    stack: ["PyTorch", "YOLO11m", "DeepSORT", "Python"],
    github: "https://github.com/anaCS-26/Multi-tool-detection-with-YOLO",
  },
  {
    slug: "plateful",
    name: "Plateful",
    pitch:
      "An iPhone calorie tracker where you say what you ate and it's logged. Coming soon to the App Store.",
    bullets: [
      "Log by Siri, photo, barcode, or text: a language model identifies the foods and portions, then the numbers come from USDA, Health Canada, and Open Food Facts data rather than model memory",
      "On-device estimation with Apple Intelligence where supported, with every estimate reviewable before it's saved",
      "Apple Health sync, widgets, macro tracking, and weight trends, with no account needed to log locally",
    ],
    stack: ["iOS", "Apple Intelligence", "Claude", "HealthKit"],
    site: "https://platefulhq.com",
    upcoming: true,
  },
];

export type TimelineEntry = {
  org: string;
  title: string;
  period: string;
  years: string;
  /** Start and end as fractional years, for the timeline chart */
  span: [number, number];
  location: string;
  bullets: string[];
};

export const experience: TimelineEntry[] = [
  {
    org: "Brookfield Renewable",
    title: "Technology Strategic Initiatives Intern",
    period: "May – Aug 2025",
    years: "2025",
    span: [2025 + 4 / 12, 2025 + 8 / 12],
    location: "Gatineau, QC",
    bullets: [
      "Cleaned and transformed 3M+ rows of global vendor spend data (Python, SQL, Microsoft Fabric) into a Power BI semantic model for executive reporting",
      "Migrated PI Vision monitoring symbols from Visual Basic to JavaScript, modernizing asset visualization across renewable sites in Canada and the US",
      "Ran User Acceptance Testing for the RAMD Release 8 rollout and helped shape Release 9 requirements",
    ],
  },
  {
    org: "Enbridge",
    title: "Data Analyst, AI & Cloud Solutions Intern",
    period: "Jan – Aug 2024",
    years: "2024",
    span: [2024, 2024 + 8 / 12],
    location: "Toronto, ON",
    bullets: [
      "Prototyped an Azure AI Foundry multimodal LLM agent (Phi-3 Vision, LLaVA) for OCR-based gas meter reading",
      "Proposed an AI architecture with UI mock-ups for a 5-week work order planning initiative, presented to senior stakeholders",
      "Built a Python Azure Function App REST API querying Databricks SQL for a hybrid heating pilot, cutting query latency by 30%",
    ],
  },
  {
    org: "Carleton University",
    title: "Teaching Assistant",
    period: "2022 – 2025, 3 terms",
    years: "2022–25",
    span: [2022, 2025 + 4 / 12],
    location: "Ottawa, ON",
    bullets: [
      "Tutorials and 1:1 mentorship for 100+ students across Python (COMP 1005), Intro to Computer Science (COMP 1405), and Reinforcement Learning (COMP 4010)",
    ],
  },
];

export const education = {
  school: "Carleton University",
  degree: "BCS Honours, AI & Machine Learning stream (Co-op)",
  detail:
    "Graduated Dec 2025 with Honours · Dean's Honour List · Henry Marshall Tory Scholarship · Azure AI Fundamentals (AI-900)",
};

export const skills = [
  "Python",
  "PyTorch",
  "LLM Agents",
  "RAG",
  "LangChain",
  "MCP",
  "Computer Vision",
  "TypeScript",
  "FastAPI",
  "Next.js",
  "SQL",
  "PostgreSQL",
  "Azure",
  "GCP",
  "Docker",
  "CI/CD",
];
