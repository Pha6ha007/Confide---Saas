# Confide — AI Psychological Support Platform

## What This Is

A Next.js 14 psychological support platform with AI companion (Alex), voice interaction, RAG knowledge base (1,634 chunks across 7 Pinecone namespaces from psychology books), crisis detection, mood tracking, journaling, and breathing exercises. Built with TypeScript, Supabase, Prisma, OpenAI GPT-4o, ElevenLabs TTS, Pinecone vector DB.

The platform is at Phase 4 — core chat, all 6 specialist agents, voice (STT + TTS), memory system, crisis protocol, analytics, PWA, and diary PDF generation are all working.

## Core Value

A warm AI companion that remembers everything, adapts to each user's communication style, and draws on real psychological methodology (RAG) to provide meaningful support conversations.

## Current State

- Auth, onboarding, dashboard, chat fully working
- 7 specialist agents with orchestrator routing
- RAG pipeline: PDF → chunks → embeddings → Pinecone (1,634 chunks)
- Voice: hold-to-record → Whisper STT → ElevenLabs TTS
- Memory Agent: session summaries, user profile evolution
- Crisis detection: parallel hardcoded protocol
- Analytics: mood tracking, journal, progress, word cloud, breathing exercises
- Diary: monthly PDF generation via Vercel Cron
- PWA: installable, service worker, offline cache

## Architecture / Key Patterns

- Next.js 14 App Router with TypeScript throughout
- Supabase for auth, PostgreSQL (via Prisma), storage
- Pinecone namespaces per agent specialty (anxiety_cbt, family, trauma, mens, womens, general, crisis)
- RAG retrieval: query expansion → embedding → Pinecone search → cross-encoder reranking → top-5 chunks
- Voice: MediaRecorder API → /api/voice (Whisper) → /api/tts (ElevenLabs)
- Agent prompts in /agents/prompts/ — never modified without explicit request
- Crisis protocol hardcoded in /agents/crisis/protocol.ts
- Tailwind + shadcn/ui + Framer Motion for UI

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001-f68xru: Platform Improvements — Dataset ingestion, voice silence detection, response mode selector
