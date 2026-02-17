SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
NPM ?= npm
PYTHON ?= mise exec python@3.11 -- python
PIP ?= pip3
TOOLCHAIN_CHECK_SCRIPT := scripts/check_toolchain.py

WEB_DIR := apps/web
WEB_MAKE := $(MAKE) -C $(WEB_DIR)
CHAT_DIR := services/chat
CHAT_MAKE := $(MAKE) -C $(CHAT_DIR)

.DEFAULT_GOAL := help

.PHONY: help toolchain-doctor setup setup-chat sync-web-env dev dev-web dev-chat up down migrate prisma-generate lint typecheck test test-web test-chat test-chat-integration build quick-ci quick-ci-web quick-ci-chat docs-check ci

help: ## Show available tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nAvailable tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

toolchain-doctor: ## Verify local toolchain matches project baseline
	$(PYTHON) $(TOOLCHAIN_CHECK_SCRIPT)

setup: ## Install web dependencies
	$(WEB_MAKE) setup

sync-web-env: ## Sync root .env into apps/web/.env when present
	$(WEB_MAKE) sync-env

setup-chat: ## Install chat dependencies in the active Python environment
	$(CHAT_MAKE) setup

dev: ## Run web locally with db+chat in Docker
	$(MAKE) sync-web-env
	$(DOCKER_COMPOSE) up -d db chat
	$(WEB_MAKE) dev

dev-web: ## Run only the web app
	$(WEB_MAKE) dev

dev-chat: ## Run chat service locally with hot reload
	$(CHAT_MAKE) dev

up: ## Start all Docker services
	$(DOCKER_COMPOSE) up -d

down: ## Stop all Docker services
	$(DOCKER_COMPOSE) down

migrate: ## Run Prisma migrations using DATABASE_URL
	$(WEB_MAKE) migrate

prisma-generate: ## Generate Prisma client for the web app
	$(WEB_MAKE) prisma-generate

lint: ## Lint web app
	$(WEB_MAKE) lint

typecheck: ## Type-check web app
	$(WEB_MAKE) typecheck

test: ## Run web tests and chat unit tests
	$(MAKE) test-web
	$(MAKE) test-chat

test-web: ## Run web tests
	$(WEB_MAKE) test

test-chat: ## Run chat unit tests
	$(CHAT_MAKE) test

test-chat-integration: ## Run chat integration tests (requires SERVICE_URL)
	$(CHAT_MAKE) test-integration

build: ## Build web app
	$(WEB_MAKE) build

quick-ci-web: ## Fast web checks (no build)
	$(WEB_MAKE) quick-ci

quick-ci-chat: ## Fast chat checks
	$(CHAT_MAKE) quick-ci

quick-ci: ## Fast local checks for web + chat (no web build)
	$(MAKE) toolchain-doctor
	$(MAKE) quick-ci-web
	$(MAKE) quick-ci-chat

docs-check: ## Validate docs links
	$(PYTHON) scripts/verify_docs.py

ci: ## Run local CI checks
	$(MAKE) quick-ci
	$(MAKE) build
	$(MAKE) docs-check
