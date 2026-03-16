# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R001 — Counsel-chat dataset ingested into Pinecone
- Class: core-capability
- Status: active
- Description: The HuggingFace nbertagnolli/counsel-chat dataset (2,775 therapist Q&A pairs) must be downloaded, chunked, embedded, and upserted into a new `counseling_qa` Pinecone namespace with full Prisma metadata tracking.
- Why it matters: Real counseling Q&A data enriches RAG responses beyond book-only knowledge — gives agents access to practical therapeutic dialogue patterns.
- Source: user
- Primary owning slice: M001-f68xru/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Dataset is CSV format (not PDF like existing books). Chunking strategy must handle Q&A pairs as atomic units rather than prose paragraphs.

### R002 — New `counseling_qa` namespace registered in Pinecone constants
- Class: integration
- Status: active
- Description: The `counseling_qa` namespace must be added to NAMESPACES in lib/pinecone/constants.ts and the Namespace type updated.
- Why it matters: Without registration, the retrieval pipeline can't query the new namespace.
- Source: inferred
- Primary owning slice: M001-f68xru/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Also needs entry in namespace-mapping.ts if agents should use it.

### R003 — Ingestion script follows existing pattern
- Class: convention
- Status: active
- Description: scripts/ingest-counseling-datasets.ts must follow the same architectural pattern as scripts/ingest-knowledge.ts — CLI args, dotenv loading, OpenAI embeddings, Pinecone upsert, Prisma metadata, duplicate checking, junk filtering.
- Why it matters: Consistency with existing codebase patterns for maintainability.
- Source: user
- Primary owning slice: M001-f68xru/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Key difference: CSV input instead of PDF, Q&A pair chunking instead of prose chunking.

### R004 — Voice recorder auto-stops on 1.5s silence
- Class: primary-user-loop
- Status: active
- Description: VoiceRecorder component must detect silence using Web Audio API AnalyserNode and automatically stop recording after 1.5 seconds of continuous silence.
- Why it matters: Current hold-to-record UX requires manual release. Silence auto-stop enables hands-free recording — critical for voice-first interaction.
- Source: user
- Primary owning slice: M001-f68xru/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Threshold 1.5s. Must coexist with hold-to-record — auto-stop is additive, not replacing manual stop.

### R005 — Silence detection uses Web Audio API AnalyserNode
- Class: constraint
- Status: active
- Description: Silence detection must use the Web Audio API AnalyserNode to monitor audio levels in real-time, not a timer-based heuristic.
- Why it matters: AnalyserNode provides actual audio level data — accurate silence detection regardless of background noise profile.
- Source: user
- Primary owning slice: M001-f68xru/S02
- Supporting slices: none
- Validation: unmapped
- Notes: AnalyserNode.getByteFrequencyData() → compute RMS → compare against silence threshold.

### R006 — Response mode selector with 3 options
- Class: primary-user-loop
- Status: active
- Description: A ResponseModeSelector component with three buttons — [Text only] [Voice only] [Both] — must appear in the chat interface to let users choose how they receive AI responses.
- Why it matters: Users need control over response format — some prefer reading, some prefer listening, some want both.
- Source: user
- Primary owning slice: M001-f68xru/S03
- Supporting slices: none
- Validation: unmapped
- Notes: File: components/voice/ResponseModeSelector.tsx

### R007 — Preference persisted to localStorage
- Class: continuity
- Status: active
- Description: The selected response mode must be saved to localStorage under key `confide_response_mode` and restored on page load.
- Why it matters: Users shouldn't have to re-select their preference every session.
- Source: user
- Primary owning slice: M001-f68xru/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Values: 'text' | 'voice' | 'both'. Default: 'text'.

### R008 — Response mode selector integrated into ChatWindow
- Class: integration
- Status: active
- Description: The ResponseModeSelector must be wired into ChatWindow so that the selected mode controls whether `enableVoiceResponse` is sent to /api/chat and whether audio auto-plays.
- Why it matters: The selector is useless without wiring into the actual response flow.
- Source: inferred
- Primary owning slice: M001-f68xru/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Must replace or integrate with existing `agentVoiceEnabled` state in ChatWindow.

## Validated

(none yet)

## Deferred

(none)

## Out of Scope

### R030 — Automatic agent routing to counseling_qa namespace
- Class: core-capability
- Status: out-of-scope
- Description: Automatically routing specific agent types to query the counseling_qa namespace in addition to their primary namespace.
- Why it matters: Prevents scope creep — ingestion is the goal, not retrieval pipeline changes.
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Can be added later by updating AGENT_NAMESPACE_MAP or adding multi-namespace retrieval.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | active | M001-f68xru/S01 | none | unmapped |
| R002 | integration | active | M001-f68xru/S01 | none | unmapped |
| R003 | convention | active | M001-f68xru/S01 | none | unmapped |
| R004 | primary-user-loop | active | M001-f68xru/S02 | none | unmapped |
| R005 | constraint | active | M001-f68xru/S02 | none | unmapped |
| R006 | primary-user-loop | active | M001-f68xru/S03 | none | unmapped |
| R007 | continuity | active | M001-f68xru/S03 | none | unmapped |
| R008 | integration | active | M001-f68xru/S03 | none | unmapped |
| R030 | core-capability | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 8
- Mapped to slices: 8
- Validated: 0
- Unmapped active requirements: 0
