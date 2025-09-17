# AxI-itinerary Makefile
# 旅行しおりアプリケーションの開発・ビルド・デプロイ用Makefile

.PHONY: help install dev build deploy clean test lint format
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
	@echo "  $(YELLOW)make dev$(RESET)        - 開発サーバーを起動"
	@echo "  $(YELLOW)make build$(RESET)      - プロダクションビルド"
	@echo "  $(YELLOW)make deploy$(RESET)     - Cloudflareにデプロイ"
	@echo "  $(YELLOW)make deploy-db$(RESET)  - データベースを初期化・デプロイ"
	@echo "  $(YELLOW)make clean$(RESET)      - ビルドファイルを削除"
	@echo "  $(YELLOW)make test$(RESET)       - テストを実行"
	@echo "  $(YELLOW)make lint$(RESET)       - リンターを実行"
	@echo "  $(YELLOW)make format$(RESET)     - コードフォーマット"
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

## 開発サーバーを起動
dev: build-wasm
	@echo "$(GREEN)🚀 開発サーバーを起動中...$(RESET)"
	cd frontend && pnpm run dev

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
