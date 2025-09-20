-- 基本テーブル作成マイグレーション

-- しおりテーブル
CREATE TABLE itineraries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    edit_password_hash TEXT,
    theme TEXT DEFAULT 'travel',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- タイムライン項目テーブル
CREATE TABLE timeline_items (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT,
    start_datetime TEXT NOT NULL,
    end_datetime TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
);

-- 持ち物リストテーブル
CREATE TABLE packing_items (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    is_checked INTEGER NOT NULL DEFAULT 0,
    memo TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
);

-- 予算項目テーブル
CREATE TABLE budget_items (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    planned_amount REAL NOT NULL,
    actual_amount REAL,
    memo TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
);
