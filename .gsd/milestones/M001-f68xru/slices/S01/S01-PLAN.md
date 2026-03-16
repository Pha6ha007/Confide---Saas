# S01: Counsel-Chat Dataset Ingestion

**Goal:** Download the HuggingFace nbertagnolli/counsel-chat dataset and ingest it into Pinecone as a new `counseling_qa` namespace.
**Demo:** Running `npx tsx scripts/ingest-counseling-datasets.ts` downloads the CSV, creates embeddings for Q&A pairs, upserts vectors to Pinecone, and saves metadata to Prisma.

## Must-Haves
- `counseling_qa` namespace added to NAMESPACES in lib/pinecone/constants.ts
- Script downloads CSV from HuggingFace without manual file placement
- Q&A pairs are chunked as atomic units (question + answer together)
- Entries with 0 upvotes are filtered out
- Embeddings created with text-embedding-3-small (same as existing)
- Vectors upserted to Pinecone `counseling_qa` namespace
- KnowledgeBase metadata saved to Prisma for each chunk
- Duplicate checking works (re-running doesn't create duplicates)

## Tasks

- [ ] **T01: Ingestion script and namespace registration**
  Create scripts/ingest-counseling-datasets.ts, register counseling_qa namespace, implement full pipeline.

## Files Likely Touched
- lib/pinecone/constants.ts
- scripts/ingest-counseling-datasets.ts (new)
