---
status: complete
started: 2026-03-16
completed: 2026-03-16
slices_completed: 4
slices_total: 4
---

# M002-k9p2vt Summary — Safety & Intelligence Upgrades

## What was delivered

### S01: PsyGUARD 4-Level Risk Taxonomy
Replaced binary crisis detection with graduated 4-level system (none/ideation/planning/imminent). Each level has tailored hardcoded responses — gentle for ideation ("I hear you"), urgent for planning (crisis numbers prominent), emergency for imminent danger (911/103 first). Pattern banks cover suicide, self-harm, violence in EN + RU. Chat route returns `crisisLevel` field.

### S02: ElevenLabs Streaming TTS
Installed `@elevenlabs/elevenlabs-js` SDK. New `textToSpeechStream()` uses SDK's `.stream()` method returning ReadableStream for chunked transfer. `/api/tts` route accepts `stream: true` param — streams chunks with `Transfer-Encoding: chunked` for ~0.5s first-byte latency vs 2-4s buffered. AudioPlayer component updated with streaming fetch, replay button after first play.

### S03: Smart Memory Deduplication
Created `lib/memory/dedup-engine.ts` — mem0-style dedup without the mem0 package. Flow: embed fact → search `user_memories` namespace (filtered by userId) → if cosine > 0.85, LLM (gpt-4o-mini) classifies UPDATE or NOOP → upsert or skip. Memory route flattens extraction JSON into discrete facts (people, triggers, themes, etc.), runs dedup non-blocking. Chat route searches user memories and injects into system prompt.

### S04: Procedural Memory Extraction
Created `lib/memory/procedural-memory.ts` — langmem-style communication learning. After each session, extracts effectivePatterns/avoidPatterns/responseStyleNote via gpt-4o-mini. Merged into `userProfile.communicationStyle.proceduralMemory` with pattern dedup (substring overlap). Chat route loads and injects as "Communication lessons" section in system prompt.

## Key decisions
- D006: No mem0 npm package (requires better-sqlite3 native addon + qdrant dep) — implemented dedup natively
- D007: No Prisma migrations — procedural memory fits in existing communicationStyle JSON field
- D008: @elevenlabs/elevenlabs-js for proper streaming SDK
- D009: Procedural data nested at communicationStyle.proceduralMemory

## Files changed
- `agents/crisis/risk-taxonomy.ts` — NEW: 4-level risk assessment
- `agents/crisis/protocol.ts` — REWRITTEN: graduated responses, assessCrisisRisk()
- `lib/elevenlabs/client.ts` — EXTENDED: textToSpeechStream() via SDK
- `lib/memory/dedup-engine.ts` — NEW: processMemoriesWithDedup(), searchUserMemories()
- `lib/memory/procedural-memory.ts` — NEW: extractProceduralLessons(), mergeProceduralMemory()
- `lib/pinecone/constants.ts` — EXTENDED: USER_MEMORIES namespace
- `lib/pinecone/retrieval.ts` — EXTENDED: user_memories namespace context
- `app/api/tts/route.ts` — EXTENDED: stream param, chunked transfer
- `app/api/chat/route.ts` — EXTENDED: graduated crisis, memory search, procedural context
- `app/api/memory/route.ts` — EXTENDED: dedup step, procedural step
- `components/voice/AudioPlayer.tsx` — REWRITTEN: streaming + replay
- `types/index.ts` — EXTENDED: RiskLevel type
