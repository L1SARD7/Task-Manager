# Task Manager API

Backend API на NestJS для керування задачами, проєктами та коментарями.

## Стек
- Node.js 20+
- NestJS 11
- MongoDB
- Jest + Supertest
- Docker + Docker Compose

## Функціональні модулі
- `GET /health` — перевірка стану сервісу
- `POST /auth/register`, `POST /auth/login`
- `projects` (CRUD)
- `tasks` (CRUD + filters + status + analytics)
- `comments` (create/list/delete)
- Swagger: `GET /api/docs`

---

## 1) Швидкий старт через Docker

### 1.1 Передумови
- Docker
- Docker Compose (plugin `docker compose`)

### 1.2 Підготовка env
```bash
cp .env.example .env
```

### 1.3 Запуск
```bash
docker compose up --build -d
```

### 1.4 Перевірка
```bash
curl http://localhost:3000/health
```
Очікувана відповідь:
```json
{"status":"ok"}
```

Swagger:
- http://localhost:3000/api/docs

### 1.5 Логи
```bash
docker compose logs -f api
docker compose logs -f mongo
```

### 1.6 Зупинка
```bash
docker compose down
```

---

## 2) Локальний запуск без Docker

### 2.1 Передумови
- Node.js 20+
- Yarn (або Corepack)
- Доступна MongoDB

### 2.2 Встановлення залежностей
```bash
yarn install
```

### 2.3 env-файл
```bash
cp .env.example .env
```

Для локального запуску переконайтеся, що:
- `MONGO_URI` вказує на доступну MongoDB (наприклад `mongodb://localhost:27017/task_manager`)
- `JWT_SECRET` заповнений

### 2.4 Запуск у dev режимі
```bash
yarn start:dev
```

### 2.5 Продакшн-збірка локально
```bash
yarn build
yarn start:prod
```

---

## 3) Тестування (Jest)

Unit-тести:
```bash
yarn test
```

E2E-тести:
```bash
yarn test:e2e
```

Coverage:
```bash
yarn test:cov
```

---

## 4) Примітки
- `PORT` у контейнері API зафіксовано як `3000`, зовнішній порт задається через `.env` (`PORT=...`).
- Для production краще використовувати керовану MongoDB та секрети з vault/secret manager.