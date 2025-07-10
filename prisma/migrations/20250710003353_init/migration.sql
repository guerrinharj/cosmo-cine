-- CreateTable
CREATE TABLE "Filme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "diretor" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "produtoraContratante" TEXT,
    "agencia" TEXT,
    "creditos" JSONB,
    "slug" TEXT NOT NULL,
    "date" TEXT,
    "thumbnail" TEXT,
    "showable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Filme_slug_key" ON "Filme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
