-- CMS bootstrap: seed existing static website assets into DB (idempotent)

-- Marketing-only coaches (no login required)
ALTER TABLE coaches ALTER COLUMN profile_id DROP NOT NULL;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Logo
UPDATE site_settings
SET logo_url = '/images/Home/logo.jpg'
WHERE logo_url IS NULL;

-- Home page sections: hero image, kaizen way, program highlights, page banners
UPDATE cms_pages
SET sections = sections
  || jsonb_build_object(
    'hero', COALESCE(sections->'hero', '{}'::jsonb) || jsonb_build_object('imageUrl', '/images/Home/hero.jpg'),
    'kaizenWayImageUrl', COALESCE(sections->>'kaizenWayImageUrl', '/images/Home/logo.jpg'),
    'programHighlights', COALESCE(
      sections->'programHighlights',
      '["/images/Home/Program/Program1.jpg","/images/Home/Program/Program2.jpg","/images/Home/Program/Program3.jpg","/images/Home/Program/Program4.jpg","/images/Home/Program/Program5.jpg","/images/Home/Program/Program6.jpg"]'::jsonb
    ),
    'banners', COALESCE(
      sections->'banners',
      '{
        "about": "/images/Home/logo.jpg",
        "coaches": "/images/Home/hero.jpg",
        "contact": "/images/Home/hero.jpg",
        "programs": "/images/Home/hero.jpg",
        "pricing": "/images/Home/hero.jpg",
        "schedule": "/images/Home/hero.jpg",
        "enroll": "/images/Home/hero.jpg",
        "facility": "/images/Home/hero.jpg"
      }'::jsonb
    )
  )
WHERE slug = 'home'
  AND (
    sections->'hero'->>'imageUrl' IS NULL
    OR sections->>'kaizenWayImageUrl' IS NULL
    OR sections->'programHighlights' IS NULL
    OR sections->'banners' IS NULL
  );

-- Gallery (only if empty)
INSERT INTO cms_gallery (title, image_url, category, sort_order, is_published)
SELECT v.title, v.image_url, 'general', v.sort_order, true
FROM (VALUES
  ('Training 1', '/images/Home/Posts/posts1.jpg', 1),
  ('Training 2', '/images/Home/Posts/posts2.jpg', 2),
  ('Training 3', '/images/Home/Posts/posts3.jpg', 3),
  ('Training 4', '/images/Home/Posts/posts4.jpg', 4),
  ('Training 5', '/images/Home/Posts/posts5.jpg', 5)
) AS v(title, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM cms_gallery LIMIT 1);

-- Marketing coaches (only if empty)
INSERT INTO coaches (display_name, bio, photo_url, is_active, sort_order, profile_id)
SELECT v.display_name, v.bio, '/images/Home/hero.jpg', true, v.sort_order, NULL
FROM (VALUES
  ('Brindle', 'Fundamentals, fight team, and academy leadership.', 1),
  ('Daryll', 'Striking and pad work specialist.', 2),
  ('Glenn', 'Muay Thai technique and conditioning.', 3),
  ('Kenneth', 'MMA and grappling fundamentals.', 4),
  ('Ariel', 'Boxing footwork and competition prep.', 5),
  ('Name', 'Profile coming soon.', 6),
  ('Name', 'Profile coming soon.', 7),
  ('Name', 'Profile coming soon.', 8)
) AS v(display_name, bio, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM coaches LIMIT 1);
