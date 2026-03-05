'use client';

// Confide Diary List — Display all monthly diaries
// Shows status: generating, ready, error

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Diary {
  id: string;
  month: number;
  year: number;
  title: string;
  status: 'generating' | 'ready' | 'error';
  storageUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export function DiaryList() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchDiaries();
  }, []);

  async function fetchDiaries() {
    try {
      const res = await fetch('/api/diary/list');
      const data = await res.json();

      if (res.ok) {
        setDiaries(data.diaries);
      } else {
        toast.error('Failed to load diaries');
      }
    } catch (error) {
      console.error('[DIARY_LIST_FETCH_ERROR]', error);
      toast.error('Failed to load diaries');
    } finally {
      setLoading(false);
    }
  }

  async function generateDiary(month: number, year: number) {
    setGenerating(`${year}-${month}`);

    try {
      const res = await fetch('/api/diary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Diary generation started!');
        await fetchDiaries(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to generate diary');
      }
    } catch (error) {
      console.error('[DIARY_GENERATE_ERROR]', error);
      toast.error('Failed to generate diary');
    } finally {
      setGenerating(null);
    }
  }

  function getStatusIcon(status: Diary['status']) {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'generating':
        return <Clock className="w-5 h-5 text-amber-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  }

  function getStatusText(status: Diary['status']) {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'generating':
        return 'Generating...';
      case 'error':
        return 'Error';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Your Diaries
          </h2>
          <p className="text-muted-foreground mt-2">
            Monthly reflections of your journey with Confide
          </p>
        </div>

        <Button
          onClick={() => {
            const now = new Date();
            generateDiary(now.getMonth() + 1, now.getFullYear());
          }}
          disabled={!!generating}
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Current Month
        </Button>
      </div>

      {/* Diaries Grid */}
      {diaries.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center shadow-card">
          <p className="text-muted-foreground mb-4">
            You don't have any diaries yet.
          </p>
          <Button
            onClick={() => {
              const now = new Date();
              generateDiary(now.getMonth() + 1, now.getFullYear());
            }}
            disabled={!!generating}
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Your First Diary
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diaries.map((diary) => (
            <DiaryCard
              key={diary.id}
              diary={diary}
              onRegenerate={() => generateDiary(diary.month, diary.year)}
              generating={generating === `${diary.year}-${diary.month}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// DIARY CARD COMPONENT
// ============================================

function DiaryCard({
  diary,
  onRegenerate,
  generating,
}: {
  diary: Diary;
  onRegenerate: () => void;
  generating: boolean;
}) {
  const monthName = format(new Date(diary.year, diary.month - 1), 'MMMM yyyy');

  return (
    <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-large transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground">
            {monthName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {diary.title || 'Your Journey'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(diary.status)}
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
            diary.status === 'ready'
              ? 'bg-green-100 text-green-700'
              : diary.status === 'generating'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {getStatusText(diary.status)}
        </span>
      </div>

      {/* Error Message */}
      {diary.status === 'error' && diary.errorMessage && (
        <p className="text-sm text-red-600 mb-4">{diary.errorMessage}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {diary.status === 'ready' && diary.storageUrl && (
          <Button
            size="sm"
            onClick={() => window.open(diary.storageUrl!, '_blank')}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}

        {diary.status === 'error' && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            disabled={generating}
            className="flex-1"
          >
            {generating ? 'Generating...' : 'Retry'}
          </Button>
        )}
      </div>
    </div>
  );
}

function getStatusIcon(status: Diary['status']) {
  switch (status) {
    case 'ready':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'generating':
      return <Clock className="w-5 h-5 text-amber-600 animate-pulse" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
  }
}

function getStatusText(status: Diary['status']) {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'generating':
      return 'Generating...';
    case 'error':
      return 'Error';
  }
}
