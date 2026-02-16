SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
NPM ?= npm
PYTHON ?= python3
PIP ?= pip3

WEB_DIR := apps/web
CHAT_DIR := services/chat
CHAT_MAKE := $(MAKE) -C $(CHAT_DIR)

.DEFAULT_GOAL := help

.PHONY: help setup setup-chat sync-web-env dev dev-web dev-chat up down migrate prisma-generate lint typecheck test test-web test-chat test-chat-integration build quick-ci quick-ci-web quick-ci-chat docs-check ci

help: ## Show available tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nAvailable tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

setup: ## Install web dependencies
	$(NPM) --prefix $(WEB_DIR) ci
	$(MAKE) prisma-generate

sync-web-env: ## Sync root .env into apps/web/.env when present
	@if [ -f .env ]; then cp .env $(WEB_DIR)/.env; fi

setup-chat: ## Install chat dependencies in the active Python environment
	$(CHAT_MAKE) setup

dev: ## Run web locally with db+chat in Docker
	$(MAKE) sync-web-env
	$(DOCKER_COMPOSE) up -d db chat
	$(NPM) --prefix $(WEB_DIR) run dev

dev-web: ## Run only the web app
	$(MAKE) sync-web-env
	$(NPM) --prefix $(WEB_DIR) run dev

dev-chat: ## Run chat service locally with hot reload
	$(CHAT_MAKE) dev

up: ## Start all Docker services
	$(DOCKER_COMPOSE) up -d

down: ## Stop all Docker services
	$(DOCKER_COMPOSE) down

migrate: ## Run Prisma migrations using DATABASE_URL
	cd $(WEB_DIR) && npx prisma migrate dev --schema prisma/schema.prisma

prisma-generate: ## Generate Prisma client for the web app
	cd $(WEB_DIR) && npx prisma generate --generator client --schema prisma/schema.prisma

lint: ## Lint web app
	$(MAKE) sync-web-env
	$(NPM) --prefix $(WEB_DIR) run lint

typecheck: ## Type-check web app
	$(MAKE) sync-web-env
	$(MAKE) prisma-generate
	cd $(WEB_DIR) && npx tsc --noEmit

test: ## Run web tests and chat unit tests
	$(MAKE) test-web
	$(MAKE) test-chat

test-web: ## Run web tests
	$(MAKE) sync-web-env
	$(NPM) --prefix $(WEB_DIR) run test

test-chat: ## Run chat unit tests
	$(CHAT_MAKE) test

test-chat-integration: ## Run chat integration tests (requires SERVICE_URL)
	$(CHAT_MAKE) test-integration

build: ## Build web app
	$(MAKE) sync-web-env
	$(MAKE) prisma-generate
	$(NPM) --prefix $(WEB_DIR) run build

quick-ci-web: ## Fast web checks (no build)
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test-web

quick-ci-chat: ## Fast chat checks
	$(CHAT_MAKE) quick-ci

quick-ci: ## Fast local checks for common iteration loop
	$(MAKE) quick-ci-web

docs-check: ## Validate docs links
	$(PYTHON) scripts/verify_docs.py

ci: ## Run local CI checks
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) build
	$(MAKE) docs-check
