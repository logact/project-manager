-- Rename duplicate labels: keep the original, append (1), (2), ... to duplicates
WITH ranked AS (
  SELECT id, name, team_id,
         ROW_NUMBER() OVER (PARTITION BY name, team_id ORDER BY created_at, id) AS rn
  FROM Label
)
UPDATE Label
SET name = name || ' (' || (ranked.rn - 1) || ')'
FROM ranked
WHERE Label.id = ranked.id
  AND ranked.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_team_id_key" ON "Label"("name", "team_id");
