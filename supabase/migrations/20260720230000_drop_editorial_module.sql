-- Remove Phase 3 editorial module (picks / chart / news) — not used on Solagracia public site

DELETE FROM section_config WHERE section IN ('picks', 'chart', 'news');
DELETE FROM section_headers WHERE section IN ('picks', 'chart', 'news');

DROP TABLE IF EXISTS picks CASCADE;
DROP TABLE IF EXISTS chart CASCADE;
DROP TABLE IF EXISTS news CASCADE;
