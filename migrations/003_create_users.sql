-- ユーザーテーブル作成マイグレーション

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- しおりとユーザーの関連テーブル
CREATE TABLE user_itineraries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    itinerary_id TEXT NOT NULL,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id),
    UNIQUE(user_id, itinerary_id)
);

-- インデックス
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_user_itineraries_user_id ON user_itineraries (user_id);
CREATE INDEX idx_user_itineraries_itinerary_id ON user_itineraries (itinerary_id);
