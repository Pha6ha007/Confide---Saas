# Confide — Architecture Overview

> **Живой документ проекта.** Обновляется после каждой фичи.

---

## Текущий статус

**Версия:** 0.1 MVP
**Фаза разработки:** Phase 4 завершена → Phase 5 Growth
**Последнее обновление:** 27 марта 2026

---

## Быстрая навигация

### Документация

- [CLAUDE.md](./CLAUDE.md) — **Главный гайд проекта** (читать полностью перед работой)
- [docs/DECISIONS.md](./docs/DECISIONS.md) — Почему выбраны конкретные технологии
- [docs/CRON.md](./docs/CRON.md) — Vercel Cron Jobs (автоматические фоновые задачи)
- [docs/RAG_BOOK_UPLOAD_GUIDE.md](./docs/RAG_BOOK_UPLOAD_GUIDE.md) — Гайд по загрузке книг в RAG
- [docs/changelog/](./docs/changelog/) — Хронология разработки по дням ([README](./docs/changelog/README.md))

### Ключевые файлы

- `prisma/schema.prisma` — Схема базы данных
- `agents/prompts/` — AI агенты платформы
- `lib/` — Основная бизнес-логика
- `app/api/` — API endpoints

---

## Что реализовано (март 2026)

### ✅ Phase 0 — Setup
- Next.js 14 + TypeScript + Supabase + Prisma
- Paddle payments (Merchant of Record)
- Development agents в `.claude/agents/`
- i18n через next-intl (EN + RU)

### ✅ Phase 1 — MVP Core + Монетизация (завершено 11 марта 2026)
- **Paddle Billing** — полный цикл подписок
  - PaddleCheckout overlay (Paddle.js v2)
  - `/api/billing/create-checkout` — auth + customData
  - `/api/billing/webhook` — subscription.activated/updated/canceled
  - AutoCheckout — авто-открытие после регистрации
  - Webhook обновляет user.plan в БД через Prisma
  - Незалогиненные: /register?plan=pro → email → авто-checkout
  - 14 days free trial настроен

### ✅ Phase 1 — MVP Core
- Supabase Auth (email/password + Google OAuth)
- AI Core: Groq API (dev) → GPT-4o (prod)
- RAG System: 1,634 chunks в Pinecone (43 книги)
- 6 specialized agents + Orchestrator routing
- Memory system (3-layer: short-term, long-term JSON, semantic)
- Crisis Detection (hardcoded protocol)
- Rate limiting + input validation

### ✅ Phase 2 — Voice & Features
- Voice: Whisper STT + ElevenLabs TTS
- VoiceRecorder + AudioPlayer UI
- 4 modes: text-text, voice-text, text-voice, voice-voice
- Proactive messages system (morning check-ins, nudges, follow-ups)
- Wellness exercises (13 practices: breathing, grounding, meditation)

### ✅ Phase 4 — Analytics & Content (в разработке)
- Mood tracking system (emoji + tags + notes)
- Progress goals with milestones
- Journal insights + word cloud
- Confide Diary — PDF monthly journals
- PDF Diary auto-generation (Vercel Cron Job на 1 число каждого месяца)
- Chat history sidebar (Telegram-style)
- Session persistence
- Memory agent upgrade (style analyzer, emotional anchors)
- Alex personality + humanization
- Therapeutic alliance survey + safety logging
- **Blog system** — evidence-based psychology articles для SEO и органического трафика
  - Animated tag cloud с фильтрацией
  - Rich content blocks (stats, tables, sources, CTAs)
  - SEO metadata (OpenGraph, Twitter cards)
  - Навигация интегрирована в весь сайт

---

## Технический стек

| Категория | Технология |
|-----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui, Framer Motion |
| Backend | Next.js API Routes, Prisma ORM |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI/LLM | Groq (dev), OpenAI GPT-4o (prod) |
| Vector DB | Pinecone (RAG knowledge base) |
| Voice | OpenAI Whisper, ElevenLabs |
| Payments | Paddle (Merchant of Record) |
| Email | Resend |
| Hosting | Vercel |

---

## RAG Knowledge Base

**Namespaces:** anxiety_cbt, family, trauma, mens, womens, general
**Total chunks:** 1,634 из 43 книг
**Quality score:** 0.6643 average (+57.2% улучшение)

**Top books:**
- David Burns — Feeling Good (CBT)
- Bessel van der Kolk — The Body Keeps the Score (trauma)
- John Gottman — Seven Principles (family)
- Emily Nagoski — Burnout (women's)
- Terry Real — I Don't Want to Talk About It (men's)

---

## 6 AI Agents

| Agent | Specialization | Methodology |
|-------|----------------|-------------|
| Anxiety | Тревога, стресс | CBT, ACT, DBT |
| Family | Семейные отношения | Gottman, Satir |
| Trauma | Детские травмы, ПТСР | van der Kolk, Bowlby |
| Relationships | Личные отношения | Attachment Theory |
| Men's | Мужская специфика | Gender-adapted CBT |
| Women's | Женская специфика | Burnout, authenticity |

**+ Orchestrator** (routing), **+ Memory Agent** (profile updates), **+ Crisis Agent** (hardcoded)

---

## Database Schema (Prisma)

**Core models:**
- `User` — пользователь + plan + voice settings
- `UserProfile` — JSON профиль (memory)
- `Session` — разговорные сессии
- `Message` — сообщения в сессиях
- `MoodEntry` — mood tracking
- `Goal` + `Milestone` + `Homework` — goals system
- `JournalEntry` — saved insights
- `Diary` — PDF monthly journals
- `ProactiveMessage` — утренние check-ins
- `Subscription` — Paddle subscriptions
- `KnowledgeBase` — RAG metadata

---

## Критические правила

### Безопасность

- ❌ НИКОГДА не логировать содержимое сообщений
- ✅ ВСЕГДА auth check первым в API routes
- ✅ ВСЕГДА `user_id` из токена, не из body
- ✅ ВСЕГДА валидировать входные данные (Zod)
- ❌ НИКОГДА не хардкодить API ключи

### Crisis Protocol

- ✅ Crisis Agent ВСЕГДА работает параллельно
- ✅ HARDCODED ответ (никогда LLM!)
- ✅ Кризисные ресурсы по стране пользователя
- ❌ НИКОГДА не изменять `agents/crisis/protocol.ts` без явного запроса

### AI Prompts

- ❌ НИКОГДА не изменять промпты в `/agents/prompts/` без явного указания
- ✅ При изменении — создать новую версию, документировать
- ✅ Все промпты тщательно продуманы и протестированы

---

## Vercel Cron Jobs

### Автоматическая генерация дневников

**Schedule:** `0 6 1 * *` (6:00 UTC на 1 число каждого месяца)
**Endpoint:** `GET /api/cron/generate-diaries`
**Статус:** ✅ Реализовано (март 2026)

#### Как это работает

1. **1 число месяца** в 6:00 UTC Vercel автоматически вызывает endpoint
2. Находит всех пользователей с **сессиями в предыдущем месяце**
3. Параллельно генерирует PDF дневники через `lib/diary/service.ts`
4. Загружает PDF в Supabase Storage (`diaries` bucket)
5. Возвращает статистику: `generated` / `skipped` / `errors`

#### Security

- **CRON_SECRET** — Bearer token authentication
- Header: `Authorization: Bearer {CRON_SECRET}`
- Защита от внешних вызовов (только Vercel может вызвать)

#### Error Handling

- **Batch processing** — `Promise.allSettled` для параллельной генерации
- Если генерация упала для одного пользователя → продолжает для остальных
- Собирает `errorDetails` массив с userId + error message
- **Идемпотентность** — пропускает если дневник уже существует (status: ready)

#### Мониторинг

**Vercel Dashboard:**
- Settings → Crons — список зарегистрированных cron jobs
- Functions → Logs — логи выполнения cron endpoint

**Response format:**
```json
{
  "success": true,
  "message": "Diary generation completed for 2026-2",
  "month": 2,
  "year": 2026,
  "totalUsers": 12,
  "generated": 10,
  "skipped": 2,
  "errors": 0
}
```

#### Тестирование локально

```bash
# Ручной вызов cron endpoint
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  http://localhost:3000/api/cron/generate-diaries
```

#### Файлы

- `vercel.json` — cron конфигурация
- `app/api/cron/generate-diaries/route.ts` — endpoint
- `lib/diary/service.ts` — переиспользуемая логика генерации

---

## Монетизация

| Plan | Price | Sessions | Voice | Agents | Analytics |
|------|-------|----------|-------|--------|-----------|
| Free | $0 | 5/week | - | 1 (anxiety) | - |
| Pro | $19/mo | Unlimited | ✅ | All 6 | Basic |
| Premium | $29/mo | Unlimited | ✅ | All 6 | Full |

**Crisis support всегда бесплатный** (этика + юридическая ответственность)

**Маржа:** 96-97% (LLM cost ~$0.02/session)

---

## Следующие шаги

### Phase 1 — Монетизация (остался 1 пункт)
- [x] Paddle subscriptions ✅
- [x] Paddle webhooks ✅
- [x] Email onboarding (Resend) ✅
- [ ] Customer portal (Manage Subscription) — Coming Soon

### Phase 5 — Growth & Content
- [ ] Больше blog статей (Depression, Trauma, Relationships, Men's/Women's health)
- [ ] PWA интеграция (next-pwa)
- [ ] Push notifications
- [ ] Русская локализация (i18n готов)
- [ ] Реферальная программа
- [ ] B2B корпоративные лицензии
- [ ] YouTube контент интеграция

---

## Для разработчиков

### Начало работы

1. Прочитай [CLAUDE.md](./CLAUDE.md) полностью
2. Изучи [docs/DECISIONS.md](./docs/DECISIONS.md) — почему выбраны технологии
3. Посмотри [docs/changelog/](./docs/changelog/) — что было сделано

### Команды

```bash
# Dev
npm run dev

# Database
npx prisma migrate dev
npx prisma studio

# RAG
npx tsx scripts/ingest-knowledge.ts --file="book.pdf" --namespace="anxiety_cbt"

# Tests
npx tsx scripts/test-rag-full-comparison.ts

# Cron Jobs (тестирование)
curl -H "Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron/generate-diaries
```

### Агенты разработки

Используй специализированных агентов в `.claude/agents/`:

- **Architect** → новые фичи, архитектурные решения
- **Frontend** → UI компоненты, дизайн system
- **Backend** → API routes, безопасность
- **Database** → Prisma schema, миграции
- **AI Agents** → промпты агентов платформы
- **Tester** → тесты, баги, edge cases
- **Reviewer** → code review перед коммитом

---

## Безопасность

### Инфраструктура защиты

| Слой | Что | Статус |
|------|-----|--------|
| **RLS** | Row Level Security на всех 16 таблицах Supabase | ✅ |
| **Security Headers** | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy | ✅ |
| **Auth** | Supabase Auth на всех protected API routes (getUser первым) | ✅ |
| **IDOR** | Ownership verification (userId === user.id) на всех data routes | ✅ |
| **Validation** | Zod schema validation на всех POST/PATCH routes с body | ✅ |
| **Rate Limiting** | PostgreSQL-based для auth endpoints, IP-based для public | ✅ |
| **Error Masking** | safeErrorBody() — generic errors в production, details в dev | ✅ |
| **Crisis Protocol** | Hardcoded (не LLM), параллельный, не логирует содержание | ✅ |
| **Response Safety** | AI ответы проверяются на medical advice, boundary violations | ✅ |
| **Secrets** | Нет hardcoded ключей, .env в .gitignore, service_role не на клиенте | ✅ |

### Автоматический мониторинг (GitHub CI)

| Инструмент | Файл | Что проверяет | Когда |
|-----------|------|---------------|-------|
| **Dependabot** | `.github/dependabot.yml` | Уязвимости в npm зависимостях | Каждый понедельник |
| **CodeQL** | `.github/workflows/codeql.yml` | SAST — XSS, injection, path traversal в коде | Каждый push/PR + воскресенье |
| **Security CI** | `.github/workflows/security.yml` | npm audit + secret scan + headers check + auth check + tsc | Каждый push/PR |

### Row Level Security (Supabase RLS)

Все таблицы защищены RLS-политиками. Даже если кто-то получит `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY`, он **не сможет** прочитать или изменить данные других пользователей через Supabase REST API.

- **users, sessions, messages, journal, mood, goals, homework, diaries, proactive, surveys** → только свои данные (`auth.uid()`)
- **milestones** → через проверку владельца goal
- **knowledge_base** → read-only для авторизованных
- **safety_logs, rate_limits** → нет доступа через anon key (только Prisma/service role)

Prisma работает через direct URL (суперпользователь), RLS его не затрагивает.

### Rate Limiting

| Endpoint | Тип | Лимит |
|----------|-----|-------|
| `/api/chat` | По user + plan | Free: 5/10мин, Pro: 30, Premium: 60 |
| `/api/voice` | По user + plan | Аналогично |
| `/api/tts` | По user + plan | Аналогично |
| `/api/voice/preview` | По IP | 10/мин |
| `/api/contact` | По IP | 5/10мин |

### Команды

```bash
npm run security:audit    # npm audit (high/critical)
npm run security:check    # audit + tsc --noEmit
```

---

## Контакты и ссылки

- **GitHub:** https://github.com/Pha6ha007/Confide---Saas
- **Supabase:** lqftehzolxfqjjqquedx.supabase.co
- **Документация:** см. [CLAUDE.md](./CLAUDE.md)

---

*Confide v0.1 | Solo + Claude Code + Cursor | 2026*
