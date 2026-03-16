---
id: M001-f68xru
title: Platform Improvements — Dataset, Voice Silence, Response Mode
status: complete
slices_completed: 3
slices_total: 3
completed_at: 2026-03-16T10:30:00Z
---

# M001-f68xru: Platform Improvements

**Three targeted improvements: counsel-chat dataset ingestion, voice silence auto-stop, response mode selector**

## S01: Counsel-Chat Dataset Ingestion
Created `scripts/ingest-counseling-datasets.ts` that downloads the nbertagnolli/counsel-chat dataset from HuggingFace, parses CSV with robust quoted-field handling, filters by upvotes, creates atomic Q&A pair chunks, generates embeddings via text-embedding-3-small, upserts to Pinecone `counseling_qa` namespace, and saves Prisma metadata. Registered namespace in constants and retrieval query expansion.

## S02: Voice Silence Auto-Stop
Added Web Audio API AudioContext + AnalyserNode to VoiceRecorder. Monitors audio levels every 100ms via RMS computation from frequency data. Auto-stops recording when silence (RMS < 15) persists for 1.5 seconds. Hold-to-release manual stop preserved. Proper AudioContext cleanup on stop and unmount.

## S03: Response Mode Selector
Created ResponseModeSelector component with 3 mode buttons (Text only / Voice only / Both) and Framer Motion animated indicator. Persists preference to localStorage under `confide_response_mode`. Wired into ChatWindow — replaced binary Switch toggle with mode-based logic controlling `enableVoiceResponse` and audio auto-play.

## Key Files
- `scripts/ingest-counseling-datasets.ts`
- `lib/pinecone/constants.ts`
- `lib/pinecone/retrieval.ts`
- `components/voice/VoiceRecorder.tsx`
- `components/voice/ResponseModeSelector.tsx`
- `components/chat/ChatWindow.tsx`
