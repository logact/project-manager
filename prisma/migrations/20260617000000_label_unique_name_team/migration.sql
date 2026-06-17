-- Deduplicate labels: keep the oldest label per (name, team_id) and remove the rest
DELETE FROM Label WHERE id NOT IN (
  SELECT MIN(id) FROM Label GROUP BY name, team_id
);

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_team_id_key" ON "Label"("name", "team_id");
