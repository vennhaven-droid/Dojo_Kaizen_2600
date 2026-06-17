-- Marketing deploy: site settings, pricing, program rates, class schedule
-- Run in Supabase SQL Editor after 0001_init.sql

-- Site settings & SEO
UPDATE site_settings SET
  academy_name = 'Dojo Kaizen Martial Arts 2600',
  phone = '0967 584 2594',
  email = 'info@dojokaizen2600.com',
  address = 'Top Floor Palangdao Bldg., Lower General Luna, Baguio City 2600, Philippines',
  seo_title = 'Dojo Kaizen Martial Arts 2600 | Muay Thai, MMA & Boxing Baguio',
  seo_description = 'Muay Thai, MMA, Boxing & kids martial arts in Baguio City. Train with discipline. Improve daily at Dojo Kaizen 2600.';

-- Program default monthly rates (Baguio)
UPDATE programs SET default_price = 2500 WHERE slug = 'muay-thai';
UPDATE programs SET default_price = 3500 WHERE slug = 'mma';
UPDATE programs SET default_price = 2500 WHERE slug = 'boxing';
UPDATE programs SET default_price = 2000 WHERE slug = 'kids-martial-arts';
UPDATE programs SET default_price = 2800 WHERE slug = 'teen-martial-arts';
UPDATE programs SET default_price = 2000 WHERE slug = 'self-defense';
UPDATE programs SET default_price = 1800 WHERE slug = 'fitness-conditioning';
UPDATE programs SET default_price = 1500 WHERE slug = 'private-coaching';

-- Pricing tiers
DELETE FROM cms_pricing;

INSERT INTO cms_pricing (title, description, price, billing_period, features, is_promoted, sort_order) VALUES
  ('Muay Thai Monthly', 'Unlimited Muay Thai group classes', 2500, 'monthly', '["Unlimited group classes", "Open mat access", "Progress tracking"]', true, 1),
  ('MMA Monthly', 'Unlimited MMA group classes', 3500, 'monthly', '["Unlimited MMA classes", "Sparring sessions", "Strength & conditioning"]', false, 2),
  ('Kids Martial Arts', 'Monthly membership for ages 5–12', 2000, 'monthly', '["2–3 classes per week", "Belt progression", "Safe, fun environment"]', false, 3),
  ('Walk-In / Drop-In', 'Single class — no commitment', 300, 'session', '["One group class", "Great for visitors", "Pay at the front desk"]', false, 4),
  ('Session Package (12)', '12 sessions — use at your pace', 2800, 'package', '["12 class sessions", "3-month validity", "All group classes"]', false, 5),
  ('Private Coaching', 'One-on-one with a coach', 1500, 'session', '["60-minute session", "Personalized curriculum", "Flexible scheduling"]', false, 6),
  ('Locker Rental', 'Secure locker for your gear', 500, 'monthly', '["Personal locker", "24/7 access", "Lock included"]', false, 7);

-- Public read for class schedule
ALTER TABLE program_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS program_schedules_public ON program_schedules;
CREATE POLICY program_schedules_public ON program_schedules FOR SELECT USING (true);

INSERT INTO programs (name, slug, description, age_min, age_max, default_price, sort_order)
SELECT 'Open Mat', 'open-mat', 'Free-form training for all members and levels.', 13, NULL, 300, 9
WHERE NOT EXISTS (SELECT 1 FROM programs WHERE slug = 'open-mat');

-- Weekly class schedule (only insert if empty)
INSERT INTO program_schedules (program_id, day_of_week, start_time, end_time, age_group)
SELECT p.id, v.day_of_week, v.start_time::time, v.end_time::time, v.age_group
FROM (VALUES
  ('muay-thai', 1, '06:00', '07:30', 'Adults'),
  ('boxing', 1, '17:00', '18:30', 'Adults'),
  ('mma', 1, '19:00', '20:30', 'Adults'),
  ('fitness-conditioning', 2, '06:00', '07:00', 'Adults'),
  ('muay-thai', 2, '18:00', '19:30', 'Adults'),
  ('muay-thai', 3, '06:00', '07:30', 'Adults'),
  ('kids-martial-arts', 3, '16:00', '17:00', 'Ages 5–12'),
  ('boxing', 3, '17:00', '18:30', 'Adults'),
  ('mma', 4, '18:00', '19:30', 'Adults'),
  ('muay-thai', 4, '19:00', '20:30', 'Adults'),
  ('muay-thai', 5, '06:00', '07:30', 'Adults'),
  ('open-mat', 5, '18:00', '20:00', 'All levels'),
  ('kids-martial-arts', 6, '09:00', '10:30', 'Ages 5–12'),
  ('muay-thai', 6, '10:30', '12:00', 'Adults'),
  ('open-mat', 0, '08:00', '10:00', 'All levels')
) AS v(slug, day_of_week, start_time, end_time, age_group)
JOIN programs p ON p.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM program_schedules LIMIT 1);
