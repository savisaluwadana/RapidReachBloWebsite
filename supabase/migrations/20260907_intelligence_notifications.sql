ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'intelligence_alert';

CREATE UNIQUE INDEX IF NOT EXISTS idx_global_signal_source_external
ON intelligence_signals(source_provider, external_id)
WHERE organization_id IS NULL;
