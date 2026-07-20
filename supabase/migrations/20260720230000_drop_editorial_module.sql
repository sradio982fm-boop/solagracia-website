-- Idempotent cleanup: editorial CMS (picks / chart / news) is not part of Solagracia.
-- Safe if tables/rows were never created.

DELETE FROM section_config WHERE section IN ('picks', 'chart', 'news');
DELETE FROM section_headers WHERE section IN ('picks', 'chart', 'news');

DROP TABLE IF EXISTS picks CASCADE;
DROP TABLE IF EXISTS chart CASCADE;
DROP TABLE IF EXISTS news CASCADE;
