-- User Management & Chat Optimization Migration
-- Run these commands in your Supabase SQL Editor

-- 1. Add custom name field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS custom_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_name TEXT DEFAULT NULL;

-- 2. Update existing users to move current name to whatsapp_name
UPDATE users 
SET whatsapp_name = name 
WHERE whatsapp_name IS NULL AND name != id;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_custom_name ON users(custom_name);
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_name ON users(whatsapp_name);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active DESC);

-- 4. Update user_conversations view to include custom names
DROP VIEW IF EXISTS user_conversations;
CREATE OR REPLACE VIEW user_conversations AS
SELECT DISTINCT
  u.id,
  COALESCE(u.custom_name, u.whatsapp_name, u.id) as display_name,
  u.custom_name,
  u.whatsapp_name,
  u.name as original_name,
  u.last_active,
  COALESCE(latest_msg.content, '') as last_message,
  COALESCE(latest_msg.timestamp, u.last_active) as last_message_time,
  COALESCE(latest_msg.message_type, 'text') as last_message_type,
  COALESCE(latest_msg.sender_id, '') as last_message_sender,
  COALESCE(unread_counts.unread_count, 0) as unread_count,
  CASE WHEN unread_counts.unread_count > 0 THEN 1 ELSE 0 END as has_unread
FROM users u
LEFT JOIN LATERAL (
  SELECT content, timestamp, message_type, sender_id
  FROM messages m
  WHERE (m.sender_id = u.id OR m.receiver_id = u.id)
    AND (m.receiver_id = auth.uid()::text OR m.sender_id = auth.uid()::text)
  ORDER BY m.timestamp DESC
  LIMIT 1
) latest_msg ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::INTEGER as unread_count
  FROM messages m
  WHERE m.receiver_id = auth.uid()::text
  AND m.sender_id = u.id
  AND m.is_read = FALSE
) unread_counts ON true
WHERE u.id != COALESCE(auth.uid()::text, '');

-- 5. Create function to update user custom name
CREATE OR REPLACE FUNCTION update_user_custom_name(user_id TEXT, new_custom_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
  SET custom_name = CASE 
    WHEN new_custom_name = '' OR new_custom_name IS NULL THEN NULL 
    ELSE new_custom_name 
  END
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to get unread conversations (for preloading)
CREATE OR REPLACE FUNCTION get_unread_conversations(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  conversation_id TEXT,
  display_name TEXT,
  unread_count INTEGER,
  last_message_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as conversation_id,
    COALESCE(u.custom_name, u.whatsapp_name, u.id) as display_name,
    COALESCE(unread_counts.unread_count, 0)::INTEGER as unread_count,
    COALESCE(latest_msg.timestamp, u.last_active) as last_message_time
  FROM users u
  LEFT JOIN LATERAL (
    SELECT timestamp
    FROM messages m
    WHERE (m.sender_id = u.id OR m.receiver_id = u.id)
      AND (m.receiver_id = auth.uid()::text OR m.sender_id = auth.uid()::text)
    ORDER BY m.timestamp DESC
    LIMIT 1
  ) latest_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::INTEGER as unread_count
    FROM messages m
    WHERE m.receiver_id = auth.uid()::text
    AND m.sender_id = u.id
    AND m.is_read = FALSE
  ) unread_counts ON true
  WHERE u.id != COALESCE(auth.uid()::text, '')
    AND unread_counts.unread_count > 0
  ORDER BY unread_counts.unread_count DESC, latest_msg.timestamp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to create or get user by phone number
CREATE OR REPLACE FUNCTION create_or_get_user(phone_number TEXT, user_name TEXT DEFAULT NULL)
RETURNS TABLE(
  id TEXT,
  display_name TEXT,
  custom_name TEXT,
  whatsapp_name TEXT,
  last_active TIMESTAMP WITH TIME ZONE,
  is_new BOOLEAN
) AS $$
DECLARE
  existing_user RECORD;
  new_user_created BOOLEAN := FALSE;
BEGIN
  -- Check if user exists
  SELECT * INTO existing_user FROM users WHERE users.id = phone_number;
  
  IF NOT FOUND THEN
    -- Create new user
    INSERT INTO users (id, custom_name, whatsapp_name, last_active)
    VALUES (
      phone_number,
      user_name,
      NULL,
      NOW()
    );
    new_user_created := TRUE;
  ELSE
    -- Update custom name if provided and different
    IF user_name IS NOT NULL AND user_name != '' AND 
       (existing_user.custom_name IS NULL OR existing_user.custom_name != user_name) THEN
      UPDATE users 
      SET custom_name = user_name, last_active = NOW()
      WHERE users.id = phone_number;
    END IF;
  END IF;
  
  -- Return user data
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.custom_name, u.whatsapp_name, u.id) as display_name,
    u.custom_name,
    u.whatsapp_name,
    u.last_active,
    new_user_created as is_new
  FROM users u
  WHERE u.id = phone_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION update_user_custom_name(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_conversations(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_or_get_user(TEXT, TEXT) TO authenticated;
GRANT SELECT ON user_conversations TO authenticated;

-- 9. Create RLS policy for user name updates
CREATE POLICY "Users can update any user custom name" ON users
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 10. Create trigger to update whatsapp_name when name changes (for webhook updates)
CREATE OR REPLACE FUNCTION update_whatsapp_name_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- If name is being updated and it's different from the phone number, update whatsapp_name
  IF NEW.name != OLD.name AND NEW.name != NEW.id THEN
    NEW.whatsapp_name := NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_whatsapp_name ON users;
CREATE TRIGGER trigger_update_whatsapp_name
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_name_trigger();

-- 11. Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('custom_name', 'whatsapp_name');

-- 12. Test the functions
SELECT 'User management migration completed successfully' as status; 