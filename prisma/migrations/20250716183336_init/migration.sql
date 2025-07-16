-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('Publicidade', 'Clipe', 'Conteudo');

-- CreateTable
CREATE TABLE "Filme" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "diretor" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "produtoraContratante" TEXT,
    "agencia" TEXT,
    "creditos" TEXT NOT NULL,
    "is_service" BOOLEAN NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "thumbnail" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "showable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filme_slug_key" ON "Filme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
