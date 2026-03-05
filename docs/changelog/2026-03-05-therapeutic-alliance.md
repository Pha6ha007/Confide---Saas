# 2026-03-05 — Therapeutic Alliance + Safety + AI Transparency

> **Основано на исследованиях Dartmouth Therabot и Brown University**

## Что добавлено

### 1. Therapeutic Alliance Survey ✅

Опрос качества терапевтического альянса после каждых 5 сессий.

**База данных:**
- `AllianceSurvey` model — хранит результаты опросов
- Поля: understanding (1-5), trust (1-5), helpfulness (1-5), feedback (optional text)

**API:**
- `POST /api/survey/alliance` — сохранить результат опроса
- `GET /api/survey/check` — проверить нужно ли показать опрос

**UI:**
- `components/chat/AllianceSurvey.tsx` — модальный опрос с Framer Motion анимациями
- Интеграция в ChatWindow.tsx — показывается после завершения каждой 5-й, 10-й, 15-й сессии
- Триггер: при нажатии "New Conversation" после Memory Agent
- Стиль: тёплый дизайн в стиле проекта, кружки 1-5 с hover эффектами

**Цель:** Измерять качество связи пользователя с Alex, выявлять проблемы рано.

---

### 2. Safety Logging ✅

Автоматическое логирование потенциально проблемных ответов AI для review.

**База данных:**
- `SafetyLog` model — хранит флаги безопасности
- Типы триггеров: `crisis_adjacent`, `inappropriate`, `boundary_violation`, `medical_advice`
- Severity: `low`, `medium`, `high`

**Логика:**
- `lib/safety/response-checker.ts` — проверяет каждый ответ агента на паттерны
- Интегрирован в `app/api/chat/route.ts` — работает ПОСЛЕ получения ответа от LLM, ДО отправки пользователю
- Не блокирует ответ (пользователь всегда получает сообщение)
- High severity → console.warn + TODO: admin alert

**Паттерны:**
- **Medical advice:** "you should take medication", "diagnosis", "you might have bipolar"
- **Boundary violation:** "I love you", "I have feelings", "I wish I could hug you"
- **Crisis adjacent:** "don't want to be here", "better off without me", "can't take it anymore"
- **Inappropriate:** "it's not that bad", "just think positive", "get over it", "man up"

**Цель:** Обнаруживать проблемные ответы рано, улучшать промпты на основе логов.

---

### 3. AI Transparency ✅

Честность о том, что Alex — это AI. Без скрытности, но и без навязывания.

**Обновлены все 6 agent prompts:**
- `agents/prompts/anxiety.ts`
- `agents/prompts/family.ts`
- `agents/prompts/trauma.ts`
- `agents/prompts/relationships.ts`
- `agents/prompts/mens.ts`
- `agents/prompts/womens.ts`

**Добавлена edge case секция:**
```
## User asks "are you real?" or "are you AI?":
Be honest. Be matter-of-fact. Don't make it weird or dramatic.
"Yeah, I'm AI. But what's happening here — the conversation, what you're feeling, the thinking we're doing together — that's all real, isn't it? Does knowing I'm AI change how this feels for you?"

IMPORTANT: Never volunteer "I'm AI" unprompted. But if asked — always be honest immediately. No hedging, no "in a way I am" — just honest.
```

**Первое приветствие (greeting):**
- Обновлён `app/api/chat/greeting/route.ts`
- Новый пользователь получает: *"Hey {name}! I'm Alex. I'm an AI companion — not a therapist, not a human — but I'm here to listen, remember, and help you think things through. What's on your mind?"*
- Говорится ОДИН раз при первом контакте, дальше не повторяется

**About Alex в Settings:**
- Добавлена карточка в `app/dashboard/settings/page.tsx`
- Объясняет: что Alex может / что не может / когда нужна реальная помощь
- Кризисное предупреждение выделено жёлтым

**Цель:** Пользователи должны понимать с кем общаются. Это увеличивает доверие, снижает риск зависимости.

---

## Файлы изменены

**База данных:**
- `prisma/schema.prisma` — AllianceSurvey + SafetyLog models
- `prisma/migrations/20260305095214_add_alliance_survey_and_safety_logging/` — миграция

**API:**
- `app/api/survey/alliance/route.ts` — NEW
- `app/api/survey/check/route.ts` — NEW
- `app/api/chat/route.ts` — добавлен safety check
- `app/api/chat/greeting/route.ts` — AI disclosure

**Components:**
- `components/chat/AllianceSurvey.tsx` — NEW
- `components/chat/ChatWindow.tsx` — интеграция survey

**Utils:**
- `lib/safety/response-checker.ts` — NEW

**Prompts (все 6):**
- `agents/prompts/anxiety.ts`
- `agents/prompts/family.ts`
- `agents/prompts/trauma.ts`
- `agents/prompts/relationships.ts`
- `agents/prompts/mens.ts`
- `agents/prompts/womens.ts`

**Settings:**
- `app/dashboard/settings/page.tsx` — About Alex карточка

---

## Почему это важно

1. **Therapeutic Alliance Survey** → измеряет качество связи, выявляет проблемы рано (Dartmouth research: alliance = главный предиктор успеха терапии)

2. **Safety Logging** → защищает пользователей от плохих советов, помогает улучшать промпты (Brown University: AI терапия должна логировать для контроля)

3. **AI Transparency** → этичность, доверие, снижает риск зависимости (пользователь должен знать что это AI, но не чувствовать себя обманутым)

---

## Следующие шаги

- [ ] Мониторинг SafetyLog — создать admin dashboard для review флагов
- [ ] Анализ AllianceSurvey — построить тренды по опросам (средний балл, динамика)
- [ ] Улучшение промптов на основе safety flags
- [ ] Email уведомления админам при high severity safety events

---

*Research-backed improvements для Confide v0.1 | Solo + Claude Code | март 2026*
