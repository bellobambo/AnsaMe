# AnsaMe

AnsaMe is an exam practicing pplatform powered by Gemma 4, 
built specifically for Nigerian students preparing for JAMB,
WAEC, and NECO. Students sign in with Google, choose an exam, class arm,
subject, topic, and difficulty, then generate a 20-question practice session
with Gemma 4. WAEC and NECO sessions also include 4 theory questions. After
answering, they can review their score, inspect each mistake, request a simple
answer explanation, open a focused topic study guide, and revisit past practice
sessions.

## Problem

Many Nigerian secondary-school students revise with static past-question PDFs,
limited explanations, and little personalization. AnsaMe turns revision into a
guided loop:

1. Pick the exam target and class arm: Arts, Science, Commercial, Technical,
   General, or Electives.
2. Choose from related subjects, with core General subjects available across
   the class arms.
3. Let AI suggest relevant topics, or enter a custom topic.
4. Generate exam-style multiple-choice questions.
5. For WAEC and NECO, answer 4 theory questions by typing, uploading a photo of
   written work, or both.
6. Submit answers and immediately see correct and incorrect choices.
7. Use AI explanations, theory feedback, and topic deep-dives to understand the
   weak areas.
8. Return to saved practice history for later revision.

## Features

- Google sign-in with session cookies
- Class-arm subject filtering for Arts, Science, Commercial, Technical,
  General, and Electives
- Gemma 4 topic suggestions and question generation
- WAEC and NECO theory-question generation
- Practice sessions with saved answers and results
- Results review with correct/incorrect option indicators
- AI answer explanations for individual questions
- AI marking for typed or photographed theory answers using a 75% similarity
  threshold
- AI topic study guides for targeted revision
- Practice history per signed-in user
- MongoDB-backed persistence for users, sessions, answers, explanations, and
  topic guides

## Gemma 4 Usage

AnsaMe uses Gemma 4 in four user-facing flows:

- Topic suggestions for a selected exam and subject
- Structured 20-question practice-session generation
- WAEC and NECO theory-question generation
- Theory-answer marking from typed responses and uploaded images
- Simple explanations for missed or reviewed answers
- Topic deep-dives that summarize key ideas, common mistakes, and revision tips

The model is called through a single wrapper in `lib/gemma.ts`, which keeps the
model choice explicit and easy to audit.

## Model Selection

The project currently uses:

```ts
gemma-4-31b-it
```

This is the dense 31B Gemma 4 model. It was chosen intentionally because
AnsaMe needs stronger instruction following and more reliable structured output
than a small edge model would typically provide. The app asks the model to
generate exam-specific JSON, keep question options consistent, adapt to JAMB,
WAEC, and NECO standards, assess theory answers against marking guides, and
explain answers in language that is useful for secondary-school students.

The smaller Gemma 4 models would be a better fit for an offline browser or
mobile-first version of AnsaMe. The MoE model would be attractive for high
throughput at larger scale. For this version, the dense 31B model is the right
tradeoff because quality, exam alignment, and explanation clarity matter more
than on-device deployment.

## Architecture

- `app/api/ai/generate-topics` creates topic suggestions.
- `app/api/ai/generate-questions` creates and stores practice sessions.
- `app/api/practice/submit` marks answers and stores results.
- `app/api/ai/explain-answer` generates per-question explanations.
- `app/api/ai/topic-deep-dive` generates focused topic study guides.
- `app/history` lets signed-in users revisit previous practice attempts.

AI responses that must be machine-readable are parsed as JSON before being
stored or returned to the UI.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` with:

```bash
MONGODB_URI=
MONGODB_DB=ansame
GEMINI_API_KEY=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APP_URL=http://localhost:3000
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev      # start local development
npm run build    # create production build
npm run start    # run production server
npm run lint     # run eslint
```

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS
- Ant Design Drawer
- MongoDB
- Google Gen AI SDK
- Gemma 4 31B dense instruction model
