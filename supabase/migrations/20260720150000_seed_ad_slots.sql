-- Seed ad_slots from static SECTION_ADS (src/data/ads.ts)
INSERT INTO ad_slots (
  section_id,
  label,
  sponsor,
  line,
  variant,
  tone,
  href,
  image_url,
  image_alt,
  image_shape,
  is_visible,
  sort_order,
  status
)
SELECT
  'tentang',
  'Partner',
  NULL,
  NULL,
  'image',
  'ink',
  '#kontak',
  '/ads/about-section-ad.webp',
  'Space iklan ini bisa jadi milik kamu — jangkau audiens luas bersama S Radio',
  'banner',
  true,
  0,
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM ad_slots WHERE section_id = 'tentang'
);

INSERT INTO ad_slots (
  section_id,
  label,
  sponsor,
  line,
  variant,
  tone,
  href,
  image_url,
  image_alt,
  image_shape,
  is_visible,
  sort_order,
  status
)
SELECT
  'program',
  'Partner',
  'Space Iklan',
  'Sewakan sekarang — jangkau lebih banyak audiens bersama kami.',
  'panel',
  NULL,
  '#kontak',
  '/ads/program-section-ad.webp',
  'Space iklan program — brand Anda didengar banyak orang',
  NULL,
  true,
  0,
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM ad_slots WHERE section_id = 'program'
);

INSERT INTO ad_slots (
  section_id,
  label,
  sponsor,
  line,
  variant,
  tone,
  href,
  image_url,
  image_alt,
  image_shape,
  is_visible,
  sort_order,
  status
)
SELECT
  'penyiar',
  'Partner',
  'Space Iklan',
  'Jangkau lebih banyak audiens bersama kami.',
  'panel',
  'ink',
  '#kontak',
  '/ads/penyiar-section-ad.webp',
  'Space iklan penyiar — your brand, your impact',
  NULL,
  true,
  0,
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM ad_slots WHERE section_id = 'penyiar'
);
