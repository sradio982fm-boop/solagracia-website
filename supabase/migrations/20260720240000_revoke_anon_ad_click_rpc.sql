-- Ad click RPC is only meant to be called via service-role API route.
-- Keep SECURITY DEFINER but revoke direct PostgREST access for anon/authenticated.

REVOKE ALL ON FUNCTION public.increment_ad_click(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_ad_click(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.increment_ad_click(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ad_click(uuid) TO service_role;
