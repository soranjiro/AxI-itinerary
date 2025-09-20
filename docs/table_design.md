# テーブル設計

このドキュメントは、APIフォルダの内容から推測されたデータベースのテーブル設計をまとめたものです。主にSvelteKitのAPIルートファイルからデータベース操作を分析して作成しています。

## テーブル一覧

### 1. `itineraries` (旅行計画テーブル)
旅行計画の基本情報を格納するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| `id` | TEXT | PRIMARY KEY | 旅行計画の一意のID (UUID) |
| `title` | TEXT | NOT NULL | 旅行計画のタイトル |
| `description` | TEXT |  | 旅行計画の説明 |
| `edit_password_hash` | TEXT |  | 編集用パスワードのハッシュ (NULL可) |
| `theme` | TEXT | NOT NULL | テーマ (デフォルト: 'travel') |
| `created_at` | TEXT | NOT NULL | 作成日時 (ISO 8601形式) |
| `updated_at` | TEXT | NOT NULL | 更新日時 (ISO 8601形式) |

### 2. `timeline_items` (タイムライン項目テーブル)
旅行計画のタイムライン項目を格納するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| `id` | TEXT | PRIMARY KEY | タイムライン項目の一意のID (UUID) |
| `itinerary_id` | TEXT | NOT NULL, FOREIGN KEY | 関連する旅行計画のID |
| `title` | TEXT | NOT NULL | 項目のタイトル |
| `description` | TEXT |  | 項目の説明 |
| `location_name` | TEXT |  | 場所名 |
| `start_datetime` | TEXT | NOT NULL | 開始日時 (ISO 8601形式) |
| `end_datetime` | TEXT | NOT NULL | 終了日時 (ISO 8601形式) |
| `sort_order` | INTEGER | NOT NULL | 並び順 |
| `created_at` | TEXT | NOT NULL | 作成日時 (ISO 8601形式) |
| `updated_at` | TEXT | NOT NULL | 更新日時 (ISO 8601形式) |

### 3. `packing_items` (荷造り項目テーブル)
旅行計画の荷造り項目を格納するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| `id` | TEXT | PRIMARY KEY | 荷造り項目の一意のID (UUID) |
| `itinerary_id` | TEXT | NOT NULL, FOREIGN KEY | 関連する旅行計画のID |
| `item_name` | TEXT | NOT NULL | 項目名 |
| `category` | TEXT | NOT NULL | カテゴリ |
| `quantity` | INTEGER | NOT NULL | 数量 |
| `is_checked` | INTEGER | NOT NULL | チェック状態 (0: 未チェック, 1: チェック済み) |
| `memo` | TEXT |  | メモ |
| `created_at` | TEXT | NOT NULL | 作成日時 (ISO 8601形式) |
| `updated_at` | TEXT | NOT NULL | 更新日時 (ISO 8601形式) |

### 4. `budget_items` (予算項目テーブル)
旅行計画の予算項目を格納するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| `id` | TEXT | PRIMARY KEY | 予算項目の一意のID (UUID) |
| `itinerary_id` | TEXT | NOT NULL, FOREIGN KEY | 関連する旅行計画のID |
| `category` | TEXT | NOT NULL | カテゴリ |
| `item_name` | TEXT | NOT NULL | 項目名 |
| `planned_amount` | REAL | NOT NULL | 計画金額 |
| `actual_amount` | REAL |  | 実際の金額 (NULL可) |
| `memo` | TEXT |  | メモ |
| `created_at` | TEXT | NOT NULL | 作成日時 (ISO 8601形式) |
| `updated_at` | TEXT | NOT NULL | 更新日時 (ISO 8601形式) |

### 5. `users` (ユーザーテーブル)
ユーザー情報を格納するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| `id` | TEXT | PRIMARY KEY | ユーザーの一意のID (UUID) |
| `email` | TEXT | NOT NULL, UNIQUE | メールアドレス |
| `password_hash` | TEXT | NOT NULL | パスワードのハッシュ |
| `name` | TEXT |  | ユーザー名 (NULL可) |
| `created_at` | TEXT | NOT NULL | 作成日時 (ISO 8601形式) |
| `updated_at` | TEXT | NOT NULL | 更新日時 (ISO 8601形式) |

### 6. `user_itineraries` (ユーザー-旅行計画関連テーブル)
ユーザーと旅行計画の関連を格納するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| `user_id` | TEXT | NOT NULL, FOREIGN KEY | ユーザーのID |
| `itinerary_id` | TEXT | NOT NULL, FOREIGN KEY | 旅行計画のID |
| `role` | TEXT |  | ユーザーの役割 |
| `created_at` | TEXT | NOT NULL | 関連作成日時 (ISO 8601形式) |

## リレーションシップ

- `timeline_items.itinerary_id` → `itineraries.id`
- `packing_items.itinerary_id` → `itineraries.id`
- `budget_items.itinerary_id` → `itineraries.id`
- `user_itineraries.user_id` → `users.id`
- `user_itineraries.itinerary_id` → `itineraries.id`

## 備考

- すべてのテーブルでUUIDを主キーとして使用しています。
- 日時フィールドはISO 8601形式の文字列として格納されています。
- 外部キー制約はAPIコードから推測されたもので、実際のデータベーススキーマでは適切に設定されている必要があります。
- この設計はCloudflare D1 (SQLiteベース) を想定しています。
