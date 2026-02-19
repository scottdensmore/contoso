SHELL := /bin/bash

NPM ?= npm

.DEFAULT_GOAL := help

.PHONY: help setup sync-env dev lint typecheck test build migrate prisma-generate quick-ci ci

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

typecheck: ## Type-check web app
	$(MAKE) sync-env
	$(MAKE) prisma-generate
	npx tsc --noEmit

test: ## Run web tests
	$(MAKE) sync-env
	$(NPM) run test

build: ## Build web app
	$(MAKE) sync-env
	$(MAKE) prisma-generate
	$(NPM) run build

migrate: ## Run Prisma migrations using DATABASE_URL
	npx prisma migrate dev --schema prisma/schema.prisma

prisma-generate: ## Generate Prisma client
	npx prisma generate --generator client --schema prisma/schema.prisma

quick-ci: ## Fast local checks (no build)
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test

ci: ## Web merge-gate checks
	$(MAKE) quick-ci
	$(MAKE) build
