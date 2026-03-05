// Confide Diary — PDF Generator
// Generates warm, personal monthly diary PDFs using @react-pdf/renderer

import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// ============================================
// TYPES
// ============================================

export interface DiarySession {
  date: Date;
  summary: string;
  keyDialogues: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  insight?: string;
  moodScore?: number; // 1-10
}

export interface DiaryData {
  userName: string;
  companionName: string;
  month: number; // 1-12
  year: number;
  sessions: DiarySession[];
  monthSummary: {
    mainThemes: string[];
    progress: string;
    whatHelped: string[];
    nextMonthGoals: string[];
  };
}

// ============================================
// STYLES — Warm Diary Design
// ============================================

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FEFCE8', // Cream background
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },

  // Cover page
  cover: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  coverTitle: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  coverName: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#6366F1',
    marginBottom: 60,
  },

  // Session page
  sessionHeader: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2px solid #E5E7EB',
  },
  sessionDate: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sessionMood: {
    fontSize: 10,
    color: '#6B7280',
  },

  summary: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.7,
  },

  dialogues: {
    marginBottom: 20,
  },
  dialogueTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  dialogue: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderLeft: '3px solid #6366F1',
  },
  dialogueRole: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6366F1',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dialogueContent: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 1.6,
  },

  insight: {
    padding: 16,
    backgroundColor: '#FEF3C7', // Amber sticky note
    borderRadius: 6,
    marginBottom: 20,
  },
  insightTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 6,
  },
  insightText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },

  // Month summary page
  summarySection: {
    marginBottom: 24,
  },
  summaryHeading: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryList: {
    marginLeft: 12,
  },
  summaryListItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 1.6,
  },
  monthSummaryText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.7,
  },

  gratitude: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#EEF2FF', // Indigo tint
    borderRadius: 8,
    textAlign: 'center',
  },
  gratitudeText: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 1.7,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
  },
});

// ============================================
// PDF COMPONENTS
// ============================================

const CoverPage = ({ data }: { data: DiaryData }) => {
  const monthName = format(new Date(data.year, data.month - 1), 'MMMM yyyy');

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.cover}>
        <Text style={styles.logo}>Confide</Text>
        <Text style={styles.coverTitle}>{monthName}</Text>
        <Text style={styles.coverSubtitle}>Your Journey in {format(new Date(data.year, data.month - 1), 'MMMM')}</Text>
        <Text style={styles.coverName}>{data.userName}</Text>
      </View>
    </Page>
  );
};

const SessionPage = ({ session, companionName }: { session: DiarySession; companionName: string }) => {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{format(session.date, 'EEEE, MMMM d, yyyy')}</Text>
        {session.moodScore && (
          <Text style={styles.sessionMood}>Mood: {getMoodEmoji(session.moodScore)} ({session.moodScore}/10)</Text>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{session.summary}</Text>
      </View>

      {/* Key Dialogues */}
      {session.keyDialogues.length > 0 && (
        <View style={styles.dialogues}>
          <Text style={styles.dialogueTitle}>Key Moments</Text>
          {session.keyDialogues.slice(0, 3).map((dialogue, index) => (
            <View key={index} style={styles.dialogue}>
              <Text style={styles.dialogueRole}>
                {dialogue.role === 'user' ? 'You' : companionName}
              </Text>
              <Text style={styles.dialogueContent}>{dialogue.content}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Insight */}
      {session.insight && (
        <View style={styles.insight}>
          <Text style={styles.insightTitle}>💡 Insight</Text>
          <Text style={styles.insightText}>{session.insight}</Text>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>Confide — Your personal journey</Text>
    </Page>
  );
};

const SummaryPage = ({ data }: { data: DiaryData }) => {
  const monthName = format(new Date(data.year, data.month - 1), 'MMMM');

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.coverTitle}>Your {monthName} Journey</Text>

      {/* Main Themes */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryHeading}>Main Themes</Text>
        <View style={styles.summaryList}>
          {data.monthSummary.mainThemes.map((theme, index) => (
            <Text key={index} style={styles.summaryListItem}>• {theme}</Text>
          ))}
        </View>
      </View>

      {/* Progress */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryHeading}>Progress & Changes</Text>
        <Text style={styles.monthSummaryText}>{data.monthSummary.progress}</Text>
      </View>

      {/* What Helped */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryHeading}>What Helped</Text>
        <View style={styles.summaryList}>
          {data.monthSummary.whatHelped.map((item, index) => (
            <Text key={index} style={styles.summaryListItem}>✓ {item}</Text>
          ))}
        </View>
      </View>

      {/* Next Month Goals */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryHeading}>Goals for Next Month</Text>
        <View style={styles.summaryList}>
          {data.monthSummary.nextMonthGoals.map((goal, index) => (
            <Text key={index} style={styles.summaryListItem}>→ {goal}</Text>
          ))}
        </View>
      </View>

      {/* Gratitude */}
      <View style={styles.gratitude}>
        <Text style={styles.gratitudeText}>
          "{data.userName}, it's been an honor walking alongside you this month. I'm proud of the courage you've shown. Keep going — I'm here for you." — {data.companionName}
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Confide — Your personal journey</Text>
    </Page>
  );
};

// ============================================
// HELPERS
// ============================================

function getMoodEmoji(score: number): string {
  if (score >= 9) return '😊';
  if (score >= 7) return '🙂';
  if (score >= 5) return '😐';
  if (score >= 3) return '😔';
  return '😢';
}

// ============================================
// MAIN GENERATOR
// ============================================

export async function generateDiaryPDF(data: DiaryData): Promise<Buffer> {
  const doc = (
    <Document>
      <CoverPage data={data} />
      {data.sessions.map((session, index) => (
        <SessionPage key={index} session={session} companionName={data.companionName} />
      ))}
      <SummaryPage data={data} />
    </Document>
  );

  const pdfBlob = await pdf(doc).toBlob();
  const arrayBuffer = await pdfBlob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
