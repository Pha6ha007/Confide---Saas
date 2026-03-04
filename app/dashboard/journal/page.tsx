import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, MessageCircle, Sparkles } from 'lucide-react'

export default async function JournalPage() {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Получить журнальные записи
  const journalEntries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const hasEntries = journalEntries.length > 0

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-semibold text-foreground">Your Journal</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Insights saved from your conversations
        </p>
      </div>

      {/* Empty State */}
      {!hasEntries && (
        <Card className="glass-button border border-white/20 shadow-large rounded-3xl transition-smooth hover-lift">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
              No insights yet
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Start a conversation and save moments that matter. Your journal will grow with each meaningful exchange.
            </p>
            <Link href="/dashboard/chat">
              <Button className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-semibold hover:shadow-lg transition-all">
                <MessageCircle className="w-4 h-4 mr-2" />
                Go to Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries List */}
      {hasEntries && (
        <div className="space-y-6">
          {journalEntries.map((entry) => (
            <Card
              key={entry.id}
              className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift overflow-hidden"
            >
              <CardContent className="p-6">
                {/* Date */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Saved Content */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed">{entry.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card внизу если есть записи */}
      {hasEntries && (
        <Card className="glass border border-white/20 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-[#6366F1] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Note:</strong> Your journal entries are
                  private and never used to train AI models. They're saved here for your personal
                  reflection and growth tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
