/*
  Warnings:

  - Added the required column `video_url` to the `Filme` table without a default value. This is not possible if the table is not empty.
  - Made the column `thumbnail` on table `Filme` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Contato" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "funcao" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Filme" (
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
    "thumbnail" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "showable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Filme" ("agencia", "categoria", "cliente", "createdAt", "creditos", "date", "diretor", "id", "nome", "produtoraContratante", "showable", "slug", "thumbnail", "updatedAt") SELECT "agencia", "categoria", "cliente", "createdAt", "creditos", "date", "diretor", "id", "nome", "produtoraContratante", "showable", "slug", "thumbnail", "updatedAt" FROM "Filme";
DROP TABLE "Filme";
ALTER TABLE "new_Filme" RENAME TO "Filme";
CREATE UNIQUE INDEX "Filme_slug_key" ON "Filme"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
