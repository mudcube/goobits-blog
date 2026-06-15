ALTER TABLE calendar_event_participants ADD COLUMN confirmation_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cep_confirmation_id
  ON calendar_event_participants(confirmation_id)
  WHERE confirmation_id IS NOT NULL;
