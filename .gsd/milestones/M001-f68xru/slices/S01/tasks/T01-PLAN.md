# T01: Counsel-Chat Ingestion Script and Namespace Registration

**Slice:** S01
**Milestone:** M001-f68xru

## Goal
Create the ingestion script for counsel-chat dataset and register the new namespace.

## Must-Haves

### Truths
- Running `npx tsx scripts/ingest-counseling-datasets.ts` downloads CSV from HuggingFace
- Q&A pairs with upvotes >= 1 are embedded and upserted to Pinecone `counseling_qa` namespace
- KnowledgeBase rows exist in Prisma for each ingested chunk
- Re-running the script warns about duplicates (same as existing pattern)

### Artifacts
- `scripts/ingest-counseling-datasets.ts` — Full ingestion script (min 150 lines, exports: main function)
- `lib/pinecone/constants.ts` — Updated with COUNSELING_QA namespace

### Key Links
- `scripts/ingest-counseling-datasets.ts` → `lib/pinecone/client.ts` via import of `getPineconeIndex, NAMESPACES, Namespace`
- `scripts/ingest-counseling-datasets.ts` → `openai` via import for embeddings
- `scripts/ingest-counseling-datasets.ts` → `@prisma/client` via import for metadata storage

## Steps
1. Add `COUNSELING_QA: 'counseling_qa'` to NAMESPACES in lib/pinecone/constants.ts
2. Create scripts/ingest-counseling-datasets.ts following ingest-knowledge.ts pattern
3. Implement CSV download from HuggingFace raw URL (datasets API serves CSV directly)
4. Parse CSV rows, filter by upvotes >= 1, group by questionID (multiple therapist answers per question)
5. Create chunks as "Question: {questionTitle}\n{questionText}\n\nTherapist Answer: {answerText}" — each Q+A pair is one chunk
6. Add topic metadata from the dataset (e.g., depression, anxiety, relationships)
7. Create embeddings with text-embedding-3-small in batches of 100
8. Upsert to Pinecone `counseling_qa` namespace with metadata (topic, questionID, upvotes)
9. Save KnowledgeBase entries to Prisma
10. Verify script compiles with `npx tsc --noEmit`

## Context
- Existing pattern: scripts/ingest-knowledge.ts uses PDF parsing → chunk → embed → upsert → Prisma
- Key difference: CSV input, Q&A pair chunking, HuggingFace download instead of local file
- counsel-chat format: questionID, questionTitle, questionText, topic, therapistInfo, answerText, upvotes
- HuggingFace raw CSV URL: https://huggingface.co/datasets/nbertagnolli/counsel-chat/resolve/main/20200325_counsel_chat.csv
