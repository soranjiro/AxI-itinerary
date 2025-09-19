# AxI-itinerary Makefile
# 旅行しおりアプリケーションの開発・ビルド・デプロイ用Makefile

.PHONY: help install dev dev-vite dev-d1 build build-wasm deploy deploy-db deploy-full preview clean test lint format setup logs status env-setup db-status db-tables db-data db-itineraries db-users db-clean
.DEFAULT_GOAL := help

# カラー定義
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

## ヘルプ - 利用可能なコマンドを表示
help:
	@echo "$(BLUE)AxI-itinerary 開発環境$(RESET)"
	@echo ""
	@echo "$(GREEN)利用可能なコマンド:$(RESET)"
	@echo "  $(YELLOW)make install$(RESET)    - 依存関係をインストール"
	@echo "  $(YELLOW)make dev$(RESET)        - 完全なローカル開発環境（D1データベース付き）"
	@echo "  $(YELLOW)make dev-vite$(RESET)   - Vite開発サーバーのみ（軽量）"
	@echo "  $(YELLOW)make dev-d1$(RESET)     - D1データベース開発サーバー（別名）"
	@echo "  $(YELLOW)make build$(RESET)      - プロダクションビルド"
	@echo "  $(YELLOW)make deploy$(RESET)     - Cloudflareにデプロイ"
	@echo "  $(YELLOW)make deploy-db$(RESET)  - データベースを初期化・デプロイ"
	@echo "  $(YELLOW)make clean$(RESET)      - ビルドファイルを削除"
	@echo "  $(YELLOW)make test$(RESET)       - テストを実行"
	@echo "  $(YELLOW)make lint$(RESET)       - リンターを実行"
	@echo "  $(YELLOW)make format$(RESET)     - コードフォーマット"
	@echo ""
	@echo "$(GREEN)データベース確認コマンド:$(RESET)"
	@echo "  $(YELLOW)make db-status$(RESET)     - データベース状態確認"
	@echo "  $(YELLOW)make db-tables$(RESET)     - テーブル一覧表示"
	@echo "  $(YELLOW)make db-data$(RESET)       - 全テーブルのデータ表示"
	@echo "  $(YELLOW)make db-itineraries$(RESET) - 旅行データ表示"
	@echo "  $(YELLOW)make db-users$(RESET)       - ユーザー一覧表示"
	@echo "  $(YELLOW)make db-clean$(RESET)       - データベースクリーンアップ"
	@echo ""

## 依存関係をインストール
install:
	@echo "$(GREEN)📦 依存関係をインストール中...$(RESET)"
	@# Rustターゲットの追加
	rustup target add wasm32-unknown-unknown
	@# wasm-packがない場合はインストール
	@if ! command -v wasm-pack &> /dev/null; then \
		echo "$(YELLOW)wasm-packをインストール中...$(RESET)"; \
		cargo install wasm-pack; \
	fi
	@# pnpmがない場合はインストール
	@if ! command -v pnpm &> /dev/null; then \
		echo "$(YELLOW)pnpmをインストール中...$(RESET)"; \
		npm install -g pnpm; \
	fi
	@# フロントエンドの依存関係をインストール
	cd frontend && pnpm install
	@# Wranglerがない場合はインストール
	@if ! command -v wrangler &> /dev/null; then \
		echo "$(YELLOW)Wranglerをインストール中...$(RESET)"; \
		npm install -g wrangler; \
	fi
	@echo "$(GREEN)✅ 依存関係のインストール完了$(RESET)"

## 完全なローカル開発環境（D1データベース付き）
dev: build-wasm build-frontend-for-d1
	@echo "$(GREEN)🚀 完全なローカル開発環境を起動中（D1データベース付き）...$(RESET)"
	@echo "$(BLUE)🌐 自動でブラウザを開きます...$(RESET)"
	@echo "$(YELLOW)💡 フルスタック機能: ✅ D1データベース ✅ API ✅ 認証 ✅ リアルタイム$(RESET)"
	@# バックグラウンドでブラウザを開く処理を開始
	@(sleep 4 && open http://localhost:8788 2>/dev/null || echo "$(YELLOW)手動でブラウザを開いてください: http://localhost:8788$(RESET)") &
	@# D1サーバーを起動（フォアグラウンド）
	wrangler pages dev frontend/.svelte-kit/cloudflare --compatibility-date 2024-09-17 --compatibility-flags nodejs_compat

## D1データベース開発サーバー（dev の別名）
dev-d1: dev

## D1用のフロントエンドビルド
build-frontend-for-d1:
	@echo "$(GREEN)🏗️  D1用フロントエンドビルド中...$(RESET)"
	@if [ ! -d "frontend/.svelte-kit/cloudflare" ]; then \
		echo "$(YELLOW)Cloudflareビルドが見つからないため、ビルドを実行します...$(RESET)"; \
		cd frontend && pnpm run build; \
	else \
		echo "$(GREEN)✅ Cloudflareビルドが存在します$(RESET)"; \
	fi

## 軽量開発サーバー（Viteのみ - UI開発用）
dev-vite: build-wasm
	@echo "$(GREEN)🚀 軽量開発サーバーを起動中（UI開発用）...$(RESET)"
	@echo "$(BLUE)🌐 自動でブラウザを開きます...$(RESET)"
	@echo "$(YELLOW)💡 軽量機能: ✅ ホットリロード ✅ 最新CSS ❌ データベース$(RESET)"
	@cd frontend && rm -rf .svelte-kit
	@# バックグラウンドでブラウザを開く処理を開始
	@(sleep 4 && open http://localhost:5173 2>/dev/null || echo "$(YELLOW)手動でブラウザを開いてください: http://localhost:5173$(RESET)") &
	@# 開発サーバーを起動（フォアグラウンド）
	cd frontend && pnpm run dev --host

## Rustコードをwasmにビルド（開発用）
build-wasm:
	@echo "$(GREEN)🔧 RustコードをWebAssemblyにビルド中...$(RESET)"
	cd backend && wasm-pack build --target web --out-dir ../frontend/src/lib/wasm

## プロダクションビルド
build: build-wasm
	@echo "$(GREEN)🏗️  プロダクションビルド中...$(RESET)"
	cd frontend && pnpm run build
	@echo "$(GREEN)✅ ビルド完了$(RESET)"

## データベースを作成・初期化
deploy-db:
	@echo "$(GREEN)🗄️  データベースを作成・初期化中...$(RESET)"
	@# D1データベースの作成
	wrangler d1 create axi-itinerary-db || echo "データベースは既に存在します"
	@# マイグレーションの実行
	wrangler d1 migrations apply axi-itinerary-db --local
	wrangler d1 migrations apply axi-itinerary-db --remote
	@echo "$(GREEN)✅ データベース初期化完了$(RESET)"

## Cloudflare Pagesにデプロイ
deploy: build
	@echo "$(GREEN)🚀 Cloudflareにデプロイ中...$(RESET)"
	@# Cloudflare Pagesプロジェクトの作成（存在しない場合）
	wrangler pages project create axi-itinerary || echo "プロジェクトは既に存在します"
	@# ビルドファイルをCloudflare Pagesにデプロイ
	wrangler pages deploy frontend/.svelte-kit/output/client --project-name=axi-itinerary
	@echo "$(GREEN)✅ デプロイ完了 🎉$(RESET)"
	@echo "$(BLUE)アプリケーションURL: https://axi-itinerary.pages.dev$(RESET)"

## フルデプロイ（データベース + アプリケーション）
deploy-full: deploy-db deploy
	@echo "$(GREEN)🎉 フルデプロイ完了！$(RESET)"

## ローカルでプレビュー
preview: build
	@echo "$(GREEN)👀 プロダクションビルドをプレビュー中...$(RESET)"
	cd frontend && pnpm run preview

## ビルドファイルを削除
clean:
	@echo "$(YELLOW)🧹 ビルドファイルを削除中...$(RESET)"
	rm -rf frontend/.svelte-kit
	rm -rf frontend/build
	rm -rf frontend/src/lib/wasm
	rm -rf backend/target
	rm -rf backend/pkg
	@echo "$(GREEN)✅ クリーンアップ完了$(RESET)"

## テストを実行
test:
	@echo "$(GREEN)🧪 テストを実行中...$(RESET)"
	cd backend && cargo test
	cd frontend && pnpm run test || echo "フロントエンドテストはまだ設定されていません"
	@echo "$(GREEN)✅ テスト完了$(RESET)"

## リンターを実行
lint:
	@echo "$(GREEN)🔍 リンターを実行中...$(RESET)"
	cd backend && cargo clippy -- -D warnings
	cd frontend && pnpm run lint || echo "リンターはまだ設定されていません"
	@echo "$(GREEN)✅ リント完了$(RESET)"

## コードフォーマット
format:
	@echo "$(GREEN)✨ コードをフォーマット中...$(RESET)"
	cd backend && cargo fmt
	cd frontend && pnpm run format || echo "フォーマッターはまだ設定されていません"
	@echo "$(GREEN)✅ フォーマット完了$(RESET)"

## 開発環境セットアップ（初回のみ）
setup: install deploy-db
	@echo "$(GREEN)🎯 開発環境セットアップ完了！$(RESET)"
	@echo "$(BLUE)次のコマンドで開発を開始できます: make dev$(RESET)"

## ログを確認
logs:
	@echo "$(GREEN)📋 ログを確認中...$(RESET)"
	wrangler pages deployment tail --project-name=axi-itinerary

## 本番環境の状態確認
status:
	@echo "$(GREEN)📊 本番環境の状態を確認中...$(RESET)"
	wrangler pages project list
	wrangler d1 list

## 環境変数の設定
env-setup:
	@echo "$(GREEN)⚙️  環境変数を設定中...$(RESET)"
	@echo "$(YELLOW).env.example を参考に環境変数を設定してください$(RESET)"
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@echo "$(BLUE).env ファイルを作成しました。必要に応じて編集してください。$(RESET)"

# =============================================================================
# データベース確認コマンド
# =============================================================================

## データベース状態確認
db-status:
	@echo "$(GREEN)📊 データベース状態を確認中...$(RESET)"
	@echo "$(YELLOW)ローカル D1 データベース:$(RESET)"
	@if [ -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" ]; then \
		echo "📁 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite"; \
		echo "📏 サイズ: $$(du -h ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" | cut -f1)"; \
	else \
		echo "❌ ローカル D1 データベースが見つかりません"; \
	fi
	@echo ""
	@echo "$(YELLOW)Wrangler D1 データベース:$(RESET)"
	@wrangler d1 list 2>/dev/null || echo "❌ Wrangler D1 データベースが見つかりません"

## テーブル一覧表示
db-tables:
	@echo "$(GREEN)📋 テーブル一覧を表示中...$(RESET)"
	@if [ -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" ]; then \
		echo "$(YELLOW)ローカル D1 データベース:$(RESET)"; \
		TABLES=$$(sqlite3 ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" ".tables" 2>/dev/null); \
		if [ -n "$$TABLES" ]; then \
			echo "$$TABLES" | tr ' ' '\n' | grep -v '^$$' | while read table; do echo "  📋 $$table"; done; \
		else \
			echo "❌ テーブルが見つかりません"; \
		fi; \
	else \
		echo "❌ ローカル D1 データベースが見つかりません"; \
	fi

## 全テーブルのデータ表示
db-data:
	@echo "$(GREEN)📊 全テーブルのデータを表示中...$(RESET)"
	@if [ -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" ]; then \
		for table in itineraries timeline_items packing_items budget_items users user_itineraries chat_messages; do \
			echo ""; \
			echo "$(BLUE)=== $$table ===$(RESET)"; \
			count=$$(sqlite3 ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" "SELECT COUNT(*) FROM $$table;" 2>/dev/null); \
			if [ "$$count" -gt 0 ]; then \
				sqlite3 ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" "SELECT * FROM $$table LIMIT 5;" 2>/dev/null; \
				if [ "$$count" -gt 5 ]; then \
					echo "$(YELLOW)... 他 $$((count-5)) 件$(RESET)"; \
				fi; \
			else \
				echo "$(YELLOW)データなし$(RESET)"; \
			fi; \
		done; \
	else \
		echo "❌ ローカル D1 データベースが見つかりません"; \
	fi

## 旅行データ表示
db-itineraries:
	@echo "$(GREEN)📋 旅行データを表示中...$(RESET)"
	@if [ -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" ]; then \
		count=$$(sqlite3 ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" "SELECT COUNT(*) FROM itineraries;" 2>/dev/null); \
		if [ "$$count" -gt 0 ]; then \
			echo ""; \
			echo "$(BLUE)旅行データ ($$count 件):$(RESET)"; \
			sqlite3 ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" "SELECT id, title, description, theme, created_at FROM itineraries ORDER BY created_at DESC;" 2>/dev/null; \
		else \
			echo "$(YELLOW)旅行データなし$(RESET)"; \
		fi; \
	else \
		echo "❌ ローカル D1 データベースが見つかりません"; \
	fi

## ユーザー一覧表示
db-users:
	@echo "$(GREEN)👥 ユーザー一覧を表示中...$(RESET)"
	@if [ -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" ]; then \
		count=$$(sqlite3 ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" "SELECT COUNT(*) FROM users;" 2>/dev/null); \
		if [ "$$count" -gt 0 ]; then \
			echo ""; \
			echo "$(BLUE)ユーザー一覧 ($$count 件):$(RESET)"; \
			echo "$(YELLOW)ID | Email | Name | Created$(RESET)"; \
			echo "$(YELLOW)---|-------|------|--------$(RESET)"; \
			sqlite3 ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" "SELECT id, email, name, created_at FROM users ORDER BY created_at DESC;" 2>/dev/null | while IFS='|' read -r id email name created; do \
				echo "$$(echo $$id | cut -c1-8)... | $$email | $$name | $$(echo $$created | cut -d'T' -f1)"; \
			done; \
		else \
			echo "$(YELLOW)ユーザーなし$(RESET)"; \
		fi; \
	else \
		echo "❌ ローカル D1 データベースが見つかりません"; \
	fi

## データベースクリーンアップ
db-clean:
	@echo "$(RED)🗑️  データベースをクリーンアップ中...$(RESET)"
	@echo "$(YELLOW)注意: この操作は取り消せません！$(RESET)"
	@read -p "本当にローカル D1 データベースを削除しますか？ (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		if [ -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite" ]; then \
			rm -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/bd861069eb23128e9d4bd003b52b3dcf854af88b145490dd1b5d33d517db984f.sqlite"* && echo "$(GREEN)✅ ローカル D1 データベースを削除しました$(RESET)"; \
		else \
			echo "❌ 削除対象が見つかりません"; \
		fi; \
	else \
		echo "$(BLUE)キャンセルしました$(RESET)"; \
	fi
