# S03 — Smart Memory Deduplication

## Tasks

- [ ] **T01: Memory dedup engine + memory route integration** `est:90min`
  - Create `lib/memory/dedup-engine.ts` with semantic dedup logic
  - Create Pinecone namespace `user_memories` for per-user memory vectors
  - Integrate into `app/api/memory/route.ts` after Memory Agent extraction
  - Type-check passes
