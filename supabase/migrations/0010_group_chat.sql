-- Group chat: rooms, members, messages, Messenger-style mute/kick/block

CREATE TYPE chat_room_visibility AS ENUM ('OPEN', 'INVITE', 'STAFF', 'PARENTS_STAFF');
CREATE TYPE chat_member_role AS ENUM ('admin', 'member');
CREATE TYPE chat_member_status AS ENUM ('active', 'muted', 'removed', 'blocked');
CREATE TYPE chat_message_kind AS ENUM ('text', 'system');
CREATE TYPE chat_moderation_action AS ENUM (
  'create_room',
  'archive_room',
  'add',
  'mute',
  'unmute',
  'kick',
  'block',
  'unblock',
  'delete_message'
);

ALTER TABLE admin_permissions
  ADD COLUMN IF NOT EXISTS manage_chat BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION has_permission(flag TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  p_role user_role;
  perms admin_permissions%ROWTYPE;
BEGIN
  SELECT role INTO p_role FROM profiles WHERE id = auth.uid() AND is_active = true;
  IF p_role IS NULL THEN RETURN false; END IF;
  IF p_role = 'SUPER_ADMIN' THEN RETURN true; END IF;
  IF p_role NOT IN ('ADMIN', 'COACH') THEN RETURN false; END IF;

  SELECT * INTO perms FROM admin_permissions WHERE profile_id = auth.uid() AND is_active = true;
  IF NOT FOUND THEN RETURN false; END IF;
  IF perms.full_admin_access THEN RETURN true; END IF;

  RETURN CASE flag
    WHEN 'view_students' THEN perms.view_students
    WHEN 'create_edit_students' THEN perms.create_edit_students
    WHEN 'view_payments' THEN perms.view_payments
    WHEN 'create_edit_payments' THEN perms.create_edit_payments
    WHEN 'view_inquiries' THEN perms.view_inquiries
    WHEN 'manage_inquiries' THEN perms.manage_inquiries
    WHEN 'manage_enrollments' THEN perms.manage_enrollments
    WHEN 'manage_media' THEN perms.manage_media
    WHEN 'manage_content' THEN perms.manage_content
    WHEN 'manage_programs' THEN perms.manage_programs
    WHEN 'manage_coaches' THEN perms.manage_coaches
    WHEN 'manage_pricing' THEN perms.manage_pricing
    WHEN 'manage_schedule' THEN perms.manage_schedule
    WHEN 'manage_staff' THEN perms.manage_staff
    WHEN 'manage_chat' THEN perms.manage_chat
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION can_manage_chat()
RETURNS BOOLEAN AS $$
  SELECT is_super_admin() OR has_permission('manage_chat');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION profile_display_name(p_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
    NULLIF(email, ''),
    'Member'
  )
  FROM profiles
  WHERE id = p_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  visibility chat_room_visibility NOT NULL DEFAULT 'INVITE',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role chat_member_role NOT NULL DEFAULT 'member',
  status chat_member_status NOT NULL DEFAULT 'active',
  muted_until TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  removed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, profile_id)
);

CREATE TRIGGER chat_members_updated_at
  BEFORE UPDATE ON chat_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_chat_members_profile ON chat_members(profile_id);
CREATE INDEX idx_chat_members_room_status ON chat_members(room_id, status);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  kind chat_message_kind NOT NULL DEFAULT 'text',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);

CREATE TABLE chat_moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action chat_moderation_action NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_moderation_room ON chat_moderation_events(room_id, created_at DESC);

CREATE OR REPLACE FUNCTION is_chat_participant(p_room_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_members
    WHERE room_id = p_room_id
      AND profile_id = auth.uid()
      AND status IN ('active', 'muted')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_effectively_muted(p_status chat_member_status, p_muted_until TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
  SELECT p_status = 'muted' AND (p_muted_until IS NULL OR p_muted_until > NOW());
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION can_send_chat(p_room_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_members
    WHERE room_id = p_room_id
      AND profile_id = auth.uid()
      AND status IN ('active', 'muted')
      AND NOT is_effectively_muted(status, muted_until)
  )
  AND EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE id = p_room_id AND is_archived = false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION eligible_for_chat_room(p_visibility chat_room_visibility, p_profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = p_profile_id
      AND p.is_active = true
      AND (
        (p_visibility = 'OPEN')
        OR (p_visibility = 'STAFF' AND p.role IN ('SUPER_ADMIN', 'ADMIN', 'COACH'))
        OR (p_visibility = 'PARENTS_STAFF' AND p.role IN ('SUPER_ADMIN', 'ADMIN', 'COACH', 'PARENT'))
        OR (p_visibility = 'INVITE' AND false)
      )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION insert_system_message(p_room_id UUID, p_body TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_messages (room_id, sender_id, body, kind)
  VALUES (p_room_id, NULL, p_body, 'system');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION log_chat_moderation(
  p_room_id UUID,
  p_action chat_moderation_action,
  p_target UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_moderation_events (room_id, actor_id, target_id, action, metadata)
  VALUES (p_room_id, auth.uid(), p_target, p_action, COALESCE(p_metadata, '{}'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION sync_my_chat_memberships()
RETURNS INT AS $$
DECLARE
  inserted INT := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  INSERT INTO chat_members (room_id, profile_id, role, status)
  SELECT r.id, auth.uid(), 'member', 'active'
  FROM chat_rooms r
  WHERE r.is_archived = false
    AND r.visibility IN ('OPEN', 'STAFF', 'PARENTS_STAFF')
    AND eligible_for_chat_room(r.visibility, auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM chat_members m
      WHERE m.room_id = r.id AND m.profile_id = auth.uid()
    );

  GET DIAGNOSTICS inserted = ROW_COUNT;
  RETURN inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION create_chat_room(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_visibility chat_room_visibility DEFAULT 'INVITE'
)
RETURNS chat_rooms AS $$
DECLARE
  room chat_rooms;
  room_name TEXT := TRIM(p_name);
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to create chat rooms';
  END IF;
  IF room_name IS NULL OR char_length(room_name) < 1 THEN
    RAISE EXCEPTION 'Room name is required';
  END IF;

  INSERT INTO chat_rooms (name, description, visibility, created_by)
  VALUES (room_name, NULLIF(TRIM(COALESCE(p_description, '')), ''), p_visibility, auth.uid())
  RETURNING * INTO room;

  INSERT INTO chat_members (room_id, profile_id, role, status)
  VALUES (room.id, auth.uid(), 'admin', 'active');

  PERFORM insert_system_message(room.id, profile_display_name(auth.uid()) || ' created this group');
  PERFORM log_chat_moderation(room.id, 'create_room', NULL, jsonb_build_object('visibility', p_visibility));

  RETURN room;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION archive_chat_room(p_room_id UUID, p_archived BOOLEAN DEFAULT true)
RETURNS VOID AS $$
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to archive chat rooms';
  END IF;
  UPDATE chat_rooms SET is_archived = p_archived WHERE id = p_room_id;
  PERFORM log_chat_moderation(p_room_id, 'archive_room', NULL, jsonb_build_object('archived', p_archived));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION add_chat_member(p_room_id UUID, p_profile_id UUID)
RETURNS VOID AS $$
DECLARE
  existing chat_members;
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to add members';
  END IF;

  SELECT * INTO existing FROM chat_members WHERE room_id = p_room_id AND profile_id = p_profile_id;
  IF FOUND THEN
    IF existing.status = 'blocked' THEN
      RAISE EXCEPTION 'This person is blocked from this chat. Unblock them first.';
    END IF;
    UPDATE chat_members
    SET status = 'active',
        role = existing.role,
        muted_until = NULL,
        removed_at = NULL,
        removed_by = NULL
    WHERE id = existing.id;
  ELSE
    INSERT INTO chat_members (room_id, profile_id, role, status)
    VALUES (p_room_id, p_profile_id, 'member', 'active');
  END IF;

  PERFORM insert_system_message(p_room_id, profile_display_name(p_profile_id) || ' was added to the group');
  PERFORM log_chat_moderation(p_room_id, 'add', p_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION mute_chat_member(
  p_room_id UUID,
  p_profile_id UUID,
  p_muted_until TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to mute members';
  END IF;
  IF p_profile_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot mute yourself';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM chat_members
    WHERE room_id = p_room_id AND profile_id = p_profile_id AND status IN ('active', 'muted')
  ) THEN
    RAISE EXCEPTION 'That person is not in this chat';
  END IF;

  UPDATE chat_members
  SET status = 'muted', muted_until = p_muted_until
  WHERE room_id = p_room_id AND profile_id = p_profile_id;

  PERFORM insert_system_message(
    p_room_id,
    profile_display_name(p_profile_id) || CASE
      WHEN p_muted_until IS NULL THEN ' was muted'
      ELSE ' was muted until ' || to_char(p_muted_until AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC'
    END
  );
  PERFORM log_chat_moderation(
    p_room_id,
    'mute',
    p_profile_id,
    jsonb_build_object('muted_until', p_muted_until)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION unmute_chat_member(p_room_id UUID, p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to unmute members';
  END IF;

  UPDATE chat_members
  SET status = 'active', muted_until = NULL
  WHERE room_id = p_room_id AND profile_id = p_profile_id AND status = 'muted';

  PERFORM insert_system_message(p_room_id, profile_display_name(p_profile_id) || ' was unmuted');
  PERFORM log_chat_moderation(p_room_id, 'unmute', p_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION kick_chat_member(p_room_id UUID, p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to remove members';
  END IF;
  IF p_profile_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot remove yourself';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM chat_members
    WHERE room_id = p_room_id AND profile_id = p_profile_id AND status IN ('active', 'muted')
  ) THEN
    RAISE EXCEPTION 'That person is not in this chat';
  END IF;

  UPDATE chat_members
  SET status = 'removed',
      muted_until = NULL,
      removed_at = NOW(),
      removed_by = auth.uid()
  WHERE room_id = p_room_id AND profile_id = p_profile_id;

  PERFORM insert_system_message(p_room_id, profile_display_name(p_profile_id) || ' was removed from the group');
  PERFORM log_chat_moderation(p_room_id, 'kick', p_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION block_chat_member(p_room_id UUID, p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to block members';
  END IF;
  IF p_profile_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot block yourself';
  END IF;

  INSERT INTO chat_members (room_id, profile_id, role, status, removed_at, removed_by)
  VALUES (p_room_id, p_profile_id, 'member', 'blocked', NOW(), auth.uid())
  ON CONFLICT (room_id, profile_id) DO UPDATE
    SET status = 'blocked',
        muted_until = NULL,
        removed_at = NOW(),
        removed_by = auth.uid();

  PERFORM insert_system_message(p_room_id, profile_display_name(p_profile_id) || ' was blocked from this chat');
  PERFORM log_chat_moderation(p_room_id, 'block', p_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION unblock_chat_member(p_room_id UUID, p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to unblock members';
  END IF;

  UPDATE chat_members
  SET status = 'active',
      muted_until = NULL,
      removed_at = NULL,
      removed_by = NULL
  WHERE room_id = p_room_id AND profile_id = p_profile_id AND status = 'blocked';

  PERFORM insert_system_message(p_room_id, profile_display_name(p_profile_id) || ' was unblocked and added back');
  PERFORM log_chat_moderation(p_room_id, 'unblock', p_profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION delete_chat_message(p_message_id UUID)
RETURNS VOID AS $$
DECLARE
  msg chat_messages;
BEGIN
  SELECT * INTO msg FROM chat_messages WHERE id = p_message_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found';
  END IF;
  IF msg.deleted_at IS NOT NULL THEN
    RETURN;
  END IF;
  IF msg.sender_id <> auth.uid() AND NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to delete this message';
  END IF;
  IF msg.kind = 'system' AND NOT can_manage_chat() THEN
    RAISE EXCEPTION 'Not allowed to delete this message';
  END IF;

  UPDATE chat_messages SET deleted_at = NOW() WHERE id = p_message_id;
  PERFORM log_chat_moderation(msg.room_id, 'delete_message', msg.sender_id, jsonb_build_object('message_id', p_message_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_rooms_select ON chat_rooms FOR SELECT USING (
  can_manage_chat()
  OR (
    is_archived = false
    AND is_chat_participant(id)
  )
);

CREATE POLICY chat_rooms_staff_update ON chat_rooms FOR UPDATE USING (can_manage_chat());

CREATE POLICY chat_members_select ON chat_members FOR SELECT USING (
  can_manage_chat()
  OR is_chat_participant(room_id)
  OR profile_id = auth.uid()
);

CREATE POLICY chat_messages_select ON chat_messages FOR SELECT USING (
  can_manage_chat() OR is_chat_participant(room_id)
);

CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT WITH CHECK (
  kind = 'text'
  AND sender_id = auth.uid()
  AND can_send_chat(room_id)
  AND char_length(TRIM(body)) BETWEEN 1 AND 2000
);

CREATE POLICY chat_moderation_select ON chat_moderation_events FOR SELECT USING (can_manage_chat());

CREATE POLICY profiles_staff_select ON profiles FOR SELECT USING (is_staff());

CREATE POLICY profiles_chat_peers ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM chat_members me
    JOIN chat_members them ON them.room_id = me.room_id
    WHERE me.profile_id = auth.uid()
      AND me.status IN ('active', 'muted')
      AND them.profile_id = profiles.id
      AND them.status IN ('active', 'muted', 'removed', 'blocked')
  )
);

GRANT USAGE ON TYPE chat_room_visibility TO authenticated;
GRANT USAGE ON TYPE chat_member_role TO authenticated;
GRANT USAGE ON TYPE chat_member_status TO authenticated;
GRANT USAGE ON TYPE chat_message_kind TO authenticated;
GRANT USAGE ON TYPE chat_moderation_action TO authenticated;

GRANT SELECT, INSERT, UPDATE ON chat_rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_messages TO authenticated;
GRANT SELECT ON chat_moderation_events TO authenticated;

GRANT EXECUTE ON FUNCTION can_manage_chat() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_my_chat_memberships() TO authenticated;
GRANT EXECUTE ON FUNCTION create_chat_room(TEXT, TEXT, chat_room_visibility) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_chat_room(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION add_chat_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mute_chat_member(UUID, UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION unmute_chat_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION kick_chat_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION block_chat_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_chat_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_chat_message(UUID) TO authenticated;

ALTER TABLE chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE chat_members REPLICA IDENTITY FULL;
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE chat_members;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

INSERT INTO chat_rooms (name, description, visibility)
SELECT 'General', 'Dojo-wide chat for members and staff', 'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM chat_rooms WHERE name = 'General');

INSERT INTO chat_rooms (name, description, visibility)
SELECT 'Staff', 'Private chat for coaches and admins', 'STAFF'
WHERE NOT EXISTS (SELECT 1 FROM chat_rooms WHERE name = 'Staff');
