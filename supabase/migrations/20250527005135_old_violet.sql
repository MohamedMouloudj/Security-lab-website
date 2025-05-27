/*
  # Initial schema setup for security testing

  1. New Tables
    - `users` table for extended profile information
      - `id` (uuid, references auth.users)
      - `username` (varchar)
      - `email` (varchar)
      - `phone` (varchar, optional)
      - `created_at` (timestamptz)
    - `comments` table with intentional vulnerabilities
      - `id` (uuid)
      - `user_id` (uuid, references users)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Basic policies for read/write access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar NOT NULL,
  email varchar NOT NULL UNIQUE,
  phone varchar DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

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

-- Create policies
CREATE POLICY "Allow public read access to users"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow public read access to comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);