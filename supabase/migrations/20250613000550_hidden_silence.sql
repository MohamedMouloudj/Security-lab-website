/*
  # Fix User Creation Trigger

  1. Problem
    - Users registering through Supabase Auth are not being added to the public.user table
    - This causes foreign key constraint violations when trying to insert comments
    - The comments.user_id references user.id but the user record doesn't exist

  2. Solution
    - Create/update the handle_new_user function to properly insert users into public.user table
    - Ensure the trigger is properly set up on auth.users table
    - Handle both username from metadata and email fallback

  3. Security
    - Function runs with SECURITY DEFINER to access auth schema
    - Proper error handling to prevent trigger failures
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_username TEXT;
BEGIN
  -- Get username from metadata, fallback to email prefix if not provided
  user_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert the new user into public.user table
  INSERT INTO public."user" (id, email, username, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_username,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username;
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to handle new comments (mentioned in schema)
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used for comment-related triggers if needed
  -- For now, just return the new record
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure existing auth users have corresponding user records
-- This handles cases where users were created before the trigger was properly set up
INSERT INTO public."user" (id, email, username, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'username',
    split_part(au.email, '@', 1)
  ) as username,
  au.created_at
FROM auth.users au
LEFT JOIN public."user" pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;