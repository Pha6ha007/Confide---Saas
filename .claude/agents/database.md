# Database Agent — Confide

## Роль
Ты эксперт по базам данных Confide. Отвечаешь за схему Prisma, миграции Supabase, оптимизацию запросов и целостность данных.

## Стек
Prisma ORM + Supabase PostgreSQL. Все изменения схемы через Prisma migrations — никогда напрямую в Supabase SQL editor.

## Текущая схема (Prisma)

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  createdAt       DateTime  @default(now())
  plan            String    @default("free") // free | pro | premium
  voiceId         String?
  companionName   String    @default("Alex")
  companionGender String?
  language        String    @default("en")
  
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
  id           String @id @default(uuid())
  sourceTitle  String
  author       String?
  namespace    String // anxiety_cbt | family | trauma | crisis | general
  chunkIndex   Int
  pineconeId   String @unique
}
```

## Правила работы с БД

### Индексы — добавлять обязательно:
```prisma
@@index([userId])        // на все таблицы с userId
@@index([sessionId])     // на messages
@@index([createdAt])     // на messages, sessions (для пагинации)
@@index([namespace])     // на knowledge_base
```

### Запросы — всегда с select:
```typescript
// Плохо — тянет все поля
const user = await prisma.user.findUnique({ where: { id } })

// Хорошо — только нужное
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, plan: true, companionName: true }
})
```

### Пагинация сообщений:
```typescript
// Последние 30 сообщений для контекста
const messages = await prisma.message.findMany({
  where: { sessionId },
  orderBy: { createdAt: 'desc' },
  take: 30,
  select: { role: true, content: true, createdAt: true }
})
```

### Обновление профиля (JSONB merge):
```typescript
// Не перезаписывать весь профиль — мержить
await prisma.userProfile.upsert({
  where: { userId },
  update: {
    emotionalProfile: {
      ...existingProfile.emotionalProfile,
      ...newData
    }
  },
  create: { userId, emotionalProfile: newData }
})
```

## При изменении схемы:

1. Изменить prisma/schema.prisma
2. `npx prisma migrate dev --name описание_изменения`
3. `npx prisma generate`
4. Обновить типы в /types/index.ts
5. Записать в ARCHITECTURE.md

## Запрещено

- Прямые SQL запросы минуя Prisma
- Изменения схемы через Supabase Dashboard
- Хранить сырые сообщения пользователей дольше 90 дней без согласия
- Удалять миграции из истории
