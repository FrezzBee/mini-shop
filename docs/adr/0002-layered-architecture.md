# 0002 — Layered architecture rules

Дата: 2025-12-07
Статус: accepted

## Контекст
Модульний моноліт з папками api/, service/, domain/.

## Правила
- api/ — тільки контролери/роути: приймають HTTP, перетворюють на DTO, повертають відповіді за контрактом.
- service/ — бізнес-логіка і валідація; виконує операції, працює з domain та repository (DB access).
- domain/ — прості класи/структури (сутності), інварианти.

## Напрямок залежностей
- api -> service -> domain -> (інфраструктура/DB)
- Заборонено: api напряму звертатися в DB; domain не повинен залежати від api.

## API style & Error model
- RESTful resources (noun-based), JSON.
- Єдиний формат помилок:
  ```json
  {
    "error": "ValidationError",
    "code": "TITLE_REQUIRED",
    "details": [{ "field": "title", "message": "Title is required" }]
  }
