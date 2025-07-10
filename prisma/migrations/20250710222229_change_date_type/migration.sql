/*
  Warnings:

  - You are about to alter the column `date` on the `Filme` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
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
    "date" DATETIME,
    "thumbnail" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "showable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Filme" ("agencia", "categoria", "cliente", "createdAt", "creditos", "date", "diretor", "id", "nome", "produtoraContratante", "showable", "slug", "thumbnail", "updatedAt", "video_url") SELECT "agencia", "categoria", "cliente", "createdAt", "creditos", "date", "diretor", "id", "nome", "produtoraContratante", "showable", "slug", "thumbnail", "updatedAt", "video_url" FROM "Filme";
DROP TABLE "Filme";
ALTER TABLE "new_Filme" RENAME TO "Filme";
CREATE UNIQUE INDEX "Filme_slug_key" ON "Filme"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
