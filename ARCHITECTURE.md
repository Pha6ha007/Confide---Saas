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

### Следующие шаги — Phase 1

**Week 1-2: Фундамент**
- [ ] Auth flow (register, login, middleware)
- [ ] Онбординг с дисклеймером
- [ ] Базовые страницы: landing, login, dashboard

**Phase 1 — MVP Core (следующая):**
- [ ] Auth flow (register, login, onboarding)
- [ ] Текстовый чат с одним агентом (anxiety)
- [ ] RAG система (Pinecone + первые книги)
- [ ] Система памяти (session summary + user profile)
- [ ] Crisis Detection Layer
- [ ] Paddle subscriptions
- [ ] Landing page

---

*Log maintained by Claude Code + Cursor*
