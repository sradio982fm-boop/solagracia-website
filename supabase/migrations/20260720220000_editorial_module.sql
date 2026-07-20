-- Phase 3 editorial module: picks, chart, news (manual CMS)

CREATE TABLE IF NOT EXISTS picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid REFERENCES shows(id) ON DELETE SET NULL,
  headline text NOT NULL,
  description text,
  badge text NOT NULL DEFAULT 'Pilihan',
  cover_url text,
  href text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank int NOT NULL UNIQUE CHECK (rank >= 1 AND rank <= 20),
  title text NOT NULL,
  artist text NOT NULL,
  trend text NOT NULL DEFAULT 'steady' CHECK (trend IN ('up', 'down', 'steady', 'new')),
  cover_url text,
  spotify_url text,
  youtube_url text,
  week_label text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  tag_label text,
  published_at timestamptz NOT NULL DEFAULT now(),
  sort_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS picks_sort_order_idx ON picks(sort_order);
CREATE INDEX IF NOT EXISTS picks_status_idx ON picks(status);
CREATE INDEX IF NOT EXISTS chart_rank_idx ON chart(rank);
CREATE INDEX IF NOT EXISTS chart_status_idx ON chart(status);
CREATE INDEX IF NOT EXISTS news_sort_order_idx ON news(sort_order);
CREATE INDEX IF NOT EXISTS news_published_at_idx ON news(published_at DESC);

ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Hidden by default — GRACIA homepage unchanged until admin enables
INSERT INTO section_config (section, is_visible, sort_order, letter, nav_label, menu_label, surface)
VALUES
  ('picks', false, 6, 'P', 'Pilihan', 'Siaran Pilihan', 'smoke'),
  ('chart', false, 7, 'T', 'Chart', 'Tangga Lagu', 'white'),
  ('news', false, 8, 'B', 'Berita', 'Berita Terkini', 'smoke')
ON CONFLICT (section) DO NOTHING;

INSERT INTO section_headers (section, eyebrow, title, title_accent, description)
VALUES
  (
    'picks',
    'Kurasi Editorial',
    'Siaran',
    'Pilihan',
    'Tiga momen terbaik dari studio Solagracia minggu ini — dipilih tim kami untukmu.'
  ),
  (
    'chart',
    'Tangga Lagu',
    'Top',
    'Tracks',
    'Lima lagu favorit pendengar Solagracia — diperbarui manual setiap minggu.'
  ),
  (
    'news',
    'Wire Feed',
    'Berita',
    'Terkini',
    'Kabar radio, musik lokal, dan cerita komunitas yang sedang hangat dibahas.'
  )
ON CONFLICT (section) DO UPDATE SET
  eyebrow = EXCLUDED.eyebrow,
  title = EXCLUDED.title,
  title_accent = EXCLUDED.title_accent,
  description = EXCLUDED.description;

INSERT INTO picks (show_id, headline, description, badge, cover_url, href, is_featured, sort_order, status)
VALUES
  (
    'b2000001-0000-4000-8000-000000000001',
    'Sunrise Session Terbaik',
    'Episode spesial Morning Brew dengan set akustik di pagi hari Jakarta — suara hangat untuk memulai hari.',
    'Featured',
    '/cover-image.png',
    '#program',
    true,
    0,
    'published'
  ),
  (
    'b2000001-0000-4000-8000-000000000002',
    'Cerita Tengah Hari yang Menggugah',
    'Segmen Midday Stories tentang musisi indie lokal yang baru merilis EP pertamanya.',
    'Highlight',
    '/cover-image.png',
    '#program',
    false,
    1,
    'published'
  ),
  (
    'b2000001-0000-4000-8000-000000000003',
    'Golden Hour Live dari Studio',
    'Rekaman langsung Golden Hour dengan tamu spesial — vibes sore yang pas untuk pulang kerja.',
    'Replay',
    '/cover-image.png',
    '#program',
    false,
    2,
    'published'
  );

INSERT INTO chart (rank, title, artist, trend, cover_url, spotify_url, youtube_url, week_label, status)
VALUES
  (1, 'Langit Senja', 'Hindia', 'up', '/cover-image.png', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Minggu 3 · Juli 2026', 'published'),
  (2, 'Sial', 'Mahalini', 'steady', '/cover-image.png', NULL, NULL, 'Minggu 3 · Juli 2026', 'published'),
  (3, 'Komang', 'Raim Laode', 'down', '/cover-image.png', NULL, NULL, 'Minggu 3 · Juli 2026', 'published'),
  (4, 'Respon', 'Pamungkas', 'new', '/cover-image.png', NULL, NULL, 'Minggu 3 · Juli 2026', 'published'),
  (5, 'Tarot', 'NIKI', 'up', '/cover-image.png', NULL, NULL, 'Minggu 3 · Juli 2026', 'published');

INSERT INTO news (title, description, image_url, link, tag_label, published_at, sort_order, status)
VALUES
  (
    'Solagracia Perluas Jangkauan Siaran Digital',
    'Radio komunitas Solagracia resmi meluncurkan streaming HD untuk pendengar di seluruh Indonesia.',
    '/cover-image.png',
    '#tentang',
    'Radio',
    now() - interval '2 hours',
    0,
    'published'
  ),
  (
    'Line-up Penyiar Baru Hadir di Golden Hour',
    'Tiga suara segar bergabung ke roster penyiar — siap menemani sore kamu di frekuensi 98.2 FM.',
    '/cover-image.png',
    '#penyiar',
    'Penyiar',
    now() - interval '1 day',
    1,
    'published'
  ),
  (
    'Open Audition Segment Musisi Lokal',
    'Solagracia membuka slot audisi untuk musisi independen — kirim demomu sebelum akhir bulan.',
    '/cover-image.png',
    '#kontak',
    'Komunitas',
    now() - interval '3 days',
    2,
    'published'
  );
