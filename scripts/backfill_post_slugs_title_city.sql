/*
  One-time slug backfill script (MySQL 8+)
  ----------------------------------------
  هدف السكربت:
  - إعادة توليد slug لكل الإعلانات بصيغة title-city
  - معالجة التكرارات تلقائياً بإضافة -2, -3, ...
  - إبقاء القيم فريدة وآمنة قبل تطبيق UPDATE

  ملاحظات:
  - جرّبه أولاً على staging/backup.
  - السكربت يعيد توليد slug لجميع الصفوف (وليس legacy فقط).
*/

SET @old_sql_safe_updates := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;

-- 1) تجهيز slug أساسي من title + city مع تنظيف أولي
DROP TEMPORARY TABLE IF EXISTS tmp_slug_backfill;
CREATE TEMPORARY TABLE tmp_slug_backfill (
  id BIGINT PRIMARY KEY,
  base_slug VARCHAR(320) NOT NULL,
  rn INT NOT NULL,
  final_slug VARCHAR(320) NULL
);

INSERT INTO tmp_slug_backfill (id, base_slug, rn)
SELECT
  prepared.id,
  prepared.base_slug,
  ROW_NUMBER() OVER (PARTITION BY prepared.base_slug ORDER BY prepared.id) AS rn
FROM (
  SELECT
    p.id,
    LEFT(
      TRIM(BOTH '-' FROM REGEXP_REPLACE(
        REGEXP_REPLACE(
          LOWER(
            CONCAT(
              COALESCE(NULLIF(TRIM(p.title), ''), 'ad'),
              '-',
              COALESCE(NULLIF(TRIM(c.name_en), ''), COALESCE(NULLIF(TRIM(c.name_ar), ''), 'city'))
            )
          ),
          '[[:space:]]+', '-'
        ),
        '-+', '-'
      )),
      300
    ) AS base_slug
  FROM posts p
  LEFT JOIN cities c ON c.id = p.city_id
) prepared;

-- 2) fallback إذا slug الأساسي خرج فاضي
UPDATE tmp_slug_backfill
SET base_slug = CONCAT('ad-', id)
WHERE base_slug IS NULL OR base_slug = '';

-- 3) حل التكرارات بإضافة -2, -3, ... مع ضبط الطول
UPDATE tmp_slug_backfill
SET final_slug = CASE
  WHEN rn = 1 THEN base_slug
  ELSE CONCAT(LEFT(base_slug, 300 - CHAR_LENGTH(CONCAT('-', rn))), '-', rn)
END;

-- 4) تحديث posts.slug
UPDATE posts p
JOIN tmp_slug_backfill t ON t.id = p.id
SET p.slug = t.final_slug;

-- 5) فحوصات سريعة
SELECT COUNT(*) AS total_posts FROM posts;
SELECT COUNT(*) AS null_or_empty_slugs FROM posts WHERE slug IS NULL OR slug = '';
SELECT slug, COUNT(*) AS cnt
FROM posts
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY cnt DESC
LIMIT 20;

COMMIT;

SET SQL_SAFE_UPDATES = @old_sql_safe_updates;
