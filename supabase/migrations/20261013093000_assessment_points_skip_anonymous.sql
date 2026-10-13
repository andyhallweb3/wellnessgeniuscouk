-- Only award assessment points to signed-in users. Anonymous completions
-- (user_id IS NULL) previously failed because points_ledger.user_id is NOT NULL.
CREATE OR REPLACE FUNCTION public.on_assessment_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    PERFORM public.award_points(
      NEW.user_id,
      100,
      'assessment_completed',
      'Completed the AI Readiness Assessment'
    );
  END IF;
  RETURN NEW;
END;
$function$;
