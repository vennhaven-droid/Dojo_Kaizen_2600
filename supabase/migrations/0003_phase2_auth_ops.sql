-- Phase 2: Auth, permissions, inquiries, enrollment workflow, payments, attendance checkout

-- Enums
CREATE TYPE inquiry_status AS ENUM ('NEW', 'READ', 'REPLIED', 'CLOSED');
CREATE TYPE payment_status AS ENUM ('PAID', 'UNPAID', 'PARTIAL', 'OVERDUE');
CREATE TYPE announcement_audience AS ENUM ('ALL', 'STUDENTS', 'PARENTS', 'STAFF');

-- Profiles: active flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Students: admin notes
ALTER TABLE students ADD COLUMN IF NOT EXISTS notes TEXT;

-- Attendance: checkout
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS duration_minutes INT;

-- Payments: status and due tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'PAID';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_due DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2);

-- Enrollment leads: workflow fields
ALTER TABLE enrollment_leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE enrollment_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Migrate enrollment status text to enum-like values
UPDATE enrollment_leads SET status = 'NEW' WHERE status IN ('new', 'NEW');
UPDATE enrollment_leads SET status = 'ENROLLED' WHERE status IN ('converted', 'CONVERTED', 'enrolled', 'ENROLLED');
UPDATE enrollment_leads SET status = 'CONTACTED' WHERE status IN ('contacted', 'CONTACTED');
UPDATE enrollment_leads SET status = 'NOT_PROCEEDING' WHERE status IN ('not_proceeding', 'NOT_PROCEEDING', 'closed', 'CLOSED');

ALTER TABLE enrollment_leads DROP CONSTRAINT IF EXISTS enrollment_leads_status_check;
ALTER TABLE enrollment_leads ADD CONSTRAINT enrollment_leads_status_check
  CHECK (status IN ('NEW', 'CONTACTED', 'ENROLLED', 'NOT_PROCEEDING'));

CREATE TRIGGER enrollment_leads_updated_at
  BEFORE UPDATE ON enrollment_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Contact inquiries
CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  source_page TEXT DEFAULT '/contact',
  status inquiry_status NOT NULL DEFAULT 'NEW',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created ON contact_inquiries(created_at DESC);

CREATE TRIGGER contact_inquiries_updated_at
  BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Staff permissions (one row per coach/admin profile)
CREATE TABLE admin_permissions (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  view_students BOOLEAN NOT NULL DEFAULT false,
  create_edit_students BOOLEAN NOT NULL DEFAULT false,
  view_payments BOOLEAN NOT NULL DEFAULT false,
  create_edit_payments BOOLEAN NOT NULL DEFAULT false,
  view_inquiries BOOLEAN NOT NULL DEFAULT false,
  manage_inquiries BOOLEAN NOT NULL DEFAULT false,
  manage_enrollments BOOLEAN NOT NULL DEFAULT false,
  manage_media BOOLEAN NOT NULL DEFAULT false,
  manage_content BOOLEAN NOT NULL DEFAULT false,
  manage_programs BOOLEAN NOT NULL DEFAULT false,
  manage_coaches BOOLEAN NOT NULL DEFAULT false,
  manage_pricing BOOLEAN NOT NULL DEFAULT false,
  manage_schedule BOOLEAN NOT NULL DEFAULT false,
  manage_staff BOOLEAN NOT NULL DEFAULT false,
  full_admin_access BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER admin_permissions_updated_at
  BEFORE UPDATE ON admin_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Student profile change audit
CREATE TABLE student_profile_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_profile_changes_student ON student_profile_changes(student_id, created_at DESC);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience announcement_audience NOT NULL DEFAULT 'ALL',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Helper: is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is staff (admin, coach, super admin)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('SUPER_ADMIN', 'ADMIN', 'COACH')
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: has permission flag
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
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS new tables
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profile_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Contact inquiries policies
CREATE POLICY contact_inquiries_public_insert ON contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY contact_inquiries_staff_select ON contact_inquiries FOR SELECT USING (
  is_super_admin() OR has_permission('view_inquiries') OR has_permission('manage_inquiries')
);
CREATE POLICY contact_inquiries_staff_update ON contact_inquiries FOR UPDATE USING (
  is_super_admin() OR has_permission('manage_inquiries')
);

-- Admin permissions policies
CREATE POLICY admin_permissions_super_select ON admin_permissions FOR SELECT USING (
  is_super_admin() OR profile_id = auth.uid()
);
CREATE POLICY admin_permissions_super_all ON admin_permissions FOR ALL USING (is_super_admin());

-- Student profile changes
CREATE POLICY profile_changes_student_insert ON student_profile_changes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.profile_id = auth.uid())
  OR is_admin()
);
CREATE POLICY profile_changes_select ON student_profile_changes FOR SELECT USING (
  is_admin()
  OR EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.profile_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM parent_students ps
    JOIN students s ON s.id = ps.student_id
    WHERE ps.student_id = student_profile_changes.student_id AND ps.parent_id = auth.uid()
  )
);

-- Announcements
CREATE POLICY announcements_public_read ON announcements FOR SELECT USING (
  is_published = true OR is_staff()
);
CREATE POLICY announcements_staff_write ON announcements FOR ALL USING (
  is_super_admin() OR has_permission('manage_content')
);

-- Student self-view payments
CREATE POLICY student_view_payments ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM students s WHERE s.id = payments.student_id AND s.profile_id = auth.uid())
);

DROP POLICY IF EXISTS admin_enrollment ON enrollment_leads;
CREATE POLICY enrollment_staff_all ON enrollment_leads FOR ALL USING (
  is_admin() OR has_permission('manage_enrollments')
);

-- Storage buckets (run in Supabase dashboard if SQL fails — documented for manual setup)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('marketing-media', 'marketing-media', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', false);
