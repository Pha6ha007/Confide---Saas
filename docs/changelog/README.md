# Changelog

> Хронологическая история разработки Confide.
> Каждый день = отдельный файл. Новый день → новый файл.

| Файл | Дата | Что сделано |
|------|------|-------------|
| [2026-03-03.md](./2026-03-03.md) | 3 марта | Phase 0, Phase 1 (auth, AI core, memory, crisis), RAG, конкуренты, email |
| [2026-03-04.md](./2026-03-04.md) | 4 марта | RAG optimization, agents integration, voice, onboarding, exercises, RAG expansion |
| [2026-03-05.md](./2026-03-05.md) | 5 марта | Mood tracking, goals, diary PDF, **cron job автогенерации**, **AI month summaries**, **monthly letter email**, conversation quality, chat history, memory upgrade, Alex personality, safety, **rate limiting** |
| [2026-03-06.md](./2026-03-06.md) | 6 марта | **Refund Policy page** (Paddle legal requirement) |
| [2026-03-10.md](./2026-03-10.md) | 10 марта | **Blog system** (evidence-based psychology articles, SEO, animated tag cloud, navigation integration), **SEO optimization** (sitemap.xml, robots.txt, JSON-LD structured data) |
| [2026-03-11.md](./2026-03-11.md) | 11 марта | **Paddle Billing** — полный цикл подписок: PaddleCheckout overlay, webhook обработка, AutoCheckout после регистрации, план Free→Pro работает end-to-end |
| [2026-03-24.md](./2026-03-24.md) | 24 марта | **Миграция Paddle → Dodo Payments** — новый Merchant of Record, redirect checkout, HMAC webhook, Prisma migration |
| [2026-03-25.md](./2026-03-25.md) | 25 марта | **Dodo Payments Live Mode** — переключение с test_mode на live_mode, реальные платежи активны |
| [2026-03-27.md](./2026-03-27.md) | 27 марта | **Security Hardening** — RLS на всех таблицах, security headers (CSP/HSTS), IP rate limiting, error masking, Zod validation, GitHub CI (Dependabot + CodeQL + Security CI) |
| [2026-03-30.md](./2026-03-30.md) | 30 марта | **OpenRouter AI Gateway** — полный рефакторинг AI инфраструктуры: multi-model architecture с fallback chains, MiniMax M2-her/M2.7 для чата, Claude Sonnet 4 для Premium, DeepSeek V3 для RAG, экономия ~8.5x |

## Формат записи

```markdown
## [YYYY-MM-DD] Название фичи

Краткое описание (2-3 строки)

**Файлы:** список созданных/изменённых файлов
**Результат:** что работает
```
