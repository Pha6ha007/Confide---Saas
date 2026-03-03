'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2 } from 'lucide-react'

interface CompanionNameEditorProps {
  initialName: string
}

export function CompanionNameEditor({ initialName }: CompanionNameEditorProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || name === initialName) {
      setIsEditing(false)
      setName(initialName)
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/settings/companion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionName: name.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to update companion name')
      }

      setIsEditing(false)
      router.refresh() // Обновить серверные компоненты
    } catch (error) {
      console.error('Failed to save companion name:', error)
      alert('Failed to save. Please try again.')
      setName(initialName)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setName(initialName)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-base text-gray-900">{initialName}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-indigo-600 hover:text-indigo-700"
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') handleCancel()
        }}
        maxLength={20}
        autoFocus
        disabled={isSaving}
      />
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
        >
          <Check className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
