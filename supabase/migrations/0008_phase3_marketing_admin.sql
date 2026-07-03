-- Phase 3: RLS for student creation, facility gallery, coach cleanup, Kickboxing program

-- Allow staff with create_edit_students to manage student records
DROP POLICY IF EXISTS admin_students ON students;
CREATE POLICY students_staff_all ON students FOR ALL USING (
  is_admin() OR has_permission('create_edit_students') OR has_permission('view_students')
);

DROP POLICY IF EXISTS admin_guardians ON guardians;
CREATE POLICY guardians_staff_all ON guardians FOR ALL USING (
  is_admin() OR has_permission('create_edit_students') OR has_permission('view_students')
);

DROP POLICY IF EXISTS admin_emergency ON emergency_contacts;
CREATE POLICY emergency_staff_all ON emergency_contacts FOR ALL USING (
  is_admin() OR has_permission('create_edit_students') OR has_permission('view_students')
);

DROP POLICY IF EXISTS admin_memberships ON memberships;
CREATE POLICY memberships_staff_all ON memberships FOR ALL USING (
  is_admin() OR has_permission('create_edit_students') OR has_permission('view_students')
);

DROP POLICY IF EXISTS parent_students_admin ON parent_students;
CREATE POLICY parent_students_staff_all ON parent_students FOR ALL USING (
  is_admin() OR has_permission('create_edit_students') OR has_permission('view_students')
);

-- Deactivate placeholder coaches
UPDATE coaches
SET is_active = false
WHERE display_name = 'Name'
   OR bio ILIKE '%coming soon%';

-- Seed facility gallery from bundled public images (idempotent)
INSERT INTO cms_gallery (title, image_url, category, sort_order, is_published)
SELECT v.title, v.image_url, 'facility', v.sort_order, true
FROM (VALUES
  ('Facility 1', '/images/facility/0292f8fa-eb9a-4f37-99cd-28896564aff5.jpeg', 1),
  ('Facility 2', '/images/facility/1b6bab46-6ae0-4e49-9f0e-cc01804cf6d9.jpeg', 2),
  ('Facility 3', '/images/facility/232a380e-8649-4482-9721-190a76f8e177.jpeg', 3),
  ('Facility 4', '/images/facility/7507d19a-1d4e-4974-9b01-d4c62b8a1e67.jpeg', 4),
  ('Facility 5', '/images/facility/78dfa89a-f05b-47ca-b5a1-3a444940c062.jpeg', 5),
  ('Facility 6', '/images/facility/92ec33f7-d175-4994-b56d-36bf379836e5.jpeg', 6),
  ('Facility 7', '/images/facility/a5c53673-1bd0-4f3c-a365-bf8dedd60196.jpeg', 7),
  ('Facility 8', '/images/facility/b1310821-a589-4864-ab2c-521a761f8f2d.jpeg', 8),
  ('Facility 9', '/images/facility/b8562d4a-a115-4792-8d43-d12c9f210736.jpeg', 9),
  ('Facility 10', '/images/facility/cb248599-8caa-40ec-aed3-a78595baf254.jpeg', 10),
  ('Facility 11', '/images/facility/cb6136df-95c2-4f04-ab72-e3dbf35454cd.jpeg', 11),
  ('Facility 12', '/images/facility/ceb66aaa-62c0-4368-871d-52bb6e4a76f1.jpeg', 12),
  ('Facility 13', '/images/facility/d0a0139a-1cbb-4b47-97d6-002ccbcb9965.jpeg', 13),
  ('Facility 14', '/images/facility/dfd96530-f274-46be-ba40-bde2d39503ad.jpeg', 14),
  ('Facility 15', '/images/facility/e045c575-340d-40c8-804a-73bcea1ddd5a.jpeg', 15),
  ('Facility 16', '/images/facility/f369486d-1242-4c2c-a909-0fafac68cf08.jpeg', 16),
  ('Facility 17', '/images/facility/feee4421-56bd-48fc-be06-f413a62d54d6.jpeg', 17)
) AS v(title, image_url, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM cms_gallery WHERE category = 'facility' LIMIT 1
);

-- Add Kickboxing program if missing
INSERT INTO programs (name, description, is_active, sort_order)
SELECT 'Kickboxing', 'High-energy kickboxing for fitness, technique, and fight conditioning.', true, 9
WHERE NOT EXISTS (SELECT 1 FROM programs WHERE name = 'Kickboxing');

INSERT INTO cms_programs (program_id, title, description, image_url, sort_order, is_published)
SELECT p.id, 'Kickboxing', 'High-energy kickboxing for fitness, technique, and fight conditioning.',
  'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80',
  9, true
FROM programs p
WHERE p.name = 'Kickboxing'
  AND NOT EXISTS (SELECT 1 FROM cms_programs cp WHERE cp.program_id = p.id);

-- Default program images for existing programs without cms_programs rows
INSERT INTO cms_programs (program_id, title, description, image_url, sort_order, is_published)
SELECT p.id, p.name, COALESCE(p.description, ''), v.image_url, COALESCE(p.sort_order, 0), true
FROM programs p
JOIN (VALUES
  ('Muay Thai', 'https://images.unsplash.com/photo-1555597677-b303096c6d8f?w=800&q=80'),
  ('MMA', 'https://images.unsplash.com/photo-1549719386-74dfcbf703db?w=800&q=80'),
  ('Boxing', 'https://images.unsplash.com/photo-1517438476312-10d79c0775de?w=800&q=80'),
  ('Kids Martial Arts', 'https://images.unsplash.com/photo-1555597677-0732e8b58f38?w=800&q=80'),
  ('Teen Martial Arts', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80'),
  ('Self Defense', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80'),
  ('Fitness Conditioning', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80'),
  ('Private Coaching', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80'),
  ('Brazilian Jiu-Jitsu', 'https://images.unsplash.com/photo-1583454110551-21f2fee2c41b?w=800&q=80'),
  ('Kickboxing', 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80')
) AS v(name, image_url) ON p.name = v.name
WHERE NOT EXISTS (SELECT 1 FROM cms_programs cp WHERE cp.program_id = p.id);

-- Update existing cms_programs without images
UPDATE cms_programs cp
SET image_url = v.image_url
FROM programs p
JOIN (VALUES
  ('Muay Thai', 'https://images.unsplash.com/photo-1555597677-b303096c6d8f?w=800&q=80'),
  ('MMA', 'https://images.unsplash.com/photo-1549719386-74dfcbf703db?w=800&q=80'),
  ('Boxing', 'https://images.unsplash.com/photo-1517438476312-10d79c0775de?w=800&q=80'),
  ('Kids Martial Arts', 'https://images.unsplash.com/photo-1555597677-0732e8b58f38?w=800&q=80'),
  ('Teen Martial Arts', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80'),
  ('Self Defense', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80'),
  ('Fitness Conditioning', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80'),
  ('Private Coaching', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80'),
  ('Brazilian Jiu-Jitsu', 'https://images.unsplash.com/photo-1583454110551-21f2fee2c41b?w=800&q=80'),
  ('Kickboxing', 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80')
) AS v(name, image_url) ON p.name = v.name
WHERE cp.program_id = p.id AND (cp.image_url IS NULL OR cp.image_url = '');
