/*
  # Initial schema setup

  1. New Tables
    - `users` - Extended user profile information
      - `id` (uuid, primary key, references auth.users)
      - `username` (varchar)
      - `created_at` (timestamptz)
    - `comments` - User comments with intentional vulnerabilities
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Functions
    - `search_comments` - Vulnerable search function for SQL injection testing
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username varchar NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create vulnerable search function
CREATE OR REPLACE FUNCTION search_comments(search_term text)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  username varchar
) AS $$
BEGIN
  -- WARNING: This is intentionally vulnerable to SQL injection
  RETURN QUERY EXECUTE 
    'SELECT c.id, c.content, c.created_at, u.username 
     FROM comments c 
     JOIN users u ON c.user_id = u.id 
     WHERE c.content LIKE ''%' || search_term || '%''';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);