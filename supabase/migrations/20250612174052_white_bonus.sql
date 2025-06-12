/*
  # Fix User and Comments Schema

  1. Schema Changes
    - Drop existing foreign key constraint that references auth.users
    - Update user table to work independently 
    - Fix comments table foreign key to reference the custom user table
    - Add proper RLS policies

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Allow users to manage their own data

  3. Data Integrity
    - Ensure proper relationships between users and comments
    - Add default values where appropriate
*/

-- First, drop the problematic foreign key constraint
ALTER TABLE comments DROP CONSTRAINT IF EXISTS "Comments_user_id_fkey";
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "User_id_fkey";

-- Update the user table structure
ALTER TABLE "user" ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enable RLS on user table
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Create policies for user table
CREATE POLICY "Users can read own data"
  ON "user"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own data"
  ON "user"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON "user"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Update comments table to properly reference user table
ALTER TABLE comments 
  ADD CONSTRAINT "comments_user_id_fkey" 
  FOREIGN KEY (user_id) 
  REFERENCES "user"(id) 
  ON UPDATE CASCADE 
  ON DELETE SET NULL;

-- Update comments policies to work with the new schema
DROP POLICY IF EXISTS "comment insert policy" ON comments;
DROP POLICY IF EXISTS "comment select policy" ON comments;

CREATE POLICY "Users can insert comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read all comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update any comment"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete any comment"
  ON comments
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."user" (id, email, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create the vulnerable search function for SQL injection testing
CREATE OR REPLACE FUNCTION search_comments(search_term text)
RETURNS TABLE(
  id uuid,
  content text,
  created_at timestamptz,
  user_id uuid,
  username text
) AS $$
BEGIN
  -- VULNERABILITY: This function is intentionally vulnerable to SQL injection
  -- In a real application, you should NEVER do this
  RETURN QUERY EXECUTE format('
    SELECT c.id, c.content, c.created_at, c.user_id, u.username
    FROM comments c
    LEFT JOIN "user" u ON c.user_id = u.id
    WHERE c.content ILIKE ''%%%s%%''
    ORDER BY c.created_at DESC
  ', search_term);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;