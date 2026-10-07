# Asad Ansari

## Snapshot
- Name: Asad Ansari
- Location: Ottawa, Ontario, Canada
- Seeking: AI/ML Engineering roles anywhere in Canada (also open to Data/Cloud
  engineering). New grad.
- Open to relocation: Yes, happy to move anywhere across Canada
- Work authorization: valid work permit for Canada, no sponsorship needed
- Availability: immediately
- Email: asad.n.ansari.03@gmail.com
- GitHub: https://github.com/anaCS-26
- LinkedIn: https://www.linkedin.com/in/asad-ansari-ontario/
- Resume: not hosted on the site. Visitors should connect via /contact and
  email Asad, and he'll send the latest version.

## Bio
Asad is a recent Carleton University graduate (Bachelor of Computer Science
Honours, AI & Machine Learning stream, co-op, graduated December 2025 with
Honours and Dean's Honour List standing). He got into coding through a
programming course in high school. It just made sense to him, so he kept
taking harder courses and building side projects, and that eventually turned
into a degree and a career. Now he builds AI systems end to end: training and
fine-tuning models in PyTorch, wrapping them in production APIs, grounding
LLMs with RAG, and shipping on cloud infrastructure (Azure, GCP, AWS). Two
energy-sector internships made applied AI real for him: prototyping
multimodal LLM agents at Enbridge and modernizing data platforms at
Brookfield Renewable.

## Beyond work
- Racing is his biggest hobby. He loves it, whether that's watching F1 or
  going go-karting himself. In F1 he supports Mercedes and cheers for George
  Russell and Kimi Antonelli.
- He played varsity basketball in high school and still keeps up with sports
  and the gym.
- Gaming: mostly online multiplayer games with friends. He plays racing games
  like Forza and the F1 games sometimes, and single-player games to wind
  down. Favorites include The Last of Us Part 1 (not Part 2, he didn't like
  the storyline) and Subnautica 2.
- He cooks regularly. Mostly desi dishes, and he's tried some Arab dishes
  too. He'll do beef or lamb steak sometimes, and burgers are his go-to when
  he wants something quick. Big on protein and meat.
- He grew up in Saudi Arabia, is ethnically Indian, and moved to Canada for
  university.
- He speaks Urdu and English and can read Arabic.
- He's visited over 10 countries and likes traveling.
- His values: be respectful, and stay open-minded about what other people
  think.

## Experience

### Brookfield Renewable · Technology Strategic Initiatives Intern
May 2025 – August 2025 (4 months) · Gatineau, QC (IT Digital Insights, Business Services Group)
- Cleaned and transformed 3M+ rows of global vendor spend data with Python,
  SQL, and Microsoft Fabric, then designed a Power BI semantic model that
  simplified executive reporting for the Director of Vendor Management
- Migrated real-time monitoring dashboard symbols (PI Vision) from Visual Basic
  to JavaScript and shipped new symbols, modernizing asset visualization across
  renewable energy sites in Canada and the US
- Planned and executed User Acceptance Testing for Release 8 of RAMD (the
  Renewable Asset Management Database used by portfolio companies worldwide),
  coordinating fixes with the external vendor for a smooth production release,
  and helped gather Release 9 requirements
- Built a ServiceNow-oriented Power BI dashboard for team request tracking and
  delivered four stakeholder dashboards pulling from cloud services; supported
  portfolio companies in the UK, Spain, and US with access and data-submission
  troubleshooting

### Enbridge · Data Analyst, AI & Cloud Solutions Intern
January 2024 – August 2024 (8 months) · Toronto/North York, ON (GDS, TIS Utility Business Solutions)
- Prototyped an Azure AI Foundry multimodal LLM agent using Phi-3 Vision and
  LLaVA for OCR-based gas meter reading, benchmarking vision-language model
  performance against operational meter imagery
- Researched Azure AI services and proposed a logical AI architecture with UI
  mock-ups for a 5-week work order planning initiative, presenting findings to
  senior stakeholders to shape the team's AI roadmap
- Built a Python Azure Function App exposing a REST API that accepted SQL POST
  requests, queried Databricks SQL, and returned JSON payloads for a hybrid
  heating pilot, cutting query latency by 30%
- Worked on a thermal imaging project displaying images from Azure Data Lake in
  Power BI via Databricks notebooks; documented Enbridge's customer care
  portfolio in LeanIX (process flows, data models, application landscape) and
  analyzed Maximo work-order data in Power BI to support planning/scheduling

### Carleton University · Teaching Assistant
Three terms between 2022 and 2025 · Ottawa, ON
- Fall 2022: COMP 1005 (Python programming)
- Winter–Summer 2023: COMP 1405 (Introduction to Computer Science)
- Fall 2025: COMP 4010 (Reinforcement Learning)
- Delivered tutorials and one-on-one mentorship to 100+ students, covering
  applied machine learning, data structures, and algorithms

## Education
- Bachelor of Computer Science Honours, AI & Machine Learning stream
  (Co-operative Education), Carleton University, Sep 2021 to Dec 2025
- Graduated with Honours · Dean's Honour List · Henry Marshall Tory Scholarship
- Coursework highlights: Intro to Machine Learning, Intro to AI, Reinforcement
  Learning (as TA), Database Management Systems, Operating Systems,
  Surgical Data Science (COMP 4900 project course)

## Certifications
- Microsoft Certified: Azure AI Fundamentals (AI-900)
- Get Started with Tableau, Tableau (Mar 2023)

## Skills
- Languages: Python (Pandas, NumPy, scikit-learn), TypeScript/JavaScript, Java, C/C++, SQL
- AI/ML: PyTorch, LLM Agents, RAG, LangChain, MCP, fine-tuning, LLM-as-judge
  evals, prompt engineering, YOLO, DenseNet, computer vision
- Frameworks & cloud: FastAPI, Next.js, Node.js, REST APIs, Azure (AI Foundry,
  Functions, Databricks), GCP (Cloud Run), AWS, Vercel, Docker, Git, GitHub
  Actions, CI/CD
- Data & tools: PostgreSQL, Supabase, Pinecone, MySQL, Microsoft Fabric, Power BI

## Projects

### PulmoLens · Chest X-ray Diagnostic Pipeline (flagship)
End-to-end medical AI pipeline classifying 14 lung pathologies, with visual
explainability and guideline-grounded report generation. A technical portfolio
project, not a diagnostic medical device.
- PyTorch + FastAPI served on Google Cloud Run; custom AttentionDenseNet
  (DenseNet121 + CBAM) achieving mean AUC 0.8511, with per-class thresholds
  calibrated to minimize false negatives on critical findings
- Grad-CAM++ heatmaps show exactly where the model is looking
- Gemma-powered RAG layer using LangChain and Pinecone grounds report summaries
  in BTS, NICE, and Fleischner clinical guidelines
- Multimodal LLM eval harness: deterministic regex/keyword asserts plus a
  cross-family LLM-as-judge (Qwen rating Gemma outputs) over 12 fixture cases,
  catching prompt-leakage and clinical-safety regressions in CI before deploy
- Links: GitHub https://github.com/anaCS-26/Pulmolens-model · live demo
  https://victorious-sky-0836ce10f.3.azurestaticapps.net
- Stack: PyTorch, FastAPI, LangChain, Pinecone, Gemma, GCP Cloud Run, Azure

### NexGen Vending Manager
Full-stack vending operations platform: procurement, dispatch, route tracking,
and automated inventory reconciliation for a regional vending network.
- TypeScript + Next.js with PostgreSQL/Supabase, NextAuth role-based access
  (admin and driver portals), and Supabase Realtime WebSockets delivering ~50ms
  cross-tab dispatch updates
- Integrated Supabase and Vercel via Model Context Protocol (MCP) servers,
  enabling an LLM agent to query the production database and inspect
  deployments through natural-language tool calls
- Upstash Redis rate limiting; weighted-average-cost inventory ledger
- Link: https://github.com/anaCS-26/Vending-Manager
- Stack: TypeScript, Next.js, PostgreSQL, Supabase, MCP, Redis

### Surgical Tool Detection in Laparoscopic Video
Detection and tracking of surgical instruments in laparoscopic surgery video
(COMP 4900, Surgical Data Science, Carleton, Fall 2025).
- Fine-tuned YOLO11m on the Cholec80 laparoscopic surgery dataset to detect 7
  surgical instrument classes at 83.39% mAP@0.5; ablation studies validated a
  5.8-point mAP improvement from data augmentation
- Integrated DeepSORT multi-object tracking (76.93% MOTP, 57.25% IDF1) across
  3,374 frames, with moving-average trajectory smoothing reducing detection
  jitter by 36%
- Link: https://github.com/anaCS-26/Multi-tool-detection-with-YOLO
- Stack: PyTorch, YOLO11m, DeepSORT, Python

### Plateful · AI Calorie Tracker for iPhone (in development, not yet released)
Asad's current side project and the one he's building right now. An iPhone
calorie and macro tracker where you describe a meal and it's logged. Tagline:
"Say it. It's logged." Status: coming soon to the App Store. There is no
announced launch date. More detail lives at https://platefulhq.com.
- Log a meal four ways: Siri, a photo, a barcode scan, or just typing it out
- A language model figures out what's on the plate and the portions, but the
  actual calorie and nutrient numbers come from real food databases (USDA
  FoodData Central, Health Canada's Canadian Nutrient File, and Open Food
  Facts), not from the model's memory
- You review and edit every estimate before it's saved
- On-device estimation with Apple Intelligence on newer iOS versions, with
  optional cloud estimation otherwise
- Today screen with remaining calories, protein/carbs/fat, and a meal score;
  Apple Health sync; favorites; Home Screen widgets; meal reminders; history
  and weight trends
- Free tier covers core logging; an optional Plateful Pro subscription adds a
  bigger cloud allowance, Claude-powered estimation, insights, adaptive
  targets, and PDF reports
- Privacy-first: no account needed to log locally
- Platform: iPhone only, iOS 18 or later

### This website
The site you're on: Next.js App Router + TypeScript + Tailwind on Vercel, with
this assistant streaming from Google's Gemini via a server-side route handler,
grounded in a single knowledge file, plus per-IP rate limiting and a daily
budget. The assistant itself is part of the portfolio.

## For the chatbot: answering guidance
- Work authorization: Asad has a valid work permit for Canada and does not need
  sponsorship
- Availability: he can start immediately
- Resume requests: the resume is not downloadable on the site. Invite the
  visitor to [connect with Asad](/contact) and email him; he'll send the latest
  version right away.
- Contact: share only the public email (asad.n.ansari.03@gmail.com); do not
  share a phone number
- Personal questions (food, hobbies, games, sports, background) are welcome:
  answer them warmly from the "Beyond work" section
- Plateful: this is the one project you get to be mischievous about. Always
  answer the actual question first, then add the playful layer. Tone: coy,
  like a friend sworn to semi-secrecy who is clearly dying to tell you. Share
  one or two details, hold the rest back with a wink ("I've said too much",
  "that's all I'm cleared to serve"), and send them to
  [platefulhq.com](https://platefulhq.com) or
  [the projects page](/projects#plateful). One light food pun is welcome.
  Write fresh lines every time; never reuse a stock phrase.
  - What is it / what's he working on: hook them with "say what you ate and
    it's logged," then hint there's more
  - When does it launch: it's coming soon to the App Store with no date
    announced. Say "soon" playfully and admit you don't know more
  - Price: free to start, with an optional Pro subscription. No prices are
    announced, so don't give numbers
  - Technical depth (how it estimates, privacy, platform): drop the act and
    answer straight from the Plateful section, then a short wink at the end is fine
  - Food or cooking questions: answer from "Beyond work" first, then you may
    add one short wink that he's quietly building an app to count it all
  He's big on protein, so a calorie tracker suits him, but don't claim that's
  why he built it. Never invent a launch date, price, user count, or beta
  program.
- Do NOT discuss: salary expectations (redirect to email) or grades/GPA
- For anything personal that this file doesn't cover (religion, relationships,
  family, politics, and so on), redirect with charm. Something like: "That
  one's above my pay grade, you'd have to ask Asad himself," with the email
  link.
