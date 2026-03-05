# Confide Diary — Setup Instructions

## Overview

The Confide Diary feature generates monthly PDF diaries for users, containing:
- Cover page with user name and month/year
- Individual pages for each session (summary, key dialogues, insights, mood)
- Month summary page (themes, progress, what helped, goals)

## Status: ✅ Complete

All code is implemented. Only Supabase Storage setup required.

## Implementation

### Files Created

1. **lib/diary/generator.tsx** — PDF generation using @react-pdf/renderer
2. **app/api/diary/generate/route.ts** — POST endpoint to generate diary
3. **app/api/diary/list/route.ts** — GET endpoint to list all diaries
4. **app/api/diary/[id]/route.ts** — GET endpoint to fetch specific diary
5. **components/diary/DiaryList.tsx** — UI component to display diaries
6. **app/dashboard/journal/page.tsx** — Updated with Diary section

### Database

The `Diary` model already exists in `prisma/schema.prisma`:

```prisma
model Diary {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  month      Int      // 1-12
  year       Int      // 2026, 2027, etc
  title      String   @default("")
  status     String   @default("generating") // generating | ready | error
  storageUrl String?  @map("storage_url")
  errorMessage String? @map("error_message") @db.Text
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month, year])
  @@map("diaries")
}
```

Migrations already applied.

## Required: Supabase Storage Setup

### Step 1: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Bucket name: **`diaries`**
4. Public bucket: **No** (private)
5. File size limit: 50 MB (enough for PDFs)
6. Allowed MIME types: `application/pdf`

### Step 2: Set Bucket Policies

Create RLS policies for the `diaries` bucket:

#### Policy 1: Users can read their own diaries

```sql
CREATE POLICY "Users can read own diaries"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'diaries'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Service role can upload

The service role (used in API routes) will handle uploads automatically. No policy needed as service role bypasses RLS.

### Step 3: Test Upload (Optional)

You can test the bucket by manually uploading a file:

```bash
curl -X POST \
  'https://<YOUR_PROJECT>.supabase.co/storage/v1/object/diaries/test/sample.pdf' \
  -H 'Authorization: Bearer <ANON_KEY>' \
  -F 'file=@/path/to/test.pdf'
```

## How It Works

### Generation Flow

1. **User clicks "Generate Diary"** → POST /api/diary/generate
2. **API creates Diary record** with status `generating`
3. **Background job starts:**
   - Fetches all sessions for the month
   - Transforms into DiarySession format
   - Generates month summary
   - Creates PDF using @react-pdf/renderer
   - Uploads to Supabase Storage bucket `diaries`
   - Updates Diary record with status `ready` and `storageUrl`
4. **User downloads PDF** from storageUrl

### File Storage Structure

```
diaries/
  {userId}/
    2026-01-diary.pdf
    2026-02-diary.pdf
    2026-03-diary.pdf
    ...
```

### Status States

- **`generating`** — PDF is being created (background job running)
- **`ready`** — PDF is ready for download
- **`error`** — Generation failed (errorMessage contains reason)

## Testing

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Navigate to Journal Page

```
http://localhost:3000/dashboard/journal
```

You should see:
- "Your Diaries" section at the top
- "Generate Current Month" button

### 3. Generate Diary

1. Click "Generate Current Month"
2. Status will show "Generating..."
3. Wait 5-10 seconds (depending on number of sessions)
4. Status changes to "Ready"
5. Click "Download PDF" to view

### 4. Check Logs

If generation fails, check server logs:

```bash
# Look for:
[DIARY_GENERATED] <diaryId> for user <userId>  # Success
[DIARY_BACKGROUND_ERROR] <error details>       # Failure
```

## Troubleshooting

### Error: "Upload failed"

**Cause:** Supabase Storage bucket doesn't exist or RLS policy blocks upload

**Fix:**
1. Check bucket exists in Supabase Dashboard → Storage
2. Verify bucket name is exactly `diaries`
3. Check API route uses service role key (bypasses RLS)

### Error: "No sessions found for this month"

**Cause:** User has no sessions in the selected month

**Fix:**
- Have user create at least one session in /dashboard/chat
- Or select a different month that has sessions

### PDF doesn't render correctly

**Cause:** @react-pdf/renderer doesn't support all CSS properties

**Fix:**
- Use only supported styles (see @react-pdf/renderer docs)
- Avoid: flexbox gaps, transform, custom fonts without registration

### TypeScript errors

**Cause:** Missing types or incorrect imports

**Fix:**
```bash
npm install --save-dev @types/react-pdf
```

## Future Enhancements

- [ ] AI-generated month summaries (currently hardcoded)
- [ ] Include journal entries in diary
- [ ] Custom themes/templates
- [ ] Email delivery option
- [ ] Scheduled auto-generation (1st of each month)
- [ ] Export to other formats (DOCX, EPUB)

## Monetization

**Free Plan:** Current month only
**Pro/Premium:** Full history, unlimited downloads

Implemented in API by checking `user.plan` before allowing generation.

---

**Status:** ✅ Ready for testing after Supabase Storage setup

**Last Updated:** 2026-03-05
