-- ============================================
-- AUTO-CREATE PIPELINE ENTRIES
-- Migration: 31
-- Description: Automatically create progression_pipeline entry when reservation is created
-- ============================================

-- Function to auto-create pipeline entry
CREATE OR REPLACE FUNCTION create_pipeline_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create pipeline if reservation status is CONFIRMED
  IF NEW.status = 'CONFIRMED' THEN
    -- Check if pipeline entry doesn't already exist
    IF NOT EXISTS (
      SELECT 1 FROM progression_pipeline
      WHERE reservation_id = NEW.id
    ) THEN
      -- Create pipeline entry with RESERVED stage
      INSERT INTO progression_pipeline (
        reservation_id,
        current_stage,
        stage_history
      ) VALUES (
        NEW.id,
        'RESERVED',
        jsonb_build_array(
          jsonb_build_object(
            'stage', 'RESERVED',
            'timestamp', NOW(),
            'changed_by', NEW.investor_id
          )
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on reservation INSERT
DROP TRIGGER IF EXISTS trigger_create_pipeline ON reservations;

CREATE TRIGGER trigger_create_pipeline
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION create_pipeline_entry();

-- Also trigger on UPDATE (in case status changes to CONFIRMED later)
DROP TRIGGER IF EXISTS trigger_create_pipeline_on_update ON reservations;

CREATE TRIGGER trigger_create_pipeline_on_update
  AFTER UPDATE OF status ON reservations
  FOR EACH ROW
  WHEN (NEW.status = 'CONFIRMED')
  EXECUTE FUNCTION create_pipeline_entry();

-- Add comment
COMMENT ON FUNCTION create_pipeline_entry() IS
  'Automatically creates a progression_pipeline entry when a reservation status is CONFIRMED.';
