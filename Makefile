SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
NPM ?= npm
PYTHON ?= python3
PIP ?= pip3

CHAT_DIR := services/chat
CHAT_SRC_DIR := $(CHAT_DIR)/src/api

.DEFAULT_GOAL := help

.PHONY: help setup setup-chat dev dev-web dev-chat up down migrate lint typecheck test test-web test-chat test-chat-integration build docs-check ci

help: ## Show available tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nAvailable tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

setup: ## Install web dependencies
	$(NPM) ci

setup-chat: ## Install chat dependencies in the active Python environment
	$(PIP) install -r $(CHAT_SRC_DIR)/requirements.txt
	$(PIP) install -r $(CHAT_DIR)/tests/requirements-test.txt
	$(PIP) install httpx pytest-cov prisma

dev: ## Run web locally with db+chat in Docker
	$(DOCKER_COMPOSE) up -d db chat
	$(NPM) run dev

dev-web: ## Run only the web app
	$(NPM) run dev

dev-chat: ## Run chat service locally with hot reload
	cd $(CHAT_SRC_DIR) && uvicorn main:app --reload --host 0.0.0.0 --port 8000

up: ## Start all Docker services
	$(DOCKER_COMPOSE) up -d

down: ## Stop all Docker services
	$(DOCKER_COMPOSE) down

migrate: ## Run Prisma migrations using DATABASE_URL
	npx prisma migrate dev

lint: ## Lint web app
	$(NPM) run lint

typecheck: ## Type-check web app
	npx tsc --noEmit

test: ## Run web tests and chat unit tests
	$(MAKE) test-web
	$(MAKE) test-chat

test-web: ## Run web tests
	$(NPM) run test

test-chat: ## Run chat unit tests
	cd $(CHAT_DIR) && pytest tests/unit/ --cov=src/api --cov-report=term-missing -v

test-chat-integration: ## Run chat integration tests (requires SERVICE_URL)
	cd $(CHAT_DIR) && pytest tests/integration/ -v

build: ## Build web app
	$(NPM) run build

docs-check: ## Validate docs links
	$(PYTHON) scripts/verify_docs.py

ci: ## Run local CI checks
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test
	$(MAKE) build
	$(MAKE) docs-check
