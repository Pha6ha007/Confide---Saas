# Confide — Integration Guide
> Все репозитории и библиотеки которые добавляем в проект.
> Обновлён: март 2026

---

## Порядок внедрения (рекомендуемый)

| # | Репозиторий / Задача | Сложность | Импакт | Статус |
|---|---------------------|-----------|--------|--------|
| 1 | **GSD-2** — установить систему разработки | Низкая (30 мин) | Критический | ⬜ |
| 2 | **PsyGUARD** — градации Crisis Agent | Низкая (2-3 ч) | Высокий (безопасность) | ⬜ |
| 3 | **ElevenLabs streaming** — TTS эндпоинт | Низкая (1-2 ч) | Средний (UX) | ⬜ |
| 4 | **whisper silence detection** — VoiceRecorder | Средняя (3-4 ч) | Средний (UX) | ⬜ |
| 5 | **counsel-chat + MentalChat16K** — датасеты RAG | Средняя (2-3 ч) | Высокий (качество ответов) | ⬜ |
| 6 | **mem0** — умная дедупликация памяти | Средняя (4-6 ч) | Высокий (память) | ⬜ |
| 7 | **langmem** — процедурная память | Средняя (3-4 ч) | Средний (персонализация) | ⬜ |
| 8 | **n8n-MCP + n8n-skills** — для YouTube пайплайна | Средняя (1-2 ч) | Высокий (автоматизация) | ⬜ |

---

## 0. GSD-2 — Система автономной разработки

**Репозиторий:** https://github.com/gsd-build/gsd-2.git
**Что это:** CLI система для Claude Code. Каждая задача получает свежее 200k-токенное контекстное окно без деградации. Один раз описал задачу — Claude Code строит автономно.

**Установка (один раз):**
```bash
npm install -g @gsd-build/gsd-2
```

**Как использовать:**
```bash
cd Confide---Saas
# В Claude Code:
/gsd new-milestone
```

**Промпт для первого milestone:**
```
Milestone: RAG Enhancement + Voice STT Improvement + Psychology Datasets

1. PSYCHOLOGY DATASETS — Download and ingest into Pinecone:
   - counsel-chat (HuggingFace: nbertagnolli/counsel-chat)
   - mental_health_counseling_conversations (HuggingFace: Amod/mental_health_counseling_conversations)
   New Pinecone namespace: 'counseling_qa'
   Script: scripts/ingest-counseling-datasets.ts (same pattern as ingest-knowledge.ts)

2. VOICE STT IMPROVEMENT — Add silence detection to VoiceRecorder:
   Auto-stop after 1.5s silence via Web Audio API analyser node.
   File: components/voice/VoiceRecorder.tsx

3. RESPONSE MODE SELECTOR — UI after transcription:
   Three buttons: [Text only] [Voice only] [Both]
   Save to localStorage key 'confide_response_mode'
   File: components/voice/ResponseModeSelector.tsx

Stack: Next.js 14, TypeScript, Supabase, Prisma, Pinecone, OpenAI Whisper, ElevenLabs, Tailwind, shadcn/ui.
Existing ingest script: scripts/ingest-knowledge.ts — reuse same pattern.
```

---

## 1. Psychology Datasets — Расширение RAG базы

**Источники:**
- https://huggingface.co/datasets/nbertagnolli/counsel-chat
- https://huggingface.co/datasets/Amod/mental_health_counseling_conversations
- https://huggingface.co/datasets/ShenLab/MentalChat16K

**Зачем:** Сейчас 1,634 чанка из 43 книг — это теория. Датасеты добавляют 16,000+ Q&A от реальных лицензированных терапевтов. Алекс начинает отвечать языком живого терапевта.

**Лицензии:**
- counsel-chat — открытый
- Amod/mental_health — RAIL-D, коммерческое использование требует донат $100 на CCC Foundation helpline
- MentalChat16K — только для исследований

**Новый namespace в Pinecone:** `counseling_qa`

### scripts/ingest-counseling-datasets.ts (новый файл)

```typescript
// Запуск: npx tsx scripts/ingest-counseling-datasets.ts
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

async function fetchCounselChat() {
  const url = 'https://huggingface.co/datasets/nbertagnolli/counsel-chat/resolve/main/data/counsel_chat_20220401.csv'
  const res = await fetch(url)
  const text = await res.text()
  const rows = text.split('\n').slice(1).filter(Boolean)
  return rows.map(row => {
    const cols = row.split(',')
    return { question: cols[2], answer: cols[3], topic: cols[1] }
  }).filter(r => r.question && r.answer)
}

async function ingest() {
  console.log('Загружаем counsel-chat...')
  const pairs = await fetchCounselChat()
  console.log(`Найдено ${pairs.length} Q&A пар`)

  const BATCH = 100
  for (let i = 0; i < pairs.length; i += BATCH) {
    const batch = pairs.slice(i, i + BATCH)
    const texts = batch.map(p =>
      `Question: ${p.question}\n\nTherapist response: ${p.answer}`
    )
    const embRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })
    const vectors = embRes.data.map((e, j) => ({
      id: `counsel-chat-${i + j}`,
      values: e.embedding,
      metadata: {
        text: texts[j],
        topic: batch[j].topic || 'general',
        source: 'counsel-chat',
        type: 'qa_pair',
      },
    }))
    await index.namespace('counseling_qa').upsert(vectors)
    console.log(`Загружено ${Math.min(i + BATCH, pairs.length)} / ${pairs.length}`)
  }
  console.log('✅ Готово! Namespace: counseling_qa')
}

ingest().catch(console.error)
```

---

## 2. Silence Detection — Улучшение VoiceRecorder

**Референс:** https://github.com/nitaiaharoni1/whisper-speech-to-text
**Зачем:** Автостоп при тишине — как в реальном разговоре. Не нужно жать кнопку.

### Добавить в components/voice/VoiceRecorder.tsx

```typescript
// Добавить в startRecording() после получения stream:
const audioContext = new AudioContext()
const analyser = audioContext.createAnalyser()
const source = audioContext.createMediaStreamSource(stream)
source.connect(analyser)

let silenceTimer: NodeJS.Timeout | undefined

const checkSilence = () => {
  const data = new Float32Array(analyser.frequencyBinCount)
  analyser.getFloatTimeDomainData(data)
  const rms = Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length)

  if (rms < 0.01) {
    if (!silenceTimer) {
      silenceTimer = setTimeout(() => stopRecording(), 1500)
    }
  } else {
    clearTimeout(silenceTimer)
    silenceTimer = undefined
  }
  requestAnimationFrame(checkSilence)
}

checkSilence()
```

---

## 3. mem0 — Умная дедупликация памяти

**Репозиторий:** https://github.com/mem0ai/mem0.git
**Лицензия:** Apache 2.0 — полностью бесплатно для коммерческого использования
**Режим:** Self-hosted — использует существующий Pinecone и OpenAI. Никаких доп. расходов и никакого MEM0_API_KEY не нужно.

**Зачем:** Memory Agent перезаписывает поля. mem0 дедуплицирует: "боюсь высоты" → "поборол страх высоты" = старый факт автоматически заменяется.

### Установка

```bash
npm install mem0ai
```

### lib/memory/mem0-client.ts (новый файл)

```typescript
import { Memory } from 'mem0ai'

// Self-hosted — никакого MEM0_API_KEY не нужно
export const memory = new Memory({
  vector_store: {
    provider: 'pinecone',
    config: {
      api_key: process.env.PINECONE_API_KEY,
      index_name: process.env.PINECONE_INDEX_NAME,
    }
  },
  llm: {
    provider: 'openai',
    config: {
      api_key: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
    }
  }
})

export async function addMemories(
  userId: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
) {
  return memory.add(messages, { user_id: userId })
}

export async function searchMemories(userId: string, query: string) {
  const results = await memory.search(query, { user_id: userId, limit: 5 })
  return results.map((r: any) => r.memory).join('\n')
}
```

### Интеграция в app/api/chat/route.ts

```typescript
import { searchMemories } from '@/lib/memory/mem0-client'

// Добавить к существующему коду:
const mem0Context = await searchMemories(userId, message)

const systemPrompt = buildSystemPrompt({
  userProfile,
  mem0Memories: mem0Context,  // новый слой
  ragContext,
  agent,
})
```

### Интеграция в app/api/memory/route.ts

```typescript
import { addMemories } from '@/lib/memory/mem0-client'

// Добавить после существующей логики Memory Agent:
await addMemories(userId, sessionMessages)
```

### .env.local — ничего нового не нужно

```bash
# mem0 self-hosted использует уже существующие ключи:
# OPENAI_API_KEY — уже есть
# PINECONE_API_KEY — уже есть
# PINECONE_INDEX_NAME — уже есть
```

---

## 4. langmem — Процедурная память

**Репозиторий:** https://github.com/langchain-ai/langmem
**Зачем:** Учится как говорить с конкретным пользователем: "короткие ответы", "не давать советы сразу", "метафоры заходят хорошо". Обновляется автоматически после каждой сессии.

### Установка

```bash
npm install @langchain/langgraph
```

### lib/memory/procedural-memory.ts (новый файл)

```typescript
import { ChatOpenAI } from '@langchain/openai'

export interface ProceduralMemory {
  responseStyle: string
  avoidPatterns: string[]
  effectivePatterns: string[]
}

export async function extractProceduralLessons(
  messages: { role: string; content: string }[],
): Promise<Partial<ProceduralMemory>> {
  const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 })

  const response = await llm.invoke([
    {
      role: 'system',
      content: `Analyse this therapy conversation.
Extract procedural lessons — what WORKED and what DIDN'T in the response style.
Return JSON: { effectivePatterns, avoidPatterns, responseStyleNote }.
Concrete observations only.`,
    },
    {
      role: 'user',
      content: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
    },
  ])

  try {
    return JSON.parse(response.content as string)
  } catch {
    return {}
  }
}

export function mergeProceduralMemory(existing: any, newLessons: Partial<ProceduralMemory>) {
  return {
    ...existing,
    effectivePatterns: [
      ...(existing.effectivePatterns || []),
      ...(newLessons.effectivePatterns || []),
    ].slice(-10),
    avoidPatterns: [
      ...(existing.avoidPatterns || []),
      ...(newLessons.avoidPatterns || []),
    ].slice(-10),
    responseStyleNote: newLessons.responseStyleNote || existing.responseStyleNote,
  }
}
```

### Интеграция в Memory Agent

```typescript
import { extractProceduralLessons, mergeProceduralMemory } from '@/lib/memory/procedural-memory'

// Добавить в конце обработки сессии:
const proceduralLessons = await extractProceduralLessons(sessionMessages)
const updatedStyle = mergeProceduralMemory(
  userProfile.communication_style,
  proceduralLessons
)

await prisma.userProfile.update({
  where: { userId },
  data: { communication_style: updatedStyle },
})
```

---

## 5. ElevenLabs — Streaming TTS + Replay

**Референс:** https://github.com/elevenlabs/elevenlabs-nextjs-starter
**Зачем:** Streaming снижает latency с 2-4 сек до ~0.5 сек. Алекс начинает говорить сразу.

### Streaming TTS — app/api/voice/tts/route.ts

```typescript
import { ElevenLabsClient } from 'elevenlabs'

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
})

export async function POST(req: Request) {
  const { text, voiceId } = await req.json()

  const audioStream = await elevenlabs.generate({
    voice: voiceId || 'Rachel',
    text,
    model_id: 'eleven_multilingual_v2',
    stream: true,
  })

  return new Response(audioStream as any, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  })
}
```

### Replay — расширить AudioPlayer

```typescript
const replay = () => {
  if (!audioRef.current) return
  audioRef.current.currentTime = 0
  audioRef.current.play()
}
// Добавить кнопку ↺ Replay в UI
```

---

## 6. PsyGUARD — Градации Crisis Agent

**Репозиторий:** https://github.com/qiuhuachuan/PsyGUARD (EMNLP 2024)
**Зачем:** 4 уровня риска вместо бинарного триггера. Мягкий ответ на пассивные мысли, жёсткий на реальную опасность. Лучше retention и выше шанс что человек получит помощь.

**Правило:** Crisis protocol остаётся HARDCODED. Только добавляем классификацию уровня.

### agents/crisis/risk-taxonomy.ts (новый файл)

```typescript
export type RiskLevel = 'none' | 'ideation' | 'planning' | 'imminent'

export const RISK_PATTERNS = {
  ideation: [
    /не хочу (больше )?жить/i,
    /лучше бы меня не было/i,
    /устал(а)? от жизни/i,
    /wish i (was|were) dead/i,
    /don'?t want to (be here|exist|live)/i,
    /tired of (living|life|everything)/i,
  ],
  planning: [
    /есть (план|способ|метод)/i,
    /thinking about how/i,
    /have a plan/i,
    /found a way/i,
  ],
  imminent: [
    /прямо сейчас/i,
    /последнее (сообщение|раз|прощай)/i,
    /right now/i,
    /tonight|today i will/i,
    /goodbye (everyone|forever|world)/i,
  ],
}

export function assessRisk(message: string) {
  const triggers: string[] = []
  let highestLevel: RiskLevel = 'none'

  for (const [level, patterns] of [
    ['imminent', RISK_PATTERNS.imminent],
    ['planning', RISK_PATTERNS.planning],
    ['ideation', RISK_PATTERNS.ideation],
  ] as const) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        triggers.push(pattern.source)
        if (highestLevel === 'none') highestLevel = level
      }
    }
  }

  return {
    level: highestLevel,
    confidence: triggers.length > 0 ? Math.min(0.5 + triggers.length * 0.15, 1) : 0,
    triggers,
  }
}
```

### Обновить agents/crisis/protocol.ts

```typescript
import { assessRisk, type RiskLevel } from './risk-taxonomy'

const HARDCODED_RESPONSES = {
  ideation: (language: string) => language === 'ru'
    ? `Слышу тебя. То что ты чувствуешь — очень тяжело.\n\nТелефон доверия, анонимно 24/7:\n🇷🇺 8-800-2000-122 (бесплатно)\n🌍 findahelpline.com\n\nТы не обязан справляться один.`
    : `I hear you. What you're feeling sounds really heavy.\n\nCrisis lines, free & anonymous 24/7:\n🇺🇸 988 (call or text)\n🌍 findahelpline.com\n\nYou don't have to carry this alone.`,

  critical: (language: string) => language === 'ru'
    ? `Твоя жизнь важна.\n\n🆘 Россия: 8-800-2000-122 (24/7)\n🆘 Скорая: 103`
    : `Your life matters.\n\n🆘 988 Suicide & Crisis Lifeline\n🆘 Crisis Text Line: text HOME to 741741\n🆘 Emergency: 911`,
}

export function runCrisisProtocol(message: string, language = 'en') {
  const assessment = assessRisk(message)
  if (assessment.level === 'none') return null

  console.log(`[Crisis] Level: ${assessment.level}, Confidence: ${assessment.confidence}`)

  return {
    triggered: true,
    response: assessment.level === 'ideation'
      ? HARDCODED_RESPONSES.ideation(language)
      : HARDCODED_RESPONSES.critical(language),
    level: assessment.level,
  }
}
```

### Prisma — добавить level в CrisisLog

```prisma
model CrisisLog {
  id        String   @id @default(cuid())
  userId    String
  sessionId String?
  level     String   @default("critical")  // ideation | planning | imminent
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 7. n8n-MCP + n8n-skills — Для YouTube пайплайна

**Репозиторий:** https://github.com/czlonkowski/n8n-mcp.git
**Репозиторий:** https://github.com/czlonkowski/n8n-skills.git

**Важно:** Эти инструменты нужны для YouTube автоматизации, НЕ для Confide продакшна. Устанавливаются в Claude Code один раз перед построением n8n пайплайна видео.

**Зачем:** Без n8n-MCP Claude угадывает параметры нод и делает ошибки (45 мин отладки). С n8n-MCP — точные параметры всех 536 нод, workflow работает с первого раза (3 мин).

### Установка

```bash
# В Claude Code — написать: "add this mcp server" и вставить конфиг
# или:
npm install -g @czlonkowski/n8n-mcp

# n8n-skills
git clone https://github.com/czlonkowski/n8n-skills.git
cp -r n8n-skills/skills/* ~/.claude/skills/
```

### Промпт для построения YouTube пайплайна

```
Построй n8n workflow для автоматического создания YouTube видео:

1. Webhook trigger — принимает тему истории
2. Claude API — генерирует сценарий + промпты для всех сцен
3. ПАРАЛЛЕЛЬНО:
   - Higgsfield API (Nano Banana) — 30 фото кадров
   - Higgsfield API (Kling) — 10 видео клипов с Soul ID
   - ElevenLabs API — нарратор MP3
   - HeyGen API — Marcus & Leo студийные сегменты
4. Creatomate API — сборка финального MP4
5. YouTube Data API — публикация с метаданными от Claude
```

---

## .env.local — итоговые переменные

```bash
# Существующие (не менять):
OPENAI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
ELEVENLABS_API_KEY=...

# mem0 self-hosted — дополнительных ключей НЕ НУЖНО
# Использует OPENAI_API_KEY и PINECONE_API_KEY

# Для YouTube пайплайна (не для Confide):
HIGGSFIELD_API_KEY=...
HEYGEN_API_KEY=...
CREATOMATE_API_KEY=...
YOUTUBE_API_KEY=...
```

---

## Что решили НЕ добавлять

| Репозиторий | Причина |
|-------------|---------|
| mem0 managed API | Self-hosted бесплатнее — используем его |
| WhisperLiveKit | Избыточно, это для конференций в реальном времени |
| MentalChat16K (ShenLab) | Лицензия только для исследований |

---

*Confide v0.1 | март 2026*
