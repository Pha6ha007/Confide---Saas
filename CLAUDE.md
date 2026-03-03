# Confide — AI Psychological Support Platform
## Claude Code Project Guide

> **Читай этот файл полностью перед любым действием.**
> Это главный документ проекта. Все решения принимаются на основе него.

---

## СОДЕРЖАНИЕ

1. Что мы строим
2. Технический стек
3. Агенты разработки
4. Структура проекта
5. Схема базы данных
6. AI агенты платформы
7. Критические правила
8. Переменные окружения
9. Фазы разработки
10. RAG база знаний
11. Монетизация
12. YouTube канал
13. Как работать в Claude Code
14. Ключевые промпты
15. Частые вопросы

---

## 1. ЧТО МЫ СТРОИМ

**Confide** — платформа психологической поддержки нового поколения.

**НЕ** AI-психолог. **НЕ** медицинский сервис. **НЕ** чат-бот.

**А** — умный собеседник по имени Алекс (или любое имя которое выберет пользователь), который:
- Помнит всю историю разговоров
- Адаптируется под стиль общения каждого пользователя
- С каждой сессией понимает пользователя глубже
- Отвечает голосом (уникальным для каждого пользователя)
- Основан на реальной психологической базе знаний (RAG)

**Позиционирование:** "Разговор по душам — место где тебя всегда выслушают"

**Рынки:** English (основной) + Russian (параллельно, i18n с первого дня)

### Эволюция отношений с агентом

Месяц 1: Осторожно, формально — "Расскажи подробнее..."
Месяц 3: Теплее — "Ты говорил про маму — как там?"
Месяц 6: Как старый друг — "Ты снова так говоришь когда устал"
Год+: "За год ты заметно спокойнее — ты сам это замечаешь?"

---

## 2. ТЕХНИЧЕСКИЙ СТЕК

Frontend:       Next.js 14 (App Router) + TypeScript
Styles:         Tailwind CSS + shadcn/ui
Animation:      Framer Motion
State:          Zustand
Database:       Supabase (PostgreSQL + Auth + Storage + Realtime)
ORM:            Prisma
AI/LLM:         OpenAI API (GPT-4o)
Agents:         LangChain.js
Vector DB:      Pinecone (RAG)
Speech-to-Text: OpenAI Whisper API
Text-to-Speech: ElevenLabs API
Hosting:        Vercel
Payments:       Paddle (Merchant of Record — налоги и VAT автоматически)
Email:          Resend
Analytics:      PostHog

**Почему Paddle, не Stripe:**
Paddle = Merchant of Record. Они сами платят все налоги и VAT в 40+ странах.
Для solo-разработчика на рынках EN + RU — это огромная экономия времени и денег.
Комиссия 5% + /bin/sh.50 но ноль головной боли с налогами, бухгалтером, compliance.

---

## 3. АГЕНТЫ РАЗРАБОТКИ (.claude/agents/)

Специализированные агенты которые помогают строить проект.
Claude Code читает их автоматически и применяет нужный по контексту задачи.

| Агент      | Файл           | Зона ответственности                          |
|------------|----------------|-----------------------------------------------|
| Architect  | architect.md   | Архитектурные решения, структура, новые фичи  |
| Frontend   | frontend.md    | UI компоненты, дизайн system, анимации        |
| Backend    | backend.md     | API routes, безопасность, интеграции          |
| Database   | database.md    | Prisma schema, миграции, оптимизация запросов |
| AI Agents  | ai-agents.md   | Промпты агентов платформы, LangChain, RAG     |
| Tester     | tester.md      | Тесты, баги, edge cases, Crisis Detection     |
| Reviewer   | reviewer.md    | Code review перед каждым коммитом             |

Claude Code сам определяет какого агента использовать по типу задачи.
Можно вызвать явно: "Используй Architect агента — планирую добавить X"

---

## 4. СТРУКТУРА ПРОЕКТА

confide/
├── .claude/
│   ├── agents/
│   │   ├── architect.md
│   │   ├── frontend.md
│   │   ├── backend.md
│   │   ├── database.md
│   │   ├── ai-agents.md
│   │   ├── tester.md
│   │   └── reviewer.md
│   └── CLAUDE.md
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/page.tsx        # Квиз + выбор голоса
│   ├── (dashboard)/
│   │   ├── chat/page.tsx              # Основной чат
│   │   ├── journal/page.tsx           # Дневник инсайтов
│   │   ├── progress/page.tsx          # Аналитика прогресса
│   │   └── settings/page.tsx          # Настройки профиля
│   ├── api/
│   │   ├── chat/route.ts              # Основной AI endpoint
│   │   ├── voice/route.ts             # Whisper транскрипция
│   │   ├── tts/route.ts               # ElevenLabs TTS
│   │   ├── memory/route.ts            # Memory Agent
│   │   ├── crisis/route.ts            # Crisis Detection
│   │   └── paddle/
│   │       ├── webhook/route.ts       # Paddle события подписок
│   │       └── portal/route.ts        # Customer portal
│   ├── layout.tsx
│   └── page.tsx                       # Landing page
├── agents/
│   ├── prompts/
│   │   ├── orchestrator.ts            # Маршрутизация
│   │   ├── anxiety.ts                 # Тревога (CBT/ACT)
│   │   ├── family.ts                  # Семья (Gottman, Satir)
│   │   ├── trauma.ts                  # Травмы (van der Kolk)
│   │   ├── relationships.ts           # Отношения
│   │   ├── mens.ts                    # Для мужчин
│   │   ├── womens.ts                  # Для женщин
│   │   └── memory.ts                  # Memory Agent промпт
│   └── crisis/
│       └── protocol.ts                # HARDCODED — не через LLM
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── openai/client.ts
│   ├── pinecone/client.ts
│   ├── pinecone/retrieval.ts
│   ├── elevenlabs/client.ts
│   ├── paddle/client.ts               # Paddle Node SDK
│   └── utils/
│       ├── memory.ts                  # Работа с профилем
│       ├── chunker.ts                 # Чанкинг для RAG
│       └── rate-limit.ts              # Rate limiting
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── SourcesPanel.tsx           # Источники из RAG
│   ├── voice/
│   │   ├── VoiceRecorder.tsx          # Hold-to-record
│   │   └── AudioPlayer.tsx
│   ├── billing/
│   │   ├── UpgradeButton.tsx          # Paddle Checkout
│   │   └── SubscriptionCard.tsx
│   ├── onboarding/
│   │   ├── VoiceQuiz.tsx
│   │   └── VoicePreview.tsx
│   └── ui/                            # shadcn компоненты
├── types/index.ts                     # Все TypeScript типы
├── prisma/schema.prisma
├── scripts/
│   └── ingest-knowledge.ts            # Загрузка книг в RAG
├── locales/
│   ├── en.json
│   └── ru.json
├── middleware.ts
├── .env.local
├── .env.example
├── .cursorrules
└── ARCHITECTURE.md

---

## 5. СХЕМА БАЗЫ ДАННЫХ (Prisma)

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  createdAt       DateTime  @default(now())
  plan            String    @default("free")   // free | pro | premium
  voiceId         String?
  companionName   String    @default("Alex")
  companionGender String?                        // male | female
  language        String    @default("en")      // en | ru
  profile         UserProfile?
  sessions        Session[]
  messages        Message[]
  journalEntries  JournalEntry[]
  subscription    Subscription?
}

model UserProfile {
  id                 String   @id @default(uuid())
  userId             String   @unique
  communicationStyle Json     @default("{}")
  emotionalProfile   Json     @default("{}")
  lifeContext        Json     @default("{}")
  patterns           Json     @default("[]")
  progress           Json     @default("{}")
  whatWorked         Json     @default("[]")
  updatedAt          DateTime @updatedAt
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id        String    @id @default(uuid())
  userId    String
  agentType String
  createdAt DateTime  @default(now())
  endedAt   DateTime?
  summary   String?
  moodScore Int?
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
}

model Message {
  id        String   @id @default(uuid())
  sessionId String
  userId    String
  role      String   // user | assistant
  content   String
  audioUrl  String?
  createdAt DateTime @default(now())
  isCrisis  Boolean  @default(false)
  session   Session  @relation(fields: [sessionId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}

model JournalEntry {
  id              String   @id @default(uuid())
  userId          String
  content         String
  insight         String?
  sourceMessageId String?
  createdAt       DateTime @default(now())
  user            User     @relation(fields: [userId], references: [id])
}

model Subscription {
  id                   String    @id @default(uuid())
  userId               String    @unique
  paddleCustomerId     String?   @unique
  paddleSubscriptionId String?   @unique
  plan                 String
  status               String    // active | canceled | past_due | trialing
  expiresAt            DateTime?
  createdAt            DateTime  @default(now())
  user                 User      @relation(fields: [userId], references: [id])
}

model KnowledgeBase {
  id          String @id @default(uuid())
  sourceTitle String
  author      String?
  namespace   String  // anxiety_cbt | family | trauma | crisis | general
  chunkIndex  Int
  pineconeId  String @unique
}

### Профиль пользователя — что запоминается

{
  "communication_style": "пишет коротко, любит юмор, не любит давления",
  "emotional_profile": {
    "triggers": ["критика на работе", "конфликты с мамой"],
    "pain_points": ["одиночество", "неуверенность в себе"],
    "responds_to": "вопросы лучше чем советы"
  },
  "life_context": {
    "key_people": ["мама", "партнёр Дима", "начальница Ирина"],
    "work": "разработчик, работает удалённо",
    "situation": "переезд в новый город 6 месяцев назад"
  },
  "patterns": ["избегает конфликтов", "перфекционизм"],
  "progress": "стал спокойнее говорить о маме чем 3 месяца назад",
  "what_worked": "техника 5-4-3-2-1 при тревоге"
}

---

## 6. AI АГЕНТЫ ПЛАТФОРМЫ

### Агенты которые общаются с пользователями

| Агент        | Файл             | Специализация          | Методики             |
|--------------|------------------|------------------------|----------------------|
| Orchestrator | orchestrator.ts  | Маршрутизация          | Определяет тип       |
| Anxiety      | anxiety.ts       | Тревога, стресс        | CBT, ACT, DBT        |
| Family       | family.ts        | Семейные отношения     | Gottman, Satir       |
| Trauma       | trauma.ts        | Детские травмы, ПТСР   | van der Kolk, Bowlby |
| Relationships| relationships.ts | Личные отношения       | Attachment Theory    |
| Men          | mens.ts          | Специфика для мужчин   | Gender-adapted CBT   |
| Women        | womens.ts        | Специфика для женщин   | Gender-adapted CBT   |
| Memory       | memory.ts        | Обновление профиля     | После каждой сессии  |
| Crisis       | protocol.ts      | КРИЗИС                 | HARDCODED, без LLM   |

### Структура памяти

SHORT-TERM:  последние 30 сообщений в контексте
LONG-TERM:   JSON профиль в Supabase (обновляет Memory Agent)
SEMANTIC:    Pinecone — поиск по всей истории разговоров
SUMMARY:     GPT-4o сжимает каждую сессию в 5-7 фактов

### Как строится system prompt каждого запроса

const systemPrompt = 

### Memory Agent — что извлекает после сессии

{
  new_people: ["имена упомянутые впервые"],
  updated_triggers: ["новые триггеры"],
  communication_style_notes: "наблюдения о стиле общения",
  what_worked: "что помогло в этой сессии",
  progress_notes: "признаки роста или изменений",
  key_themes: ["главные темы сессии"],
  follow_up: "что вспомнить на следующей сессии"
}

---

## 7. КРИТИЧЕСКИЕ ПРАВИЛА

### Безопасность данных — АБСОЛЮТНЫЕ

НИКОГДА не логировать содержимое сообщений пользователей
НИКОГДА не передавать user_id в третьи сервисы без необходимости
ВСЕГДА auth check первым делом в каждом API route
ВСЕГДА user_id из токена — не из body запроса
НИКОГДА не хардкодить API ключи в коде
ВСЕГДА валидировать входные данные (Zod)

### Crisis Protocol — ЖЕЛЕЗНОЕ ПРАВИЛО

Crisis Agent ВСЕГДА работает параллельно основному агенту.
При обнаружении триггеров:
- НЕМЕДЛЕННО прерывает основной поток
- Возвращает HARDCODED ответ (никогда LLM!)
- Показывает кризисные ресурсы по стране пользователя
- Логирует событие (без содержания) для модерации

НИКОГДА не маршрутизировать кризисные случаи через LLM
НИКОГДА не изменять agents/crisis/protocol.ts без явного запроса

Кризисные ресурсы (hardcoded):
- USA: 988 Suicide & Crisis Lifeline — call or text 988
- UK: Samaritans — 116 123
- Germany: Telefonseelsorge — 0800 111 0 111
- Russia: 8-800-2000-122
- International: findahelpline.com

### Медицинский дисклеймер

Агент НИКОГДА не:
- Ставит диагнозы
- Рекомендует медикаменты
- Называет себя психологом или терапевтом
- Гарантирует результат

Агент ВСЕГДА:
- Представляется как AI-собеседник
- Рекомендует специалиста при серьёзных симптомах
- Напоминает что это поддержка, не лечение

### Промпты агентов платформы

НИКОГДА не изменять системные промпты без явного указания
Все промпты в /agents/prompts/ — продуманные конструкции
При изменении — создать новую версию, не перезаписывать

### Paddle платежи

ВСЕГДА верифицировать paddle-signature в webhook
ВСЕГДА обрабатывать идемпотентно (событие может прийти дважды)
user_id передавать через customData, не через email

---

## 8. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (.env.local)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX_NAME=confide-knowledge

# ElevenLabs
ELEVENLABS_API_KEY=

# Paddle (вместо Stripe — Merchant of Record)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
PADDLE_PRICE_PRO_MONTHLY=
PADDLE_PRICE_PREMIUM_MONTHLY=

# Resend (email)
RESEND_API_KEY=

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

---

## 9. ФАЗЫ РАЗРАБОТКИ

### Фаза 0 — Подготовка (СЕЙЧАС)
- [ ] Next.js проект создан
- [ ] .claude/agents/ с агентами разработки
- [ ] Supabase проект настроен
- [ ] Prisma schema + первая миграция
- [ ] .env.local заполнен всеми ключами
- [ ] .cursorrules создан

### Фаза 1 — MVP Core (6-8 недель)

Неделя 1-2: Фундамент
- [ ] Auth flow (register, login, middleware)
- [ ] Онбординг с дисклеймером
- [ ] Базовые страницы: landing, login, dashboard

Неделя 3-4: AI ядро
- [ ] Интеграция OpenAI API (GPT-4o)
- [ ] RAG: PDF → чанкинг → embeddings → Pinecone
- [ ] Первый агент (anxiety) с системным промптом
- [ ] Retrieval при каждом запросе

Неделя 5: Память
- [ ] Session summary после каждого разговора
- [ ] Memory Agent — обновление user_profile
- [ ] Подгрузка профиля в начало каждой сессии
- [ ] Семантический поиск по истории

Неделя 6: Crisis + безопасность
- [ ] Crisis Detection Agent (параллельный)
- [ ] Hardcoded кризисный протокол
- [ ] Rate limiting на API
- [ ] Input validation (Zod)

Неделя 7-8: Монетизация
- [ ] Paddle subscriptions (Free / Pro / Premium)
- [ ] Paddle webhooks обработка
- [ ] Customer portal
- [ ] Email онбординг через Resend

### Фаза 2 — Голос (4-5 недель)
- [ ] VoiceRecorder компонент (MediaRecorder API)
- [ ] Whisper транскрипция (/api/voice)
- [ ] ElevenLabs TTS (/api/tts)
- [ ] Voice Design квиз при онбординге
- [ ] Уникальный голос для каждого пользователя
- [ ] Статусы: слушает / думает / отвечает
- [ ] Режимы: голос-голос, голос-текст, текст-голос, текст-текст

### Фаза 3 — Все агенты (4-6 недель)
- [ ] Все 6 специализированных агентов
- [ ] Orchestrator маршрутизация
- [ ] Переключение агентов с сохранением контекста
- [ ] Бета-тест с реальными пользователями

### Фаза 4 — Аналитика (4-5 недель)
- [ ] Личный дневник инсайтов
- [ ] График настроения с визуализацией
- [ ] Прогресс-карта по целям
- [ ] Письмо из прошлого (ежемесячный отчёт)
- [ ] Домашние задания от агента
- [ ] Облако слов — топ тем за месяц

### Фаза 5 — Рост
- [ ] Мультиязычность RU (i18n уже заложен)
- [ ] Реферальная программа
- [ ] Вирусные карточки инсайтов
- [ ] B2B корпоративные лицензии
- [ ] Marketplace живых психологов

---

## 10. RAG БАЗА ЗНАНИЙ

### Namespaces в Pinecone

anxiety_cbt  — CBT, ACT, DBT методики
family       — Gottman, Satir, системная терапия
trauma       — van der Kolk, Bowlby, ПТСР
crisis       — протоколы кризисного вмешательства
general      — Rogers, Yalom, Frankl, общая база

### Первые книги для загрузки (приоритет)

1. Aaron Beck — Cognitive Therapy (CBT основа)
2. David Burns — Feeling Good
3. Carl Rogers — On Becoming a Person
4. Bessel van der Kolk — The Body Keeps the Score
5. John Gottman — Seven Principles
6. Viktor Frankl — Man's Search for Meaning
7. Judith Herman — Trauma and Recovery
8. Irvin Yalom — The Gift of Therapy

### Загрузка в RAG

npx tsx scripts/ingest-knowledge.ts   --file="book.pdf"   --namespace="anxiety_cbt"   --title="Feeling Good"   --author="David Burns"

### Правила RAG

- Чанки по 500 токенов с overlap 50
- Метаданные: book_title, author, chapter, namespace
- Retrieval: top-5 чанков по cosine similarity
- Обновление: раз в квартал
- Не загружать дубли — проверять по pineconeId

---

## 11. МОНЕТИЗАЦИЯ

### Тарифные планы

| | Free | Pro 9/мес | Premium 9/мес |
|-|------|-------------|-----------------|
| Сессии | 5/неделю | Безлимит | Безлимит |
| Голос | - | + | + |
| Уникальный голос | - | + | + |
| Агенты | 1 (anxiety) | Все 6 | Все 6 |
| Аналитика | - | Базовая | Полная |
| Crisis support | Всегда | Всегда | Всегда |

### Rate limiting

Free:    5 сообщений / 10 минут
Pro:     30 сообщений / 10 минут
Premium: 60 сообщений / 10 минут

### Инфраструктурные расходы (до 100 пользователей)

OpenAI API (GPT-4o):  0-80/мес
OpenAI Whisper:       0-20/мес
ElevenLabs Starter:   2/мес
Pinecone Free:        /bin/sh/мес
Supabase:             /bin/sh-25/мес
Vercel:               /bin/sh-20/мес
Paddle:               5% + /bin/sh.50 с транзакции
ИТОГО:               ~2-150/мес + % от дохода

Окупаемость: ~10-12 платящих пользователей на Pro плане

---

## 12. YOUTUBE КАНАЛ (параллельный проект)

Канал = главный маркетинговый канал платформы.
Стоимость привлечения в 10 раз дешевле платной рекламы.

### Формат ролика (15 мин)

0:00  — Ведущие: диалог Ангел vs Демон, тема серии       [2 мин]
2:00  — История: драматизированная психологическая ситуация [8 мин]
10:00 — Ведущие: разбор и психологические советы          [5 мин]
15:00 — CTA: ссылка на Confide

### Инструменты производства

Higgsfield.ai Ultimate 9 — Soul ID, Kling, Nano Banana
ElevenLabs Starter 2     — голоса ведущих
HeyGen Essential 9       — lipsync ведущих
Suno AI Pro 0            — генерация музыки
CapCut Pro 0             — монтаж и субтитры
ИТОГО: 10/мес

### Пайплайн одного ролика

1. Claude    — полный скрипт + раскадровка + промпты сцен (30 мин)
2. Soul ID   — создание персонажей один раз, переиспользуем (1-2 ч)
3. Nano Banana — 25-30 фото сцен с consistent персонажами (30-40 мин)
4. Kling     — 12-15 видеоклипов ключевых сцен 5-10 сек (1-1.5 ч)
5. HeyGen    — ведущие с lipsync по скрипту (20-30 мин)
6. ElevenLabs — озвучка истории и персонажей (20 мин)
7. Suno AI   — 2-3 трека: фоновый, напряжённый, финальный (10 мин)
8. CapCut    — монтаж: видео + озвучка + музыка + субтитры (1-1.5 ч)

Итого: 4-5 часов первые разы → 2-3 часа после отработки

### Серии контента

- "Любовь которая разрушает" — токсичные отношения
- "Родители которые ранят" — детские травмы
- "Мужчины не плачут" — мужская уязвимость
- "Тихая тревога" — панические атаки
- "Семья на грани" — развод, кризис отношений

---

## 13. КАК РАБОТАТЬ С ПРОЕКТОМ В CLAUDE CODE

### При старте каждой сессии

Прочитай CLAUDE.md полностью.
Прочитай ARCHITECTURE.md — текущее состояние.
Запусти: git status + git log --oneline -5
Определи текущую фазу по чеклистам.
Предложи 3 следующих задачи по приоритету.

### При написании кода

Всегда TypeScript — никогда plain JS
Всегда обработка ошибок в API routes
Всегда auth check первым на protected routes
user_id — только из токена, не из body
Никогда не хардкодить API ключи
Компоненты — функциональные с TypeScript types
Новые типы — добавлять в types/index.ts

### При создании API route

1. Auth check первым — если нет auth, return 401
2. Plan check — проверить лимиты по плану
3. Rate limit check — защита от abuse
4. Zod валидация входных данных
5. Бизнес логика
6. Response — только нужные поля, не весь объект

### При создании AI агента платформы

Промпты в /agents/prompts/ отдельными файлами
Экспортировать как buildPrompt(userProfile, history, ragContext)
Версионировать через комментарии при изменении
Crisis protocol — только в /agents/crisis/protocol.ts

### При работе с агентами разработки

Architect  → любое новое решение или фича
Frontend   → UI компоненты, страницы, дизайн
Backend    → API routes, интеграции, безопасность
Database   → изменения схемы Prisma
AI Agents  → промпты и логика агентов платформы
Tester     → поиск багов, написание тестов
Reviewer   → code review перед каждым коммитом

### Как восстановить контекст после перерыва

Прочитай CLAUDE.md и ARCHITECTURE.md.
Выполни: git log --oneline -10
Опиши текущее состояние: что реализовано, что не закончено.
Предложи 3 следующих задачи по приоритету.

---

## 14. КЛЮЧЕВЫЕ ПРОМПТЫ ДЛЯ РАЗРАБОТКИ

### RAG система

Реализуй RAG систему:
PDF загрузка → text chunking (500 токенов, overlap 50) →
OpenAI embeddings (text-embedding-3-small) →
сохранение в Pinecone с metadata (book_title, author, chapter, namespace).
Retrieval: top-5 чанков по cosine similarity.
Файлы: scripts/ingest-knowledge.ts и lib/pinecone/retrieval.ts

### Голосовой компонент

Создай VoiceRecorder React компонент:
hold-to-record кнопка через MediaRecorder API →
отправка audio blob на /api/voice →
Whisper транскрипция →
агент генерирует ответ →
ElevenLabs TTS через /api/tts →
воспроизведение через AudioPlayer.
Статусы: listening / thinking / speaking.
Анимации через Framer Motion.

### Memory Agent

После каждой сессии запускай Memory Agent:
анализирует conversation,
извлекает 5-7 фактов о пользователе в JSON,
делает merge с существующим user_profile (не перезаписывает!),
сохраняет в Supabase через Prisma.
Профиль подгружается в system prompt каждой новой сессии.

### Crisis Detection

Создай параллельный CrisisAgent:
анализирует КАЖДОЕ сообщение на триггеры синхронно.
При обнаружении — прерывает основной поток,
возвращает HARDCODED ответ (не через LLM!),
показывает ресурсы по стране из user.language.
Логирует событие в БД без содержания сообщения.

### Paddle интеграция

Реализуй Paddle подписки:
- UpgradeButton компонент открывает Paddle Checkout
- /api/paddle/webhook обрабатывает события подписок
- subscription.activated → обновить user.plan в БД
- subscription.canceled → downgrade на free
- /api/paddle/portal → ссылка на управление подпиской
- ВСЕГДА верифицировать paddle-signature

---

## 15. ЧАСТЫЕ ВОПРОСЫ

Q: Как добавить нового AI агента платформы?
A: 1) Создай промпт в /agents/prompts/
   2) Добавь в Orchestrator маршрутизацию
   3) Добавь namespace в Pinecone
   4) Обнови AgentType в types/index.ts

Q: Как протестировать Crisis Agent?
A: Используй файл /agents/crisis/test-phrases.ts
   НИКОГДА не тестируй на реальных пользователях в проде

Q: Как обновить RAG базу?
A: npx tsx scripts/ingest-knowledge.ts с новым файлом
   Старые чанки не удаляются — проверяй дубли по pineconeId

Q: Как добавить новый язык?
A: Создай /locales/ru.json по аналогии с /locales/en.json
   i18n через next-intl заложен с первого дня

Q: Paddle webhook не срабатывает локально?
A: Используй: paddle listen --address localhost:3000/api/paddle/webhook
   Или ngrok для туннелирования

Q: Как проверить что Memory Agent работает?
A: После сессии запроси user_profile из Supabase
   Должны появиться новые данные в communicationStyle / emotionalProfile

Q: Что делать если агент отвечает слишком формально?
A: Обнови communication_style в user_profile
   Агент адаптируется к стилю на основе профиля

---

## CURSORRULES (создать в корне проекта)

# Confide — AI Psychological Support Platform
Stack: Next.js 14 App Router, TypeScript, Supabase, LangChain.js, Pinecone, Tailwind, shadcn/ui
Payments: Paddle (NOT Stripe)
This is a mental health SUPPORT platform (NOT medical service).

RULES:
- NEVER log user conversation content
- ALWAYS TypeScript — never plain JS
- ALWAYS error handling in API routes
- ALWAYS auth check on protected routes — first line
- ALWAYS user_id from token, never from request body
- NEVER hardcode API keys
- Agent prompts in /agents/prompts/ — NEVER modify without explicit instruction
- Crisis protocol HARDCODED — never route through LLM
- Components: functional with TypeScript types always
- New types: always add to types/index.ts
- Paddle webhooks: always verify paddle-signature

---

## ARCHITECTURE.md (обновляй после каждой фичи)

[2026-03] Инициализация проекта
  - Next.js 14 + TypeScript + Supabase + Prisma
  - Paddle вместо Stripe (Merchant of Record)
  - Агенты разработки в .claude/agents/
  - i18n через next-intl заложен с первого дня

[TODO] Добавлять по мере разработки...

---

*Confide v0.1 | Solo + Claude Code + Cursor | 2026*