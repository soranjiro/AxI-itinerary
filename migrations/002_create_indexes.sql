-- インデックス作成マイグレーション

-- タイムライン項目のインデックス
CREATE INDEX idx_timeline_items_itinerary_id ON timeline_items (itinerary_id);
CREATE INDEX idx_timeline_items_start_datetime ON timeline_items (start_datetime);
CREATE INDEX idx_timeline_items_sort_order ON timeline_items (sort_order);

-- 持ち物リストのインデックス
CREATE INDEX idx_packing_items_itinerary_id ON packing_items (itinerary_id);
CREATE INDEX idx_packing_items_category ON packing_items (category);
CREATE INDEX idx_packing_items_is_checked ON packing_items (is_checked);

-- 予算項目のインデックス
CREATE INDEX idx_budget_items_itinerary_id ON budget_items (itinerary_id);
CREATE INDEX idx_budget_items_category ON budget_items (category);
CREATE INDEX idx_budget_items_expense_date ON budget_items (expense_date);

-- チャットメッセージのインデックス
CREATE INDEX idx_chat_messages_itinerary_id ON chat_messages (itinerary_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages (created_at);

-- しおりの検索用インデックス
CREATE INDEX idx_itineraries_created_at ON itineraries (created_at);
CREATE INDEX idx_itineraries_updated_at ON itineraries (updated_at);
