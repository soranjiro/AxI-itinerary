-- 基本テーブル作成マイグレーション

-- しおりテーブル
CREATE TABLE itineraries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    edit_password_hash TEXT,
    theme TEXT DEFAULT 'simple',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- タイムライン項目テーブル
CREATE TABLE timeline_items (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT,
    location_address TEXT,
    location_lat REAL,
    location_lng REAL,
    start_datetime DATETIME,
    end_datetime DATETIME,
    budget_amount INTEGER,
    memo TEXT,
    sort_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
);

-- 持ち物リストテーブル
CREATE TABLE packing_items (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 1,
    is_checked BOOLEAN DEFAULT FALSE,
    memo TEXT,
    assignee TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
);

-- 予算項目テーブル
CREATE TABLE budget_items (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    planned_amount INTEGER,
    actual_amount INTEGER,
    payer TEXT,
    split_method TEXT DEFAULT 'equal',
    expense_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
);

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY,
    itinerary_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    llm_provider TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
);
