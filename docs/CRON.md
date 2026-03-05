# Vercel Cron Jobs — Документация

> **Автоматические фоновые задачи в Confide**

---

## Обзор

Confide использует Vercel Cron Jobs для выполнения автоматических фоновых задач по расписанию.

**Конфигурация:** `vercel.json`
**Security:** Все cron endpoints защищены `CRON_SECRET` (Bearer token)

---

## Активные Cron Jobs

### 1. Генерация ежемесячных дневников

**Endpoint:** `GET /api/cron/generate-diaries`
**Schedule:** `0 6 1 * *` (6:00 UTC на 1 число каждого месяца)
**Статус:** ✅ Активен (март 2026)

#### Что делает

Автоматически генерирует PDF дневники для всех пользователей, у которых были сессии в предыдущем месяце.

#### Алгоритм

1. **Определяет целевой месяц** — предыдущий месяц от текущей даты
2. **Находит активных пользователей** — SQL запрос distinct `userId` из `Session` за целевой месяц
3. **Batch processing** — параллельная генерация через `Promise.allSettled`
4. **Генерация для каждого пользователя:**
   - Получает сессии + messages за месяц
   - Создает запись в `Diary` table (status: generating)
   - Генерирует PDF через `@react-pdf/renderer`
   - Загружает в Supabase Storage (`diaries/{userId}/{year}-{month}-diary.pdf`)
   - Обновляет Diary (status: ready, storageUrl)
5. **Возвращает статистику** — `generated` / `skipped` / `errors`

#### Request

```bash
GET /api/cron/generate-diaries
Headers:
  Authorization: Bearer {CRON_SECRET}
```

#### Response

**Success:**
```json
{
  "success": true,
  "message": "Diary generation completed for 2026-2",
  "month": 2,
  "year": 2026,
  "totalUsers": 15,
  "generated": 12,
  "skipped": 2,
  "errors": 1,
  "errorDetails": [
    {
      "userId": "abc123",
      "error": "Upload failed: Insufficient storage"
    }
  ]
}
```

**Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

#### Error Handling

- **Частичные ошибки** — если генерация упала для одного пользователя, продолжает для остальных
- **Идемпотентность** — пропускает пользователей, у которых дневник уже существует (status: ready)
- **Logging** — логирует каждый шаг: `[CRON_START]`, `[CRON_USERS]`, `[CRON_SUCCESS]`, `[CRON_ERROR]`, `[CRON_COMPLETE]`

#### Файлы

- `app/api/cron/generate-diaries/route.ts` — cron endpoint
- `lib/diary/service.ts` — переиспользуемая логика генерации
- `lib/diary/generator.tsx` — PDF генератор через @react-pdf/renderer

---

## Безопасность

### CRON_SECRET

Все cron endpoints защищены Bearer token authentication.

**Генерация secret:**
```bash
openssl rand -base64 32
```

**Добавить в:**
1. `.env.local` — для локального тестирования
2. **Vercel Dashboard → Settings → Environment Variables**
   - Key: `CRON_SECRET`
   - Value: сгенерированный secret
   - Environments: ✅ Production, ✅ Preview, ✅ Development

### Проверка в коде

```typescript
const authHeader = req.headers.get('authorization');
const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

if (!authHeader || authHeader !== expectedAuth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Важно:**
- ❌ НИКОГДА не коммитить CRON_SECRET в git
- ✅ ВСЕГДА проверять auth header первым делом
- ✅ Логировать неавторизованные попытки вызова

---

## Тестирование

### Локально

```bash
# Установить CRON_SECRET в .env.local
echo "CRON_SECRET=$(openssl rand -base64 32)" >> .env.local

# Запустить dev server
npm run dev

# Вызвать cron endpoint вручную
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  http://localhost:3000/api/cron/generate-diaries
```

### Production

```bash
# Получить CRON_SECRET из Vercel Dashboard или .env.local
export CRON_SECRET="your_secret_here"

# Вызвать production endpoint
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  https://your-app.vercel.app/api/cron/generate-diaries
```

### Vercel CLI

```bash
# Установить Vercel CLI (если нет)
npm i -g vercel

# Вызвать cron endpoint через Vercel CLI
vercel env pull .env.local
curl -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d '=' -f2)" \
  http://localhost:3000/api/cron/generate-diaries
```

---

## Мониторинг

### Vercel Dashboard

**Settings → Crons:**
- Список всех зарегистрированных cron jobs
- Schedule и статус каждого job
- История выполнения (last run, next run)

**Functions → Logs:**
- Логи выполнения cron endpoints
- Фильтровать по `/api/cron/generate-diaries`
- Искать по `[CRON_START]`, `[CRON_ERROR]`, `[CRON_COMPLETE]`

### Recommended Logging

```typescript
console.log(`[CRON_START] Job started`);
console.log(`[CRON_USERS] Found ${count} users`);
console.log(`[CRON_SUCCESS] Generated for user ${userId}`);
console.error(`[CRON_ERROR] Failed for user ${userId}:`, error);
console.log(`[CRON_COMPLETE] Generated: ${generated}, Errors: ${errors}`);
```

**НЕ логировать:**
- ❌ Содержимое сообщений пользователей
- ❌ Личные данные (email, имена) без необходимости
- ❌ API ключи или секреты

---

## Добавление новых Cron Jobs

### Шаг 1: Обновить vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-diaries",
      "schedule": "0 6 1 * *"
    },
    {
      "path": "/api/cron/your-new-job",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Cron syntax:** `minute hour day month dayOfWeek`
- `0 6 1 * *` — 6:00 UTC, 1 число каждого месяца
- `0 0 * * *` — 00:00 UTC каждый день
- `*/30 * * * *` — каждые 30 минут
- `0 9 * * 1` — 9:00 UTC каждый понедельник

### Шаг 2: Создать API route

```typescript
// app/api/cron/your-new-job/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Security: Verify CRON_SECRET
  const authHeader = req.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    console.error('[CRON_UNAUTHORIZED] Invalid or missing CRON_SECRET');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[CRON_START] Your job started');

    // Your cron logic here

    console.log('[CRON_COMPLETE] Your job completed');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CRON_ERROR]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Шаг 3: Deploy

```bash
git add vercel.json app/api/cron/your-new-job/route.ts
git commit -m "feat: add new cron job"
git push origin main
```

Vercel автоматически зарегистрирует новый cron job после деплоя.

### Шаг 4: Тестирование

```bash
# Локально
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  http://localhost:3000/api/cron/your-new-job

# Production
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  https://your-app.vercel.app/api/cron/your-new-job
```

---

## Best Practices

### 1. Идемпотентность

Cron job может быть вызван дважды (Vercel retry при ошибке). Реализуйте идемпотентность:

```typescript
// Проверка существования
const existing = await prisma.diary.findUnique({
  where: { userId_month_year: { userId, month, year } }
});

if (existing && existing.status === 'ready') {
  return; // Уже обработано
}
```

### 2. Batch Processing

Обрабатывайте массивы параллельно через `Promise.allSettled`:

```typescript
const results = await Promise.allSettled(
  users.map((user) => processUser(user))
);

// Продолжает работу даже если один упал
```

### 3. Error Handling

- Собирайте ошибки, не прерывайте весь job
- Возвращайте статистику: `success` / `errors`
- Логируйте с префиксами для легкого поиска

### 4. Timeouts

Vercel Hobby plan: **10 секунд** timeout для Serverless Functions.
Vercel Pro plan: **60 секунд** timeout.

Для долгих задач:
- Batch processing с параллелизмом
- Разбивайте на несколько cron jobs
- Или используйте background jobs (Inngest, Trigger.dev)

### 5. Rate Limiting

Ограничивайте количество одновременных операций:

```typescript
// Обработка порциями по 10 пользователей
const chunks = chunkArray(users, 10);
for (const chunk of chunks) {
  await Promise.all(chunk.map(processUser));
}
```

---

## Troubleshooting

### Cron job не выполняется

1. **Проверьте vercel.json** — правильный путь и schedule?
2. **Vercel Dashboard → Settings → Crons** — зарегистрирован ли job?
3. **Redeploy** — после изменения vercel.json требуется redeploy

### Unauthorized ошибка

1. **CRON_SECRET** добавлен в Vercel Environment Variables?
2. Правильный ли header: `Authorization: Bearer {secret}`?
3. Проверьте логи: `[CRON_UNAUTHORIZED]`

### Timeout

1. **Hobby plan** — 10 сек лимит. Оптимизируйте или upgrade на Pro
2. **Batch processing** — обрабатывайте порциями
3. **Background jobs** — рассмотрите Inngest или Trigger.dev

### Частичные ошибки

1. Проверьте `errorDetails` в response
2. Логи: фильтруйте по `[CRON_ERROR]`
3. Fixните проблему → пользователи будут обработаны в следующий запуск (идемпотентность!)

---

## Планируемые Cron Jobs (будущее)

### Morning Check-ins
- **Schedule:** `0 9 * * *` (9:00 UTC каждый день)
- **Endpoint:** `/api/cron/send-morning-checkins`
- **Цель:** Отправлять проактивные сообщения "как дела?" пользователям

### Subscription Cleanup
- **Schedule:** `0 3 * * *` (3:00 UTC каждый день)
- **Endpoint:** `/api/cron/cleanup-expired-subscriptions`
- **Цель:** Downgrade пользователей с истекшими подписками

### RAG Index Update
- **Schedule:** `0 2 1 * *` (2:00 UTC, 1 число месяца)
- **Endpoint:** `/api/cron/update-rag-index`
- **Цель:** Обновлять Pinecone index новыми книгами

---

## Ресурсы

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Crontab Guru](https://crontab.guru) — cron schedule builder
- [ARCHITECTURE.md](../ARCHITECTURE.md) — общая архитектура проекта
- [CLAUDE.md](../CLAUDE.md) — главный гайд проекта

---

*Обновлено: 5 марта 2026*
