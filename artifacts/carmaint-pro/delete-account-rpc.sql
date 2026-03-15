-- ============================================
-- CarMaint Pro - Account Deletion RPC
-- ============================================

-- This function allows a user to delete their own account.
-- It deletes the user from the public.users table (which should cascade to cars, reports, etc.) 
-- AND deletes the user from the auth.users table.
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run as superuser to bypass RLS and access auth schema
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the ID of the user executing the function
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Delete from public tables (if ON DELETE CASCADE is set, this will clean up cars/reports)
  -- Otherwise, we might need to manually delete them. Let's assume cascade is set up for most.
  DELETE FROM public.users WHERE id = v_user_id::text;
  
  -- 2. Delete from auth.users
  DELETE FROM auth.users WHERE id = v_user_id;

END;
$$;
