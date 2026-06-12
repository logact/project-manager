/*
  Warnings:

  - You are about to alter the column `order` on the `Issue` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "state" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "assignee_id" TEXT,
    "project_id" TEXT,
    "cycle_id" TEXT,
    "team_id" TEXT NOT NULL,
    "label_ids" TEXT NOT NULL DEFAULT '[]',
    "order" BIGINT NOT NULL DEFAULT 0,
    "created_at" BIGINT NOT NULL,
    "updated_at" BIGINT NOT NULL,
    CONSTRAINT "Issue_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Issue_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Issue_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Issue_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Issue" ("assignee_id", "created_at", "cycle_id", "description", "id", "identifier", "label_ids", "order", "priority", "project_id", "state", "team_id", "title", "updated_at") SELECT "assignee_id", "created_at", "cycle_id", "description", "id", "identifier", "label_ids", "order", "priority", "project_id", "state", "team_id", "title", "updated_at" FROM "Issue";
DROP TABLE "Issue";
ALTER TABLE "new_Issue" RENAME TO "Issue";
CREATE UNIQUE INDEX "Issue_identifier_key" ON "Issue"("identifier");
CREATE INDEX "Issue_team_id_idx" ON "Issue"("team_id");
CREATE INDEX "Issue_team_id_state_order_idx" ON "Issue"("team_id", "state", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
