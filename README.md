# Fopapenka MVP

Aplicación web de pronósticos de fútbol con soporte multi-penca.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express 5 + Sequelize ORM
- **DB**: PostgreSQL 16
- **Tiempo real**: Socket.io
- **Tests**: Serenity BDD + WebDriverIO + Screenplay pattern

## Inicio rápido

### Con Docker (recomendado)

```bash
cp backend/.env.example backend/.env
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- DB: localhost:5432

### Sin Docker

```bash
# Backend
cd backend
cp .env.example .env   # ajustar credenciales de DB
npm install
npm run db:migrate
npm run db:seed
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

## Migraciones

```bash
cd backend
npm run db:migrate        # correr migraciones pendientes
npm run db:migrate:undo   # revertir la última
npm run db:seed           # datos de ejemplo
npm run db:reset          # todo desde cero
```

## Tests

### Tests Unitarios (Backend)

```bash
cd backend
npm test              # ejecutar todos los tests unitarios
npm run test:watch    # modo watch para desarrollo
```

Los tests unitarios utilizan Mocha + Chai + Sinon + Supertest y cubren:
- Controladores de autenticación (getMyPencas, logout)
- Controladores de pencas (regenerateCode)
- Controladores de fixtures (getCalendar)

### Tests E2E (Serenity BDD)

```bash
cd tests
npm install
npm run wdio
```

Los tests E2E utilizan Serenity BDD + WebDriverIO con el patrón Screenplay y cubren:
- Registro y autenticación
- Acceso a múltiples pencas
- Regeneración de códigos de invitación
- Visualización del calendario
- Cierre de sesión
- Predicciones y scoring
- Chat en tiempo real

## Sistema de puntuación

| Resultado | Puntos |
|---|---|
| Marcador exacto | 3 |
| Resultado correcto (diferente marcador) | 1 |
| Sin acierto | 0 |

## Acceso multi-penca

1. El admin crea la penca y obtiene el código de invitación.
2. Los jugadores ingresan el código, eligen su apodo y usan su cédula como contraseña.
3. Cada penca es completamente independiente (torneos, ranking, chat).
