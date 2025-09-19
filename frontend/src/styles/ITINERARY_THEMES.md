# しおりテーマシステム

このプロジェクトでは、しおり（旅行計画）ごとに異なるデザインテーマを適用できるシステムを実装しています。

## 利用可能なしおりテーマ

### 🏖️ Travel テーマ
- **用途**: 一般的な旅行・観光
- **カラー**: 明るいオレンジとイエロー系
- **特徴**: アクティブで明るい印象

### 💼 Business テーマ
- **用途**: 出張・ビジネストリップ
- **カラー**: グレーとネイビー系
- **特徴**: 落ち着いていて洗練された印象

### ⚪ Minimalist テーマ
- **用途**: シンプルを好む場合
- **カラー**: モノクロとグレースケール
- **特徴**: ミニマルで清潔感のある印象

### 🌿 Nature テーマ
- **用途**: アウトドア・自然体験
- **カラー**: 緑とアースカラー系
- **特徴**: 自然的で穏やかな印象

## 技術的な実装

### CSS変数システム
各テーマは`:root.itinerary-[テーマ名]`でCSS変数を定義：

```css
:root.itinerary-travel {
  --bg-primary: #fef3c7;
  --primary: #f59e0b;
  --text-primary: #78350f;
  /* ... その他の変数 */
}
```

### Tailwind CSS統合
CSS変数がTailwind CSSクラスにマッピングされています：

```typescript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: 'var(--primary)',
    hover: 'var(--primary-hover)',
  },
  'bg-primary': 'var(--bg-primary)',
  'text-primary': 'var(--text-primary)',
}
```

### 使用方法

#### 1. しおりテーマの設定
```typescript
import { itineraryTheme } from '$lib/stores/itineraryTheme';

// テーマを設定
itineraryTheme.set('travel');

// しおりデータからテーマを初期化
itineraryTheme.init(itinerary.theme);
```

#### 2. テーマセレクターコンポーネント
```svelte
<script>
  import ItineraryThemeSelector from '$lib/components/ItineraryThemeSelector.svelte';
</script>

<ItineraryThemeSelector />
```

#### 3. Tailwind CSSクラスでスタイリング
```svelte
<!-- テーマに応じて自動的に色が変わる -->
<div class="bg-bg-primary text-text-primary border border-border">
  <h1 class="text-primary">タイトル</h1>
  <button class="bg-primary hover:bg-primary-hover text-white">
    ボタン
  </button>
</div>
```

## しおりデータとテーマの紐づけ

### データベース構造
```sql
CREATE TABLE itineraries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT DEFAULT 'travel', -- テーマ情報
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### しおりのテーマ管理
しおりごとにテーマが保存され、ページ読み込み時に自動的に適用されます：

```typescript
onMount(async () => {
  const response = await fetch(`/api/itineraries/${itineraryId}`);
  const data = await response.json();

  itinerary = data.itinerary;

  // しおりのテーマを適用
  if (itinerary.theme) {
    itineraryTheme.init(itinerary.theme);
  }
});
```

## メリット

1. **コンテキスト適応性**: 旅行の種類に応じた適切なデザイン
2. **一貫性**: 同じしおり内では常に統一されたテーマ
3. **保守性**: CSS変数による集中管理
4. **拡張性**: 新しいテーマを簡単に追加可能
5. **パフォーマンス**: CSSレベルでの切り替えで高速

## 新しいテーマの追加方法

1. **CSSファイル作成**
```css
/* src/styles/themes/itinerary-newtheme.css */
:root.itinerary-newtheme {
  --bg-primary: #your-color;
  --primary: #your-primary-color;
  /* 必要な変数を定義 */
}
```

2. **app.cssでインポート**
```css
@import './styles/themes/itinerary-newtheme.css';
```

3. **ストアに追加**
```typescript
// src/lib/stores/itineraryTheme.ts
export type ItineraryTheme = 'travel' | 'business' | 'minimalist' | 'nature' | 'newtheme';

export const itineraryThemes = {
  // ...existing themes
  newtheme: {
    name: '新テーマ',
    description: '新しいテーマの説明',
    icon: '🎨',
    primaryColor: '#your-color'
  }
} as const;
```

これにより、各しおりが独自のビジュアルアイデンティティを持ち、ユーザーが旅行の性質に応じて最適なデザインを選択できます。
