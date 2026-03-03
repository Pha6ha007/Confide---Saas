# RAG Knowledge Base - Books Management

## 📚 Loaded Books (Current)

### ANXIETY_CBT (663 chunks)
- ✅ The Happiness Trap - Russ Harris (287 chunks)
- ✅ CBT Anxiety Solution Workbook - Matthew McKay (160 chunks)
- ✅ When Panic Attacks - David Burns (108 chunks)
- ✅ The Anxiety and Phobia Workbook - Edmund Bourne (106 chunks)
- ✅ Feeling Good - David Burns (2 chunks) - *scanned PDF, minimal text*

### GENERAL (963 chunks)
- ✅ On Becoming a Person - Carl Rogers (527 chunks)
- ✅ Man's Search for Meaning - Viktor Frankl (320 chunks) - *loaded twice*
- ✅ The Gift of Therapy - Irvin Yalom (116 chunks)

### TRAUMA (80 chunks)
- ✅ Trauma and Recovery - Judith Herman (61 chunks)
- ✅ The Body Keeps the Score - Bessel van der Kolk (19 chunks)

### FAMILY (57 chunks)
- ✅ The Seven Principles for Making Marriage Work - John Gottman (57 chunks)

### MENS (116 chunks)
- ✅ I Don't Want to Talk About It - Terrence Real (58 chunks) - *loaded twice*

**Total: 12 unique books, ~1,879 chunks**

---

## 📖 Available Books (Not Yet Loaded)

### For ANXIETY_CBT namespace:
- `anxiety-and-phobia-workbook.pdf` - already loaded
- `DBT_Skills_Handouts_and_Worksheets.pdf`
- `Dialectical Behavior Therapy Skills Workbook — McKay.pdf`

### For TRAUMA namespace:
- `Adult Children of Emotionally Immature Parents — Lindsay Gibson.pdf`
- `Scattered Minds — Gabor Maté.pdf`
- `The Polyvagal Theory PDF.pdf`

### For RELATIONSHIPS namespace:
- `Attached — Amir Levine.pdf`
- `Hold Me Tight_ Seven Conversations for a Lifetime of Love.pdf`
- `HoldMeTight_Except_Conversation3.pdf`

### For GENERAL namespace:
- `Daring Greatly — Brené Brown.pdf`
- `Lost Connections — Johann Hari.pdf`
- `Maybe You Should Talk to Someone — Lori Gottlieb.pdf`
- `Permission to Feel — Marc Brackett.pdf`
- `Self-Compassion — Kristin Neff.pdf`
- `THE SIX PILLARS OF SELF ESTEEM.pdf`

### For MENS/WOMENS namespace:
- `Why Zebras Don't Get Ulcers — Robert Sapolsky.pdf` (stress - could be general)

---

## 🚀 How to Ingest Books

### Basic Usage

```bash
./scripts/ingest.sh \
  --file="books/filename.pdf" \
  --namespace="anxiety_cbt" \
  --title="Book Title" \
  --author="Author Name"
```

### Available Namespaces

- `anxiety_cbt` - CBT, ACT, DBT techniques
- `family` - Family therapy, couples counseling
- `trauma` - PTSD, childhood trauma, attachment
- `crisis` - Crisis intervention protocols
- `general` - General psychology, humanistic approaches
- `mens` - Men's mental health
- `womens` - Women's mental health

### Features

✅ **Duplicate Detection** - Warns if book already loaded
✅ **Safe File Names** - Handles spaces, apostrophes, special characters
✅ **Progress Tracking** - Shows pages, characters, chunks
✅ **Batch Processing** - Handles large books (1000+ pages)

### Example Commands

```bash
# Load DBT workbook
./scripts/ingest.sh \
  --file="books/Dialectical Behavior Therapy Skills Workbook — McKay.pdf" \
  --namespace="anxiety_cbt" \
  --title="Dialectical Behavior Therapy Skills Workbook" \
  --author="Matthew McKay"

# Load attachment theory book
./scripts/ingest.sh \
  --file="books/Attached — Amir Levine.pdf" \
  --namespace="general" \
  --title="Attached" \
  --author="Amir Levine"

# Load Brené Brown
./scripts/ingest.sh \
  --file="books/Daring Greatly — Brené Brown.pdf" \
  --namespace="general" \
  --title="Daring Greatly" \
  --author="Brené Brown"
```

---

## 🔧 Maintenance Scripts

### Check Current Status
```bash
npx tsx scripts/check-pinecone.ts
```

### Rename Problematic Files
```bash
./scripts/rename-books.sh
```

---

## ⚠️ Important Notes

1. **Scanned PDFs** - Some PDFs are image-based and extract minimal text
2. **Duplicates** - Script warns but allows re-loading (creates duplicate vectors)
3. **File Names** - Use simple names without spaces/apostrophes for best results
4. **Large Books** - 1000+ page books may take 5-10 minutes to process

---

## 📊 Storage Estimates

- **Average book:** 100-300 chunks
- **Large book:** 500-1000 chunks
- **Pinecone Free Tier:** 100,000 vectors
- **Current usage:** ~1,879 vectors (1.9%)
- **Capacity:** ~50-100 more books before upgrade needed

---

*Last updated: 2026-03-03*
