-- Ad slot scheduling + click tracking
ALTER TABLE ad_slots
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS click_count int NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_ad_click(p_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_href text;
BEGIN
  UPDATE ad_slots
  SET click_count = click_count + 1
  WHERE id = p_id
    AND status = 'published'
    AND href IS NOT NULL
    AND trim(href) <> ''
  RETURNING href INTO v_href;

  RETURN v_href;
END;
$$;
