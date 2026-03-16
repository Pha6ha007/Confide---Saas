# M001-f68xru: Platform Improvements — Dataset, Voice Silence, Response Mode

**Vision:** Add counsel-chat dataset to RAG, silence auto-stop to VoiceRecorder, and response mode selector to ChatWindow — three targeted improvements that enhance RAG quality, voice UX, and user control.

## Success Criteria

- Running `npx tsx scripts/ingest-counseling-datasets.ts` successfully downloads counsel-chat CSV from HuggingFace, creates embeddings, upserts to Pinecone `counseling_qa` namespace, and saves metadata to Prisma
- VoiceRecorder auto-stops recording after 1.5 seconds of continuous silence without breaking hold-to-record behavior
- ResponseModeSelector component shows three options (Text only / Voice only / Both), persists to localStorage, and controls ChatWindow's voice response behavior

## Key Risks / Unknowns

- counsel-chat CSV parsing — dataset may have inconsistent fields, encoding issues, or low-quality entries
- Web Audio API silence threshold — needs tuning to avoid false positives (premature stops) in noisy environments

## Proof Strategy

- CSV parsing risk → retire in S01 by proving script downloads, parses, and upserts real data to Pinecone
- Silence threshold risk → retire in S02 by proving AnalyserNode detects silence correctly with a 1.5s threshold

## Verification Classes

- Contract verification: file existence, TypeScript compilation, Pinecone namespace query returning vectors
- Integration verification: response mode wired to ChatWindow enableVoiceResponse, namespace in constants
- Operational verification: none
- UAT / human verification: voice silence detection feels right (not too aggressive, not too slow)

## Milestone Definition of Done

This milestone is complete only when all are true:

- `counseling_qa` namespace exists in Pinecone with vectors from counsel-chat dataset
- KnowledgeBase table has metadata entries for all ingested chunks
- `counseling_qa` is registered in lib/pinecone/constants.ts NAMESPACES
- VoiceRecorder detects silence via Web Audio API and auto-stops after 1.5s
- Hold-to-record still works as before
- ResponseModeSelector renders 3 options and persists choice to localStorage
- ChatWindow uses the stored response mode to control enableVoiceResponse
- TypeScript compiles cleanly with no new errors

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008
- Partially covers: none
- Leaves for later: R030 (agent routing to counseling_qa)
- Orphan risks: none

## Slices

- [ ] **S01: Counsel-Chat Dataset Ingestion** `risk:medium` `depends:[]`
  > After this: running `npx tsx scripts/ingest-counseling-datasets.ts` downloads counsel-chat CSV, creates Q&A pair chunks with embeddings, upserts to Pinecone `counseling_qa` namespace, and saves metadata to Prisma KnowledgeBase table.

- [ ] **S02: Voice Silence Auto-Stop** `risk:medium` `depends:[]`
  > After this: VoiceRecorder starts recording on press, monitors audio via Web Audio API AnalyserNode, and auto-stops after 1.5s of silence — transcription fires automatically. Hold-to-release still works.

- [ ] **S03: Response Mode Selector** `risk:low` `depends:[]`
  > After this: a 3-button selector (Text only / Voice only / Both) appears in the voice controls area of ChatWindow. Selected mode persists to localStorage and controls whether AI responses include audio.

## Boundary Map

### S01 (standalone)

Produces:
- `scripts/ingest-counseling-datasets.ts` — CLI script for counsel-chat ingestion
- `lib/pinecone/constants.ts` — updated NAMESPACES with `COUNSELING_QA: 'counseling_qa'`
- Pinecone `counseling_qa` namespace populated with vectors
- KnowledgeBase rows in Prisma for each ingested chunk

Consumes:
- nothing (standalone — uses existing Pinecone client, OpenAI client, Prisma)

### S02 (standalone)

Produces:
- `components/voice/VoiceRecorder.tsx` — updated with silence detection via Web Audio API AnalyserNode, auto-stop after 1.5s silence

Consumes:
- nothing (modifies existing component in place)

### S03 (standalone)

Produces:
- `components/voice/ResponseModeSelector.tsx` — new component with 3 response mode buttons
- `components/chat/ChatWindow.tsx` — updated to use ResponseModeSelector and wire mode to enableVoiceResponse

Consumes:
- nothing (all three slices are independent)
