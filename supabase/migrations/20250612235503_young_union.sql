/*
  # Restrict access to specific email addresses

  1. Security Enhancement
    - Create function to validate authorized emails
    - Add trigger to prevent unauthorized user registration
    - Update RLS policies to enforce email restrictions

  2. Authorized Emails
    - mouloudy6565@gmail.com
    - mouloudy656565@gmail.com
    - mouloudj.mohamed.04@gmail.com
*/

-- Create function to check if email is authorized
CREATE OR REPLACE FUNCTION is_authorized_email(email_address text)
RETURNS boolean AS $$
BEGIN
  RETURN email_address IN (
    'mouloudy6565@gmail.com',
    'mouloudy656565@gmail.com',
    'mouloudj.mohamed.04@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to check authorization
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if the email is authorized
  IF NOT is_authorized_email(NEW.email) THEN
    RAISE EXCEPTION 'Email address % is not authorized to access this application', NEW.email;
  END IF;

  INSERT INTO public."user" (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user policies to only allow authorized emails
DROP POLICY IF EXISTS "Users can read own data" ON "user";
DROP POLICY IF EXISTS "Users can insert own data" ON "user";
DROP POLICY IF EXISTS "Users can update own data" ON "user";

CREATE POLICY "Authorized users can read own data"
  ON "user"
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = id::text 
    AND is_authorized_email(email)
  );

CREATE POLICY "Authorized users can insert own data"
  ON "user"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = id::text 
    AND is_authorized_email(email)
  );

CREATE POLICY "Authorized users can update own data"
  ON "user"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = id::text 
    AND is_authorized_email(email)
  );

-- Update comment policies to only allow authorized users
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can read all comments" ON comments;
DROP POLICY IF EXISTS "Users can update any comment" ON comments;
DROP POLICY IF EXISTS "Users can delete any comment" ON comments;

CREATE POLICY "Authorized users can insert comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = user_id::text 
    AND EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND is_authorized_email(email)
    )
  );

CREATE POLICY "Authorized users can read all comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND is_authorized_email(email)
    )
  );

CREATE POLICY "Authorized users can update any comment"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND is_authorized_email(email)
    )
  );

CREATE POLICY "Authorized users can delete any comment"
  ON comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND is_authorized_email(email)
    )
  );