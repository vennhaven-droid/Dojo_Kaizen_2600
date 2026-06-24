-- Pricing categories for grouped rate display (Group Classes + Private Classes)

ALTER TABLE cms_pricing ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';
ALTER TABLE cms_pricing ADD COLUMN IF NOT EXISTS note TEXT;

DELETE FROM cms_pricing;

INSERT INTO cms_pricing (title, description, price, billing_period, category, note, features, is_promoted, sort_order, is_published) VALUES
  ('Walk-in', NULL, 300, 'walk-in', 'group_classes', NULL, '[]', false, 1, true),
  ('Student Walk-in', NULL, 250, 'walk-in', 'group_classes', NULL, '[]', false, 2, true),
  ('Monthly / 12 Sessions', NULL, 2500, 'package', 'group_classes', NULL, '[]', false, 3, true),
  ('Unlimited Monthly', NULL, 3500, 'monthly', 'group_classes', NULL, '[]', true, 4, true),
  ('1 Pax', NULL, 500, 'session', 'private_single', 'Single session — expires 1 month after purchase', '[]', false, 1, true),
  ('2 Pax', NULL, 700, 'session', 'private_single', NULL, '[]', false, 2, true),
  ('3 Pax', NULL, 900, 'session', 'private_single', NULL, '[]', false, 3, true),
  ('4 Pax', NULL, 1100, 'session', 'private_single', NULL, '[]', false, 4, true),
  ('1 Pax', NULL, 4000, 'package', 'private_package', NULL, '[]', false, 1, true),
  ('2 Pax', NULL, 4500, 'package', 'private_package', NULL, '[]', false, 2, true),
  ('3 Pax', NULL, 5000, 'package', 'private_package', NULL, '[]', false, 3, true),
  ('4 Pax', NULL, 5500, 'package', 'private_package', NULL, '[]', false, 4, true);
