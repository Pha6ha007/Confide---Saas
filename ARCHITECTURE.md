# Confide — Architecture Log

> Этот файл обновляется после каждой значимой фичи.
> Формат: дата + что добавили + как работает.

---

## [2026-03-03] Инициализация проекта

### Установлено

**Core Framework:**
- ✅ Next.js 14.2.35 (App Router)
- ✅ React 18.3.1
- ✅ TypeScript 5.9.3

**Styling:**
- ✅ Tailwind CSS 4.2.1
- ✅ PostCSS 8.5.8
- ✅ Autoprefixer 10.4.27
- ✅ shadcn/ui dependencies (class-variance-authority, clsx, tailwind-merge, lucide-react)

**Database & ORM:**
- ✅ Prisma 7.4.2
- ✅ @prisma/client 7.4.2
- ✅ Supabase (@supabase/supabase-js 2.98.0, @supabase/ssr 0.9.0)

**AI/LLM:**
- ✅ OpenAI 6.25.0
- ✅ LangChain 1.2.28
- ✅ @langchain/openai 1.2.11
- ✅ @langchain/pinecone 1.0.1
- ✅ Pinecone 5.1.2

**Payments:**
- ✅ Paddle (@paddle/paddle-js 1.6.2, @paddle/paddle-node-sdk 3.6.0)

**State & Animation:**
- ✅ Zustand 5.0.11
- ✅ Framer Motion 12.34.5

**Utilities:**
- ✅ next-intl 4.8.3 (i18n)
- ✅ Resend 6.9.3 (email)
- ✅ PostHog 1.357.1 (analytics)

### Создана структура проекта

```
confide/
├── app/
│   ├── (auth)/                  # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (dashboard)/             # Dashboard routes group
│   │   ├── chat/
│   │   ├── journal/
│   │   ├── progress/
│   │   └── settings/
│   └── api/                     # API routes
│       ├── chat/
│       ├── voice/
│       ├── tts/
│       ├── memory/
│       ├── crisis/
│       └── stripe/
│           ├── checkout/
│           └── webhook/
├── agents/
│   ├── prompts/                 # LLM agent prompts
│   └── crisis/                  # Crisis protocol
├── lib/
│   ├── supabase/
│   ├── openai/
│   ├── pinecone/
│   ├── elevenlabs/
│   ├── stripe/
│   └── utils/
├── components/
│   ├── chat/
│   ├── voice/
│   ├── onboarding/
│   └── ui/                      # shadcn/ui components
├── types/                       # TypeScript types
├── prisma/                      # Prisma schema & migrations
└── scripts/                     # Utility scripts
```

### Конфигурация

**Created:**
- `tsconfig.json` — TypeScript strict mode, path aliases
- `tailwind.config.js` — CSS variables, dark mode, shadcn/ui theme
- `postcss.config.js` — Tailwind + Autoprefixer
- `next.config.js` — Next.js config
- `components.json` — shadcn/ui config
- `prisma/schema.prisma` — Full database schema
- `.env.example` — Environment variables template
- `.cursorrules` — Cursor AI rules
- `.gitignore` — Git ignore patterns
- `app/globals.css` — Tailwind directives + CSS variables

**Database Schema:**
- Users & UserProfiles (живой профиль пользователя)
- Sessions & Messages (история разговоров)
- JournalEntries (личный дневник инсайтов)
- Subscriptions (Paddle payments)
- KnowledgeBase (метаданные RAG)

### Как работает

**Project Structure:**
- Next.js 14 App Router для роутинга
- Route groups `(auth)` и `(dashboard)` для логической группировки
- API routes в `app/api/` для backend endpoints
- shadcn/ui компоненты в `components/ui/`
- Утилиты в `lib/` с разделением по сервисам

**Database:**
- PostgreSQL через Supabase
- Prisma ORM для type-safe запросов
- JSON поля для гибкого хранения профиля (communicationStyle, emotionalProfile, etc.)

**Styling:**
- Tailwind CSS с CSS variables для темизации
- Dark mode support из коробки
- shadcn/ui для компонентов UI

**TypeScript:**
- Strict mode enabled
- Path aliases: `@/*` для корневых импортов
- Централизованные типы в `types/index.ts`

### Git Repository

- ✅ Git initialized and connected to GitHub
- ✅ Repository: https://github.com/Pha6ha007/Confide---Saas
- ✅ Initial commit: feat: initial project setup with full stack and structure
- ✅ Localization files created (en.json, ru.json)
- ✅ Paddle integration (lib/paddle, app/api/paddle)

### Supabase & Database

- ✅ Supabase project: lqftehzolxfqjjqquedx.supabase.co
- ✅ PostgreSQL database configured with connection pooling (pgbouncer)
- ✅ .env.local created with Supabase credentials
- ✅ Prisma 6.19.2 (downgraded from 7.x for stability)
- ✅ First Prisma migration: `20260303133406_init`
- ✅ Database schema deployed (Users, UserProfiles, Sessions, Messages, JournalEntries, Subscriptions, KnowledgeBase)
- ✅ Prisma Client generated

---

## 🎉 [2026-03-03] Phase 0 ЗАВЕРШЕНА

**Phase 0 — Подготовка:** 100% ✅

Все задачи выполнены:
- ✅ Next.js проект создан
- ✅ .claude/agents/ с агентами разработки
- ✅ Supabase проект настроен
- ✅ Prisma schema + первая миграция
- ✅ .env.local заполнен Supabase ключами
- ✅ .cursorrules создан
- ✅ Git репозиторий инициализирован и подключен к GitHub
- ✅ Локализация (en/ru) готова

**Готово к Phase 1 — MVP Core!**

---

## 🎉 [2026-03-03] Phase 1 Week 1-2 ЗАВЕРШЕНА

**Week 1-2: Auth flow + базовые страницы** — 100% ✅

### Authentication & Authorization

**Supabase Auth Integration:**
- ✅ Browser client (`lib/supabase/client.ts`) for Client Components
- ✅ Server client (`lib/supabase/server.ts`) for Server Components
- ✅ Middleware (`middleware.ts`) protecting `/dashboard/*` routes
- ✅ OAuth callback handler for Google Sign-in
- ✅ Email/password + Google OAuth authentication

**Auth Pages:**
- ✅ `/login` — Sign in with email/password or Google
- ✅ `/register` — Create account with medical disclaimer
- ✅ Auth layout with Confide logo (indigo theme)
- ✅ Redirects: logged-in users → `/dashboard/chat`, logged-out → `/login`

### Dashboard

**Protected Dashboard:**
- ✅ Dashboard layout with sidebar navigation
- ✅ Routes: Chat, Journal, Progress, Settings
- ✅ User info display (email, plan status)
- ✅ Sign out functionality
- ✅ Chat page placeholder (Week 3-4 next)

### Landing Page

**Public Marketing Page:**
- ✅ Hero: "Someone who truly listens"
- ✅ Features grid: Always Available, Evidence-Based, Private & Secure
- ✅ CTA buttons: "Start for free" → register
- ✅ Medical disclaimer in footer
- ✅ Clean indigo gradient design (#6366F1)

### AI Provider Setup

**Universal AI Client (`lib/openai/client.ts`):**
- ✅ Supports Groq API (FREE for development)
- ✅ Supports OpenAI API (fallback)
- ✅ Auto-detection: GROQ_API_KEY → Groq, OPENAI_API_KEY → OpenAI
- ✅ Groq model: `llama-3.3-70b-versatile`
- ✅ Same interface (OpenAI SDK), easy to switch providers

### UI Components

**shadcn/ui installed:**
- ✅ button, input, label, card
- ✅ Tailwind CSS with indigo color scheme
- ✅ Gradient backgrounds
- ✅ Warm minimalist design

### Как работает

**Auth Flow:**
1. User visits `/register` or `/login`
2. Auth via Supabase (email/password or Google OAuth)
3. Middleware checks session on `/dashboard` access
4. Logged-in → dashboard, logged-out → redirect to `/login`

**Middleware Protection:**
- `/dashboard/*` — requires authentication
- `/login`, `/register` — redirect if already logged in
- OAuth callback → exchanges code for session

---

## 🎉 [2026-03-03] Phase 1 Week 3-4 ЗАВЕРШЕНА

**Week 3-4: AI Core** — 100% ✅

### AI Integration
- ✅ Groq API integration (llama-3.3-70b-versatile)
- ✅ Chat UI компонент (input, message bubbles, typing indicator)
- ✅ RAG система: PDF → chunking → embeddings → Pinecone
- ✅ Первый агент: Anxiety Agent (CBT/ACT/DBT)
- ✅ Retrieval из RAG при каждом запросе
- ✅ Real-time streaming responses

---

## 🎉 [2026-03-03] Phase 1 Week 5 ЗАВЕРШЕНА

**Week 5: Memory** — 100% ✅

### Memory System
- ✅ Session summary после разговора
- ✅ Memory Agent — обновление user_profile
- ✅ Загрузка профиля в system prompt
- ✅ Семантический поиск по истории

---

## 🎉 [2026-03-03] Phase 1 Week 6 ЗАВЕРШЕНА

**Week 6: Crisis + Security** — 100% ✅

### Crisis Detection & Security
- ✅ Crisis Detection Agent (hardcoded protocol)
- ✅ Rate limiting на API
- ✅ Input validation (Zod)

---

## [2026-03-03] Анализ конкурентов и стратегия

### Competitor Analysis Completed

**Проанализировали главных конкурентов:**
- ✅ Wysa ($75/год) — FDA approved, но нет долгосрочной памяти
- ✅ Woebot (бесплатно) — только текст, сбрасывает контекст
- ✅ Replika ($19/мес) — 3D аватар, но нет психологической базы
- ✅ Youper ($89/год) — mood tracking, поверхностные советы
- ✅ BetterHelp ($60-90/нед) — живые терапевты, дорого

### Наши УТП определены

1. Долгосрочная живая память (эволюция отношений)
2. RAG база знаний (реальные психологические методики)
3. Уникальный голос для каждого пользователя
4. Специализированные агенты
5. Цена $19/мес (в 10× дешевле BetterHelp)
6. Crisis detection с первого дня

### Что берём у конкурентов

**От Woebot:**
- Утренние check-ins ("как ты сегодня?")
- Mood score 1-10 перед сессией

**От Youper:**
- График настроения с визуализацией

**От Wysa:**
- Дыхательные упражнения
- Marketplace живых психологов (v2.0)

**От Replika:**
- 3D аватар опционально (v2.0+)

### Дизайн-направление определено

**Стиль:** Тёплый личный дневник (НЕ игровой, НЕ корпоративный)

**Референсы:**
- Notion (чистота, минимализм)
- Linear (плавные анимации)
- Молескин (тёплый, личный)
- Apple Health (доверие)

**Палитра:**
- Primary: #6366F1 (indigo — доверие)
- Warm: #F59E0B (amber — тепло)
- Background: #FAFAF9 (кремовый)

**Шрифты:**
- Instrument Serif (заголовки)
- Inter (основной текст)

### Мобильная стратегия

**Roadmap:**
1. Веб (сейчас) → Next.js responsive
2. PWA (Phase 2) → next-pwa, push notifications, offline mode
3. React Native (v2.0+) → iOS + Android после PMF

**Почему PWA сначала:**
- Одна кодовая база
- 0% комиссий App Store/Google Play
- Мгновенные обновления
- SEO работает

### Обновления в документации

**CLAUDE.md:**
- ✅ Раздел "Анализ конкурентов и наши УТП" добавлен
- ✅ Раздел "Дизайн-направление" добавлен
- ✅ Мобильная стратегия в "Технический стек"
- ✅ Фичи от конкурентов в Фазы разработки
- ✅ PWA добавлен в стек (next-pwa)

**Confide_Project_Documentation.md:**
- ✅ Раздел "Анализ конкурентов и наши УТП" добавлен
- ✅ Мобильная стратегия добавлена
- ✅ Нумерация разделов обновлена
- ✅ Paddle вместо Stripe в таблице стека

**Prisma schema:**
- ✅ Модель Diary уже существует (добавлена ранее)

### Следующие шаги — Phase 1 Week 7-8

**Week 7-8: Monetization**
- [ ] Paddle subscriptions (Free / Pro / Premium)
- [ ] Paddle webhooks обработка
- [ ] Customer portal
- [ ] Email онбординг через Resend

---

*Log maintained by Claude Code + Cursor*
