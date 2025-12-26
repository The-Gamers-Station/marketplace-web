-- Seed Cities (Major Saudi Arabian Cities)
INSERT INTO cities (name_en, name_ar, slug) VALUES
('Riyadh', 'الرياض', 'riyadh'),
('Jeddah', 'جدة', 'jeddah'),
('Mecca', 'مكة المكرمة', 'mecca'),
('Medina', 'المدينة المنورة', 'medina'),
('Dammam', 'الدمام', 'dammam'),
('Khobar', 'الخبر', 'khobar'),
('Dhahran', 'الظهران', 'dhahran'),
('Taif', 'الطائف', 'taif'),
('Tabuk', 'تبوك', 'tabuk'),
('Buraidah', 'بريدة', 'buraidah'),
('Khamis Mushait', 'خميس مشيط', 'khamis-mushait'),
('Hail', 'حائل', 'hail'),
('Najran', 'نجران', 'najran'),
('Hafar Al-Batin', 'حفر الباطن', 'hafar-al-batin'),
('Jubail', 'الجبيل', 'jubail'),
('Abha', 'أبها', 'abha'),
('Yanbu', 'ينبع', 'yanbu'),
('Al-Kharj', 'الخرج', 'al-kharj'),
('Qatif', 'القطيف', 'qatif'),
('Al-Ahsa', 'الأحساء', 'al-ahsa');

-- Insert PlayStation categories with hardcoded IDs (100-102)
INSERT INTO categories (id, parent_id, name_en, name_ar, slug, level, sort_order, is_active, created_at, updated_at)
VALUES 
(100, null, 'PlayStation Devices', 'أجهزة بلايستيشن', 'playstation-devices', 1, 100, true, NOW(), NOW()),
(101, null, 'PlayStation Games', 'ألعاب بلايستيشن', 'playstation-games', 1, 101, true, NOW(), NOW()),
(102, null, 'PlayStation Accessories', 'إكسسوارات بلايستيشن', 'playstation-accessories', 1, 102, true, NOW(), NOW());

-- Insert Xbox categories with hardcoded IDs (200-202)
INSERT INTO categories (id, parent_id, name_en, name_ar, slug, level, sort_order, is_active, created_at, updated_at)
VALUES 
(200, null, 'Xbox Devices', 'أجهزة إكس بوكس', 'xbox-devices', 1, 200, true, NOW(), NOW()),
(201, null, 'Xbox Games', 'ألعاب إكس بوكس', 'xbox-games', 1, 201, true, NOW(), NOW()),
(202, null, 'Xbox Accessories', 'إكسسوارات إكس بوكس', 'xbox-accessories', 1, 202, true, NOW(), NOW());

-- Insert Nintendo categories with hardcoded IDs (300-302)
INSERT INTO categories (id, parent_id, name_en, name_ar, slug, level, sort_order, is_active, created_at, updated_at)
VALUES
(300, null, 'Nintendo Devices', 'أجهزة نينتندو', 'nintendo-devices', 1, 300, true, NOW(), NOW()),
(301, null, 'Nintendo Games', 'ألعاب نينتندو', 'nintendo-games', 1, 301, true, NOW(), NOW()),
(302, null, 'Nintendo Accessories', 'إكسسوارات نينتندو', 'nintendo-accessories', 1, 302, true, NOW(), NOW());

-- Insert PC categories with hardcoded IDs (400-402)
INSERT INTO categories (id, parent_id, name_en, name_ar, slug, level, sort_order, is_active, created_at, updated_at)
VALUES
(400, null, 'PC Devices', 'أجهزة الكمبيوتر', 'pc-devices', 1, 400, true, NOW(), NOW()),
(401, null, 'PC Games', 'ألعاب الكمبيوتر', 'pc-games', 1, 401, true, NOW(), NOW()),
(402, null, 'PC Accessories', 'إكسسوارات الكمبيوتر', 'pc-accessories', 1, 402, true, NOW(), NOW());

-- Create an admin user (password should be set via API)
-- Default phone: +966500000000, password will need to be set on first login
INSERT INTO users (phone_number, username, role, is_active, profile_completed) VALUES
('+966500000000', 'admin', 'ADMIN', TRUE, TRUE);
