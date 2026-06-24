-- Pricing page CMS: custom CTA section (category 4)

INSERT INTO cms_pages (slug, title, sections, is_published)
SELECT
  'pricing',
  'Pricing',
  '{
    "customCta": {
      "title": "Custom Programs",
      "description": "Need a tailored plan? Call or contact us for customized training packages."
    }
  }'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM cms_pages WHERE slug = 'pricing');

UPDATE cms_pages
SET sections = COALESCE(sections, '{}'::jsonb) || jsonb_build_object(
  'customCta', COALESCE(
    sections->'customCta',
    '{"title": "Custom Programs", "description": "Need a tailored plan? Call or contact us for customized training packages."}'::jsonb
  )
)
WHERE slug = 'pricing' AND sections->'customCta' IS NULL;
