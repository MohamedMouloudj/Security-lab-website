/*
  # Fix Comments Insert Policy and User Creation

  1. Changes
    - Create trigger to automatically insert users into custom user table on auth signup
    - Update comments insert policy to be more permissive for educational purposes
    - Add function to handle new user creation from auth.users

  2. Security
    - Maintain RLS on both tables
    - Allow authenticated users to insert comments
    - Auto-create user records for new signups
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."user" (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a more permissive insert policy for comments (for educational purposes)
DROP POLICY IF EXISTS "Authorized users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also update the user insert policy to be more permissive
DROP POLICY IF EXISTS "Authorized users can insert own data" ON public."user";
CREATE POLICY "Authenticated users can insert own data"
  ON public."user"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update user select policy to be more permissive
DROP POLICY IF EXISTS "Authorized users can read own data" ON public."user";
CREATE POLICY "Authenticated users can read own data"
  ON public."user"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Update user update policy to be more permissive  
DROP POLICY IF EXISTS "Authorized users can update own data" ON public."user";
CREATE POLICY "Authenticated users can update own data"
  ON public."user"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);