# AnsaMe

AnsaMe is a Next.js exam-practice app for JAMB, WAEC, and NECO standard questions. Students sign in with Google, generate AI-assisted practice sessions, answer questions in a drawer-based interface, review results, and revisit practice history.

## Features

- Google sign-in with session cookies
- AI topic suggestions and question generation
- Practice sessions with saved answers and results
- Results review with correct/incorrect option indicators
- AI answer explanations and topic study guides
- Practice history per signed-in user

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
- Google Gemini API
