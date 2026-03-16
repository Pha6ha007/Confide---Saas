# M001-f68xru: Platform Improvements — Dataset, Voice Silence, Response Mode

**Gathered:** 2026-03-16
**Status:** Ready for planning

## Project Description

Confide is a mature Next.js 14 AI psychological support platform at Phase 4. This milestone adds three targeted improvements: counseling dataset ingestion for richer RAG, silence auto-stop for voice recording, and a response mode selector for user control over response format.

## Why This Milestone

The RAG pipeline currently only has book content — adding real therapist Q&A data will significantly improve response quality for practical questions. The voice UX requires manual stop (hold-to-release) which is clunky for hands-free use. Users currently have a binary voice toggle but no control over whether they get text, voice, or both responses.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Run a script that downloads counsel-chat from HuggingFace and populates a new Pinecone namespace
- Record voice messages that auto-stop when they stop talking (1.5s silence threshold)
- Choose between Text only, Voice only, or Both response modes with persistent preference

### Entry point / environment

- Entry point: CLI script for dataset ingestion, browser for voice and response mode
- Environment: local dev (script), browser (voice + response mode)
- Live dependencies involved: Pinecone (upsert), OpenAI (embeddings), Web Audio API (silence detection), localStorage (preference)

## Completion Class

- Contract complete means: script runs successfully, VoiceRecorder has silence detection, ResponseModeSelector exists and persists preference
- Integration complete means: namespace registered in constants, response mode wired into ChatWindow's voice response flow
- Operational complete means: none — no service lifecycle concerns

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Running `npx tsx scripts/ingest-counseling-datasets.ts` downloads the dataset and upserts vectors to Pinecone `counseling_qa` namespace
- VoiceRecorder auto-stops after ~1.5s of silence during a recording session
- Selecting a response mode persists to localStorage and controls whether AI responses include audio

## Risks and Unknowns

- HuggingFace CSV format may have encoding issues or missing fields — need defensive parsing
- Web Audio API AnalyserNode silence threshold needs tuning — too sensitive = premature stops, too lax = doesn't trigger
- counsel-chat has variable answer quality (upvotes range widely) — may need filtering

## Existing Codebase / Prior Art

- `scripts/ingest-knowledge.ts` — existing PDF ingestion script, pattern to follow for S01
- `lib/pinecone/client.ts` — Pinecone client with lazy init
- `lib/pinecone/constants.ts` — NAMESPACES enum, Namespace type
- `lib/pinecone/namespace-mapping.ts` — agent→namespace mapping
- `lib/pinecone/retrieval.ts` — query expansion + embedding + reranking pipeline
- `components/voice/VoiceRecorder.tsx` — current hold-to-record component, target for S02
- `components/chat/ChatWindow.tsx` — main chat UI, `agentVoiceEnabled` state, `enableVoiceResponse` API flag
- `components/voice/AudioPlayer.tsx` — existing audio playback component
- `types/index.ts` — shared TypeScript types

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — counsel-chat dataset ingested into Pinecone
- R002 — counseling_qa namespace registered
- R003 — ingestion script follows existing pattern
- R004 — voice recorder auto-stops on 1.5s silence
- R005 — silence detection uses Web Audio API AnalyserNode
- R006 — response mode selector with 3 options
- R007 — preference persisted to localStorage
- R008 — response mode integrated into ChatWindow

## Scope

### In Scope

- Download and ingest counsel-chat HuggingFace dataset
- Add `counseling_qa` namespace to Pinecone constants
- Silence detection in VoiceRecorder via Web Audio API AnalyserNode
- ResponseModeSelector component with localStorage persistence
- Wire response mode into ChatWindow voice response flow

### Out of Scope / Non-Goals

- Automatic agent routing to counseling_qa namespace (R030)
- Changes to retrieval pipeline or reranking logic
- Changes to agent prompts
- Changes to ElevenLabs TTS configuration
- Other dataset sources beyond counsel-chat

## Technical Constraints

- Must use `text-embedding-3-small` model (same as existing embeddings for dimension compatibility)
- Pinecone index dimension is 1536 (text-embedding-3-small output)
- VoiceRecorder must maintain hold-to-record as fallback alongside auto-stop
- No new npm dependencies unless strictly necessary

## Integration Points

- Pinecone — new namespace `counseling_qa` with vectors
- OpenAI — embeddings for dataset chunks
- Prisma/Supabase — KnowledgeBase metadata records
- Web Audio API — AnalyserNode for silence detection
- localStorage — response mode preference persistence
- ChatWindow — response mode controls `enableVoiceResponse` API parameter

## Open Questions

- Whether to filter counsel-chat by upvotes (e.g., only answers with 2+ upvotes) — leaning yes for quality
- Whether silence auto-stop should be the new default or opt-in — leaning default since it's strictly better UX
