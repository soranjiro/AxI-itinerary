.PHONY: build deploy dev

build:
	pnpm run build

deploy:
	pnpm run build && wrangler deploy

dev:
	pnpm run dev:full

migrations:
	npx wrangler d1 migrations list --database axi-itinerary-db
	npx wrangler d1 migrations apply --database axi-itinerary-db
