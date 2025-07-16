# Zerar o banco de dados Supabase e aplicá-lo com Prisma + seeding

## 1. Zerar tudo manualmente via Supabase SQL
Se quiser garantir que tudo foi limpo (incluindo políticas):

```sql
DROP TABLE IF EXISTS "Filme" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Contato" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
```
Você pode rodar isso no Supabase > SQL Editor.

## 2. Regenerar o banco com Prisma
No seu projeto, rode:

```bash
npx prisma migrate dev --name init
```
Isso vai:

- Gerar a pasta prisma/migrations/init

- Criar as tabelas no Supabase conforme o schema.prisma

- Marcar o migration como aplicado no _prisma_migrations

Caso atualizar o Prisma Client queira apagar e refazer sempre:
```bash
npx prisma migrate reset
```

## 3. Habilitar gen_random_uuid() para gerar id automaticamente
No Supabase > SQL Editor:

```sql
create extension if not exists "pgcrypto";
```


## 4. Configurar DEFAULT para id, createdAt e updatedAt
```sql
-- Filme
ALTER TABLE "Filme"
  ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "createdAt" SET DEFAULT now(),
  ALTER COLUMN "updatedAt" SET DEFAULT now();

-- User
ALTER TABLE "User"
  ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "createdAt" SET DEFAULT now();

-- Contato
ALTER TABLE "Contato"
  ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid,
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "createdAt" SET DEFAULT now();
```

## 5. Habilitar RLS e liberar políticas
```sql

-- Ativar RLS
ALTER TABLE "Filme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contato" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Políticas abertas
-- Filme
CREATE POLICY "Allow all on Filme" ON "Filme" FOR ALL USING (true) WITH CHECK (true);
-- User
CREATE POLICY "Allow all on User" ON "User" FOR ALL USING (true) WITH CHECK (true);
-- Contato
CREATE POLICY "Allow all on Contato" ON "Contato" FOR ALL USING (true) WITH CHECK (true);
-- Migrations
CREATE POLICY "Allow all on _prisma_migrations" ON "_prisma_migrations" FOR ALL USING (true) WITH CHECK (true);
```


### 6. Conceder permissões para anon role
```sql
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON "Filme" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "User" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Contato" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON "_prisma_migrations" TO anon;
```

### 7. Rodar o seeder (manualmente ou via Prisma)
#### Opção A – rodar manualmente
```bash
node prisma/seed.js
```


#### Opção B – rodar junto com o reset
Configure no seu ```package.json```:

```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```
E rode:

```bash
npx prisma migrate reset
```