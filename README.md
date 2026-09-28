# Blog API

API REST para un blog, construida con TypeScript, Express y PostgreSQL, siguiendo principios de Clean Architecture.

## Características

- Autenticación JWT con refresh tokens
- CRUD completo de posts (draft/published)
- Sistema de comentarios
- Validación de datos con Zod
- Manejo de errores centralizado
- Tests unitarios con Vitest
- Seguridad: helmet, CORS, rate limiting

## Requisitos

- Node.js >= 20
- PostgreSQL 16+

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd blog-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Levantar la base de datos
docker compose up -d

# Ejecutar migraciones (manualmente o con tu herramienta preferida)
psql $DATABASE_URL -f src/infrastructure/database/migrations/001-create-users.sql
psql $DATABASE_URL -f src/infrastructure/database/migrations/002-create-posts.sql
psql $DATABASE_URL -f src/infrastructure/database/migrations/003-create-comments.sql

# Iniciar en modo desarrollo
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo con hot-reload |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Inicia el servidor en modo producción |
| `npm test` | Ejecuta los tests unitarios |
| `npm run test:watch` | Ejecuta los tests en modo watch |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formato del código |

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NODE_ENV` | Entorno (development, test, production) | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | - |
| `JWT_SECRET` | Clave secreta para JWT (mínimo 32 caracteres) | - |
| `JWT_EXPIRES_IN` | Expiración del token (15m, 1h, 1d, 7d) | `1d` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |

## Endpoints

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar nuevo usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |

### Posts

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/posts` | No | Listar posts publicados |
| GET | `/api/posts/:slug` | No | Obtener post por slug |
| POST | `/api/posts` | Sí | Crear nuevo post |
| PATCH | `/api/posts/:id` | Sí | Actualizar post (solo autor) |
| DELETE | `/api/posts/:id` | Sí | Eliminar post (solo autor) |

### Comentarios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/comments/posts/:postId` | No | Listar comentarios de un post |
| POST | `/api/comments/posts/:postId` | Sí | Crear comentario |
| DELETE | `/api/comments/:id` | Sí | Eliminar comentario (solo autor) |

### Health

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | No | Estado de la API |

## Ejemplos de Uso

### Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Crear post

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Mi primer post",
    "content": "Contenido del post",
    "status": "published"
  }'
```

### Listar posts

```bash
curl http://localhost:3000/api/posts
```

## Arquitectura

```
src/
├── domain/           → Entidades y contratos (interfaces)
├── application/      → Use cases y DTOs
├── infrastructure/   → Implementaciones (PostgreSQL, bcrypt, JWT)
├── interfaces/       → Controladores, rutas, middlewares
├── shared/           → Utilidades, errores, tipos
└── config/           → Configuración
```

## Licencia

MIT
