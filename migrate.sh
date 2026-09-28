#!/bin/bash
DATABASE_URL="postgresql://neondb_owner:npg_0cJTOBla7pNV@ep-aged-credit-b4izekct-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

echo "Ejecutando migraciones..."

psql "$DATABASE_URL" -f src/infrastructure/database/migrations/001-create-users.sql
psql "$DATABASE_URL" -f src/infrastructure/database/migrations/002-create-posts.sql
psql "$DATABASE_URL" -f src/infrastructure/database/migrations/003-create-comments.sql
psql "$DATABASE_URL" -f src/infrastructure/database/migrations/004-add-fulltext-search.sql
psql "$DATABASE_URL" -f src/infrastructure/database/migrations/005-add-user-roles.sql
psql "$DATABASE_URL" -f src/infrastructure/database/migrations/006-create-refresh-tokens.sql
psql "$DATABASE_URL" -f src/infrastructure/database/migrations/007-add-post-image.sql

echo "Migraciones completadas!"
