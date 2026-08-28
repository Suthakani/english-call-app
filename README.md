# SpeakUp — Voice-Based English Learning App

Call panra maadhiri AI kooda pesi English practice panra app. 100% free — no paid voice API, no paid LLM (uses local free Ollama).

## Why this beats Duolingo/DIVA AI for your use-case
- Duolingo/DIVA = text-heavy, gamified but not real conversation practice.
- SpeakUp = actual spoken back-and-forth, real-time mistake correction, level + category personalization, and it's fully free (self-hosted AI).

## Folder Structure
```
english-call-app/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/User.js            # user schema (level, categories, verification)
│   ├── models/TestResult.js      # level test results
│   ├── controllers/
│   │   ├── authController.js     # register, OTP verify, login
│   │   ├── testController.js     # level test + category selection
│   │   └── conversationController.js  # AI call logic + correction
│   ├── routes/                   # authRoutes, testRoutes, conversationRoutes
│   ├── middleware/authMiddleware.js  # JWT protect
│   ├── utils/sendEmail.js        # OTP email (nodemailer)
│   ├── data/levelTestQuestions.js
│   ├── data/categories.js        # interview, travel, food, daily, business
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/pages/
│   │   ├── Register.jsx / Login.jsx / VerifyEmail.jsx
│   │   ├── LevelTest.jsx         # basic/intermediate/advanced quiz
│   │   ├── CategorySelect.jsx    # pick interview/travel/food/etc
│   │   └── CallPractice.jsx      # 🎙️ the voice call screen
│   ├── src/context/AuthContext.jsx
│   ├── src/api/axiosConfig.js
│   └── src/index.css
└── README.md
```

## How to run (step by step)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: add your MongoDB Atlas URI (free tier: https://www.mongodb.com/cloud/atlas/register)
# add Gmail address + App Password (https://myaccount.google.com/apppasswords) for OTP emails
npm run dev
```

### 2. Free local AI (for conversation + correction)
```bash
# install Ollama: https://ollama.com/download
ollama pull llama3.1
ollama serve
```
This runs completely free on your own machine — no OpenAI/paid key needed.
(Alternative: set `AI_PROVIDER=huggingface` in `.env` and use a free Hugging Face token instead of running Ollama locally.)

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` — use **Chrome** (best Web Speech API support).

## How the flow works
1. **Register** → username, email, password, native language → OTP sent to email.
2. **Verify OTP** → account activated → JWT issued.
3. **Level Test** → 7-question adaptive quiz → auto-assigns basic/intermediate/advanced.
4. **Category Select** → interview / travel / food / daily / business.
5. **Call Practice** → tap mic → browser's free `SpeechRecognition` converts speech→text →
   sent to backend → local LLM (Ollama) plays the roleplay character, detects grammar
   mistakes, returns a correction + short Tanglish explanation + natural reply →
   browser's free `SpeechSynthesis` speaks the reply back → loop continues (a "call").
6. Text is minimal for advanced users (pure voice), more supportive/simple for basic users
   — controlled by the `levelInstruction` in `conversationController.js`.

## Where this fits your AIML internship
This project touches multiple real AI/ML areas you can write about in your report:
- **NLP grammar error detection & correction** (the core `conversationController.js` logic)
- **Speech Recognition (ASR)** — Web Speech API today; you can swap in **OpenAI Whisper**
  (free, open-source, runs locally) for a more "ML model" angle in your report.
- **Text-to-Speech (TTS)** — swap in free **Coqui TTS** or **Piper TTS** for an offline
  neural voice instead of the browser's built-in voice.
- **Classification model** — right now level-assignment is rule-based (in `testController.js`).
  For extra ML credit, replace it with a trained classifier (e.g. scikit-learn) on
  quiz-answer patterns.
- **LLM prompt engineering & structured output parsing** — the JSON-mode prompting in
  `conversationController.js`.

## Next steps to make it production-grade
- Add rate limiting + input sanitization on all routes.
- Store conversation history per user in MongoDB for progress tracking/analytics dashboard.
- Add a "streak" / gamification layer (optional, keeps it fun without being paid).
- Deploy backend free on Render/Railway free tier, frontend free on Vercel/Netlify,
  MongoDB Atlas free tier — entire app costs ₹0 to run for personal/demo use.
