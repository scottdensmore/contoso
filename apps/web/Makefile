SHELL := /bin/bash

NPM ?= npm

.DEFAULT_GOAL := help

.PHONY: help setup sync-env dev lint typecheck test build migrate migrate-deploy prisma-generate quick-ci ci

help: ## Show available web-app tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nWeb app tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-20s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

setup: ## Install web dependencies and generate Prisma client
	$(NPM) ci --workspaces=false --include=dev --no-audit --no-fund
	$(MAKE) prisma-generate

sync-env: ## Sync repo root .env into apps/web/.env when present
	@if [ -f ../.env ]; then cp ../.env .env; fi

dev: ## Run web app locally with hot reload
	$(MAKE) sync-env
	$(NPM) run dev

lint: ## Lint web app
	$(MAKE) sync-env
	$(NPM) run lint

# Two configs: the app's, and the specs'. The specs run in Node and the browser
# rather than the Next runtime, so they need a different target -- see
# tsconfig.e2e.json. Without the second line nothing here opens them.
typecheck: ## Type-check web app and the Playwright specs
	$(MAKE) sync-env
	$(MAKE) prisma-generate
	./node_modules/.bin/tsc --noEmit
	./node_modules/.bin/tsc --noEmit -p tsconfig.e2e.json
	node scripts/check-journey-coverage.mjs

test: ## Run web tests
	$(MAKE) sync-env
	$(NPM) run test

test-e2e: ## Run Playwright journeys against a running stack (see E2E_BASE_URL)
	$(NPM) run test:e2e

install-e2e-browsers: ## Install the browser Playwright drives
	$(NPM) exec -- playwright install --with-deps chromium

build: ## Build web app
	$(MAKE) sync-env
	$(MAKE) prisma-generate
	$(NPM) run build

migrate-deploy: ## Apply pending migrations without authoring one
	npx prisma migrate deploy --schema prisma/schema.prisma

migrate: ## Author a new migration from a schema change (set NAME=<migration-name>)
	@test -n "$(NAME)" || { \
		echo "migrate: set NAME=<migration-name>, e.g. make migrate NAME=add-order-status"; \
		echo "Without it, prisma migrate dev prompts for a name and cannot run unattended."; \
		exit 2; \
	}
	npx prisma migrate dev --schema prisma/schema.prisma --name $(NAME)

prisma-generate: ## Generate Prisma client
	npx prisma generate --generator client --schema prisma/schema.prisma

quick-ci: ## Fast local checks (no build)
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test

ci: ## Web merge-gate checks
	$(MAKE) quick-ci
	$(MAKE) build
