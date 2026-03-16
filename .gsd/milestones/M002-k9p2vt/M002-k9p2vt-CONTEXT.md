# M002-k9p2vt — Safety & Intelligence Upgrades

## Goal
Implement 4 integrations from INTEGRATIONS.md: PsyGUARD graduated crisis detection, ElevenLabs streaming TTS, smart memory deduplication (mem0-style), and procedural memory extraction (langmem-style).

## Scope
- **PsyGUARD**: Replace binary crisis detection with 4-level risk taxonomy (none/ideation/planning/imminent). Graduated hardcoded responses. Update chat route to use new protocol.
- **ElevenLabs Streaming**: Replace buffered TTS with chunked streaming. Client-side playback starts immediately. Both `/api/tts` and chat route inline TTS affected.
- **Smart Memory Dedup**: Before adding new memories, check for semantic duplicates. LLM decides ADD/UPDATE/NOOP. No new dependencies — uses existing OpenAI + Pinecone.
- **Procedural Memory**: After each session, extract what worked/didn't in response style. Merge into user profile. Uses existing `@langchain/openai`.

## Out of Scope
- mem0 npm package (too many dependencies, native addons)
- MentalChat16K dataset (research-only license)
- n8n-MCP/skills (YouTube pipeline, not Confide)
- CrisisLog Prisma model (no DB migration in this milestone)

## Constraints
- Crisis protocol remains HARDCODED — no LLM in crisis path
- No new Prisma migrations — all data fits existing JSON fields
- No new npm dependencies except `@elevenlabs/elevenlabs-js` for streaming SDK
- Existing tests must not break
