# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001-f68xru | data | Counsel-chat chunking strategy | Q&A pairs as atomic units (question + answer concatenated per chunk) | Book ingestion uses prose paragraph chunking, but Q&A pairs lose meaning if split — each pair is a self-contained counseling exchange | No |
| D002 | M001-f68xru | data | Filter counsel-chat by upvotes | Include entries with upvotes >= 1 | Low-upvote answers may be low quality; filtering ensures RAG returns better therapeutic content | Yes — if dataset proves too small after filtering |
| D003 | M001-f68xru | arch | Silence detection approach | Web Audio API AnalyserNode with RMS threshold | Direct audio level monitoring is more accurate than timer heuristics; AnalyserNode is widely supported | No |
| D004 | M001-f68xru | convention | Response mode localStorage key | `confide_response_mode` with values 'text' / 'voice' / 'both' | Matches existing localStorage convention (confide_onboarding_complete, confide_active_session) | No |
| D005 | M001-f68xru | arch | Response mode default | 'text' for all plans | Voice requires Pro/Premium — defaulting to text ensures free users get expected behavior | No |
