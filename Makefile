SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
NPM ?= npm
PYTHON ?= python3
PIP ?= pip3

WEB_DIR := apps/web
CHAT_DIR := services/chat
CHAT_SRC_DIR := $(CHAT_DIR)/src/api

.DEFAULT_GOAL := help

.PHONY: help setup setup-chat sync-web-env dev dev-web dev-chat up down migrate prisma-generate lint typecheck test test-web test-chat test-chat-integration build docs-check ci

help: ## Show available tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nAvailable tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

setup: ## Install web dependencies
	$(NPM) --prefix $(WEB_DIR) ci
	$(MAKE) prisma-generate

sync-web-env: ## Sync root .env into apps/web/.env when present
	@if [ -f .env ]; then cp .env $(WEB_DIR)/.env; fi

setup-chat: ## Install chat dependencies in the active Python environment
	$(PIP) install -r $(CHAT_SRC_DIR)/requirements.txt
	$(PIP) install -r $(CHAT_DIR)/tests/requirements-test.txt
	$(PIP) install httpx pytest-cov prisma

dev: ## Run web locally with db+chat in Docker
	$(MAKE) sync-web-env
	$(DOCKER_COMPOSE) up -d db chat
	$(NPM) --prefix $(WEB_DIR) run dev

dev-web: ## Run only the web app
	$(MAKE) sync-web-env
	$(NPM) --prefix $(WEB_DIR) run dev

dev-chat: ## Run chat service locally with hot reload
	cd $(CHAT_SRC_DIR) && uvicorn main:app --reload --host 0.0.0.0 --port 8000

up: ## Start all Docker services
	$(DOCKER_COMPOSE) up -d

down: ## Stop all Docker services
	$(DOCKER_COMPOSE) down

migrate: ## Run Prisma migrations using DATABASE_URL
	cd $(WEB_DIR) && npx prisma migrate dev --schema ../../prisma/schema.prisma

prisma-generate: ## Generate Prisma client for the web app
	mkdir -p $(WEB_DIR)/prisma
	cp prisma/schema.prisma $(WEB_DIR)/prisma/schema.prisma
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
	cd $(CHAT_DIR) && pytest tests/unit/ --cov=src/api --cov-report=term-missing -v

test-chat-integration: ## Run chat integration tests (requires SERVICE_URL)
	cd $(CHAT_DIR) && pytest tests/integration/ -v

build: ## Build web app
	$(MAKE) sync-web-env
	$(MAKE) prisma-generate
	$(NPM) --prefix $(WEB_DIR) run build

docs-check: ## Validate docs links
	$(PYTHON) scripts/verify_docs.py

ci: ## Run local CI checks
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) build
	$(MAKE) docs-check
