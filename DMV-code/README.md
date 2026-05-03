# DriveReady - DMV Permit Test Prep

## What it does

DriveReady helps students prepare for DMV permit tests with state-specific practice questions, full mock exams, and progress tracking. It supports premium question banks for California, Texas, New York, Florida, and Illinois, plus a generic fallback bank so every state can be used. The app also includes a local AI tutor that explains mistakes, reinforces correct answers, and helps students focus on weak topics.

## Screens

- State Selector
- Dashboard
- Practice Mode
- Exam Mode
- Progress Tracker

## AI Features

- Ollama powers the AI Tutor locally, so students can ask questions without using a paid cloud API.
- Streaming explanations appear after practice answers to give quick, conversational feedback.
- Weakness analysis uses topic mastery data to guide students toward the areas that need the most review.

## Tech Stack

- Next.js 16, TypeScript, Tailwind CSS
- Ollama local LLM for AI features
- localStorage for progress persistence
- No external database or paid APIs

## Running locally

1. Clone repo
2. npm install
3. Install Ollama: https://ollama.ai
4. ollama pull llama3.2
5. ollama serve
6. npm run dev
7. Open http://localhost:3000

## Architecture decisions

DriveReady stores progress in localStorage because permit-test prep is personal, lightweight, and does not require accounts or a server database for the core experience. Ollama keeps the AI tutor private and free to run locally, which fits the student-focused use case better than a paid hosted model. The question bank lives in TypeScript files so the app can be deployed as a simple static-friendly Next app while still keeping strong types for questions, topics, exams, and progress. State-specific banks are separated from the generic fallback so premium coverage can grow without breaking support for all 50 states.

## What I'd add with more time

I would expand every state into a fully state-specific question bank with verified law references and more sign images. I would add cloud sync as an optional feature so students can continue progress across devices. I would also add an instructor or parent view for reviewing weak topics and exam history.
