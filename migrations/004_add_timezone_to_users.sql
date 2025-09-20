-- ユーザーテーブルにtimezoneカラムを追加

ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Asia/Tokyo';
