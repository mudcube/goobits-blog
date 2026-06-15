-- Deduplicate any pre-existing rows that share a job_id, keeping the earliest copy.
DELETE FROM calendar_sync_dead_letters
WHERE id NOT IN (
  SELECT MIN(id) FROM calendar_sync_dead_letters GROUP BY job_id
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_sync_dead_letters_job_id
  ON calendar_sync_dead_letters(job_id);
