-- Soft-archive enrollment leads instead of deleting them

ALTER TABLE enrollment_leads DROP CONSTRAINT IF EXISTS enrollment_leads_status_check;
ALTER TABLE enrollment_leads ADD CONSTRAINT enrollment_leads_status_check
  CHECK (status IN ('NEW', 'CONTACTED', 'ENROLLED', 'NOT_PROCEEDING', 'ARCHIVED'));
