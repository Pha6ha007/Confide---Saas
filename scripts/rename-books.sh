#!/bin/bash
# Rename problematic book filenames to safe versions

cd books

# Function to safely rename
rename_file() {
  local old="$1"
  local new="$2"
  if [ -f "$old" ]; then
    mv "$old" "$new" && echo "✅ $old → $new"
  fi
}

# Already renamed
# rename_file "Man's Search For Meaning - Viktor Frankl.pdf" "mans-search-for-meaning.pdf"
# rename_file "Man's Search For Meaning PDF.pdf" "mans-search-for-meaning-2.pdf"
# rename_file "I Don't Want to Talk About It PDF.pdf" "i-dont-want-to-talk-about-it.pdf"

# Other files with spaces and special characters
rename_file "440135209-David-Burns-Feeling-Good-pdf.pdf" "feeling-good-david-burns.pdf"
rename_file "909000774-The-Anxiety-and-Phobia-Workbook-PDF.pdf" "anxiety-and-phobia-workbook.pdf"
rename_file "Body20keeps20the20score.20Kolk20.pdf" "body-keeps-the-score-1.pdf"
rename_file "C-Rogers_Becoming-a-Person.pdf" "on-becoming-a-person-1.pdf"
rename_file "Matthew McKay, Michelle Skeen, Patrick Fanning - The CBT Anxiety Solution Workbook_ A Breakthrough Treatment for Overcoming Fear, Worry, and Panic-New Harbinger Publications (2017).pdf" "cbt-anxiety-solution-workbook.pdf"
rename_file "On-becoming-a-person-by-Rogers-Carl-R.-z-lib.org_.pdf" "on-becoming-a-person-2.pdf"
rename_file "The Body Keeps the Score PDF.pdf" "body-keeps-the-score-2.pdf"
rename_file "The Gift of Therapy PDF.pdf" "gift-of-therapy.pdf"
rename_file "The Seven Principles for Making Marriage Work PDF.pdf" "seven-principles-marriage.pdf"
rename_file "The-Happiness-Trap-Harris-R1.pdf" "happiness-trap.pdf"
rename_file "The-Seven-Principles-for-Making-Marriage-Work-A-Practical-Guide-from-the-Countrys-Foremost-Relationship-Expert-by-John-Gottman-Ph.D.-Nan-Silver-z-lib.org_.epub_.pdf" "seven-principles-marriage-2.pdf"
rename_file "Trauma And Recovery PDF.pdf" "trauma-and-recovery.pdf"
rename_file "When Panic Attacks PDF.pdf" "when-panic-attacks.pdf"
rename_file "yalom_the-gift-of-therapy.pdf" "gift-of-therapy-2.pdf"

echo ""
echo "✅ All files renamed successfully!"
