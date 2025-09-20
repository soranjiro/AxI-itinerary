# テーマシステム

このプロジェクトでは、CSS変数を使ったテーマシステムを採用しています。テーマを変更することで、アプリ全体の色やスタイルを簡単に切り替えることができます。

## ファイル構成

```
src/styles/
├── themes/
│   ├── variables.css    # ライトテーマ（デフォルト）の変数定義
│   ├── dark.css        # ダークテーマの変数定義
│   └── seaside.css     # シーサイドテーマの変数定義
├── components.css      # コンポーネントスタイル
└── examples.html       # 使用例
```

## 利用可能なテーマ

- **Light** (デフォルト): 明るいテーマ
- **Dark**: ダークテーマ
- **Seaside**: 海をイメージした青基調のテーマ
- **Auto**: システム設定に従って自動切り替え

## 使用方法

### 1. Tailwind CSSクラスで使用

```html
<!-- 背景色 -->
<div class="bg-bg-primary">プライマリ背景</div>
<div class="bg-bg-secondary">セカンダリ背景</div>

<!-- テキスト色 -->
<p class="text-text-primary">プライマリテキスト</p>
<p class="text-text-secondary">セカンダリテキスト</p>

<!-- アクセント色 -->
<button class="bg-primary hover:bg-primary-hover text-primary-text">ボタン</button>

<!-- カード -->
<div class="bg-card-bg border border-card-border shadow-custom-md">カード</div>
```

### 2. CSS変数を直接使用

```css
.custom-element {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}
```

### 3. テーマ切り替え

```svelte
<script>
  import { theme } from '$lib/stores/theme';
  import ThemeSelector from '$lib/components/ThemeSelector.svelte';

  // テーマを直接設定
  theme.set('dark');
</script>

<!-- テーマセレクターコンポーネントを使用 -->
<ThemeSelector />
```

## 利用可能なCSS変数

### 背景色
- `--bg-primary`: プライマリ背景
- `--bg-secondary`: セカンダリ背景
- `--bg-tertiary`: ターシャリ背景
- `--bg-gradient`: グラデーション背景

### テキスト色
- `--text-primary`: プライマリテキスト
- `--text-secondary`: セカンダリテキスト
- `--text-muted`: ミュートテキスト

### アクセント色
- `--primary`, `--primary-hover`, `--primary-light`
- `--secondary`, `--secondary-hover`, `--secondary-light`
- `--success`, `--success-hover`, `--success-light`
- `--warning`, `--warning-hover`, `--warning-light`
- `--danger`, `--danger-hover`, `--danger-light`

### ボーダー
- `--border-color`: デフォルトボーダー
- `--border-hover`: ホバー時のボーダー
- `--border-focus`: フォーカス時のボーダー

### シャドウ
- `--shadow-sm`: 小さなシャドウ
- `--shadow-md`: 中くらいのシャドウ
- `--shadow-lg`: 大きなシャドウ

### カード
- `--card-bg`: カード背景
- `--card-border`: カードボーダー

## 新しいテーマの追加

1. `src/styles/themes/` に新しいCSSファイルを作成
2. `:root.テーマ名` でCSS変数を定義
3. `app.css` でインポート
4. `theme.ts` の `Theme` 型に追加
5. `ThemeSelector.svelte` のテーマリストに追加

例:
```css
/* src/styles/themes/forest.css */
:root.forest {
  --bg-primary: #f0f9f0;
  --primary: #22c55e;
  /* その他の変数... */
}
```

## メリット

- **一貫性**: 全体で統一されたテーマシステム
- **保守性**: CSS変数を変更するだけでテーマを更新
- **拡張性**: 新しいテーマを簡単に追加
- **パフォーマンス**: CSSの再コンパイルが不要
- **デベロッパーエクスペリエンス**: Tailwind CSSとの組み合わせで効率的な開発
