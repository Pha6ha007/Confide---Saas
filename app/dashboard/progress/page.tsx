import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="max-w-md">
        <CardHeader>
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle>Progress Coming Soon</CardTitle>
          <CardDescription>
            Your progress analytics will be available here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
