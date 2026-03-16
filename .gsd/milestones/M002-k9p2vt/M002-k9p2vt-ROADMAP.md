# M002-k9p2vt — Roadmap

## Slices

- [x] **S01: PsyGUARD Risk Taxonomy** `risk:medium` `depends:[]`
  4-level crisis detection replacing binary trigger. Graduated hardcoded responses by severity. Chat route integration.

- [x] **S02: ElevenLabs Streaming TTS** `risk:medium` `depends:[]`
  Chunked streaming TTS via @elevenlabs/elevenlabs-js SDK. Client-side immediate playback. Updated /api/tts route.

- [x] **S03: Smart Memory Deduplication** `risk:high` `depends:[]`
  mem0-style dedup using existing OpenAI + Pinecone. LLM classifies ADD/UPDATE/NOOP before storing. Memory route integration.

- [x] **S04: Procedural Memory Extraction** `risk:low` `depends:[S03]`
  After each session, extract effective/ineffective patterns. Merge into userProfile.communicationStyle. Memory route integration.
