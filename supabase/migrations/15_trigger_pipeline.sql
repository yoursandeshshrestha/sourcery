-- ============================================
-- TRIGGER: STAGE HISTORY TRACKER
-- Migration: 15
-- Description: Track pipeline stage changes in stage_history JSONB array
-- ============================================

CREATE OR REPLACE FUNCTION track_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    NEW.stage_history := NEW.stage_history || jsonb_build_object(
      'stage', NEW.current_stage,
      'timestamp', NOW(),
      'changed_by', auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_progression_stage
  BEFORE UPDATE ON progression_pipeline
  FOR EACH ROW EXECUTE FUNCTION track_stage_change();
