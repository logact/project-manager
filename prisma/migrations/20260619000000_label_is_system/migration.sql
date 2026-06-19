-- AlterTable
ALTER TABLE "Label" ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT false;

-- Mark existing Bug/Feature/Refactor labels as system
UPDATE "Label" SET "is_system" = true WHERE "name" IN ('Bug', 'Feature', 'Refactor');

-- Create system labels only if they don't already exist for the team
INSERT INTO "Label" ("id", "name", "color", "is_system", "team_id", "created_at")
SELECT 'system-bug', 'Bug', '#d13b3b', true, "id", CAST(strftime('%s', 'now') * 1000 AS INTEGER)
FROM "Team" WHERE "name" = 'Engineering' AND NOT EXISTS (
  SELECT 1 FROM "Label" WHERE "name" = 'Bug' AND "team_id" = "Team"."id"
) LIMIT 1;

INSERT INTO "Label" ("id", "name", "color", "is_system", "team_id", "created_at")
SELECT 'system-feature', 'Feature', '#4da35a', true, "id", CAST(strftime('%s', 'now') * 1000 AS INTEGER)
FROM "Team" WHERE "name" = 'Engineering' AND NOT EXISTS (
  SELECT 1 FROM "Label" WHERE "name" = 'Feature' AND "team_id" = "Team"."id"
) LIMIT 1;

INSERT INTO "Label" ("id", "name", "color", "is_system", "team_id", "created_at")
SELECT 'system-refactor', 'Refactor', '#8d6e63', true, "id", CAST(strftime('%s', 'now') * 1000 AS INTEGER)
FROM "Team" WHERE "name" = 'Engineering' AND NOT EXISTS (
  SELECT 1 FROM "Label" WHERE "name" = 'Refactor' AND "team_id" = "Team"."id"
) LIMIT 1;
