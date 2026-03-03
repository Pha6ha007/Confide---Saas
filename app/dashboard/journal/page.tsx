import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function JournalPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-md">
        <CardHeader>
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle>Journal Coming Soon</CardTitle>
          <CardDescription>
            Your personal insights journal will be available here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
