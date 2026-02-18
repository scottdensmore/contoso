SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
NPM ?= npm
PYTHON ?= mise exec python@3.11 -- python
PIP ?= pip3
TOOLCHAIN_CHECK_SCRIPT := scripts/check_toolchain.py
AGENT_DOCTOR_SCRIPT := scripts/agent_doctor.py
ENV_CONTRACT_CHECK_SCRIPT := scripts/check_env_contract.py
CHANGED_SURFACES_SCRIPT := scripts/detect_changed_surfaces.py
RELEASE_DRY_RUN_SCRIPT := scripts/release_dry_run.py
E2E_SMOKE_SCRIPT := scripts/e2e_smoke.py
E2E_SMOKE_TIMEOUT ?= 240
E2E_COMPOSE_UP_FLAGS ?= -d --build --force-recreate
E2E_LOG_TAIL ?= 200
CHAT_INSTALL_LOCAL_STACK ?= 0

WEB_DIR := apps/web
WEB_MAKE := $(MAKE) -C $(WEB_DIR)
CHAT_DIR := services/chat
CHAT_MAKE := $(MAKE) -C $(CHAT_DIR)
WEB_PRISMA_SCHEMA := $(WEB_DIR)/prisma/schema.prisma

ENV_FILE := .env
ENV_TEMPLATE := .env.example
CHAT_ENV_FILE := $(CHAT_DIR)/.env
CHAT_ENV_TEMPLATE := $(CHAT_DIR)/.env.example

.DEFAULT_GOAL := help

.PHONY: help toolchain-doctor env-contract-check agent-doctor env-init bootstrap setup setup-chat sync-web-env dev dev-web dev-chat up down migrate prisma-generate prisma-generate-chat lint typecheck test test-scripts test-web test-chat test-chat-integration build quick-ci quick-ci-changed quick-ci-web quick-ci-chat e2e-smoke e2e-smoke-lite release-dry-run docs-check ci

help: ## Show available tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nAvailable tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

toolchain-doctor: ## Verify local toolchain matches project baseline
	$(PYTHON) $(TOOLCHAIN_CHECK_SCRIPT)

env-contract-check: ## Verify env contract matches templates and docs
	$(PYTHON) $(ENV_CONTRACT_CHECK_SCRIPT)

agent-doctor: ## Verify agent-local environment is fully ready
	$(PYTHON) $(AGENT_DOCTOR_SCRIPT)

env-init: ## Create local .env files from templates when missing
	@if [ ! -f "$(ENV_FILE)" ]; then cp "$(ENV_TEMPLATE)" "$(ENV_FILE)"; echo "Created $(ENV_FILE) from $(ENV_TEMPLATE)."; else echo "$(ENV_FILE) already exists."; fi
	@if [ ! -f "$(CHAT_ENV_FILE)" ]; then cp "$(CHAT_ENV_TEMPLATE)" "$(CHAT_ENV_FILE)"; echo "Created $(CHAT_ENV_FILE) from $(CHAT_ENV_TEMPLATE)."; else echo "$(CHAT_ENV_FILE) already exists."; fi

bootstrap: ## One-command bootstrap for local and coding-agent development
	$(MAKE) toolchain-doctor
	$(MAKE) env-contract-check
	$(MAKE) env-init
	$(MAKE) setup
	$(MAKE) setup-chat
	$(MAKE) prisma-generate-chat
	$(MAKE) sync-web-env
	$(MAKE) agent-doctor

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

prisma-generate-chat: ## Generate Prisma client for the chat Python runtime
	$(PYTHON) -m prisma py generate --schema=$(WEB_PRISMA_SCHEMA) --generator pyclient

lint: ## Lint web app
	$(WEB_MAKE) lint

typecheck: ## Type-check web app
	$(WEB_MAKE) typecheck

test: ## Run web tests and chat unit tests
	$(MAKE) test-web
	$(MAKE) test-chat

test-scripts: ## Run root script guardrail tests
	$(PYTHON) -m unittest discover -s tests/scripts -p "test_*.py" -v

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
	$(MAKE) env-contract-check
	$(MAKE) quick-ci-web
	$(MAKE) quick-ci-chat

quick-ci-changed: ## Fast local checks scoped to changed files (set CHANGED_BASE/CHANGED_HEAD for git range)
	@set -euo pipefail; \
	TARGETS="$$(CHANGED_BASE="$(CHANGED_BASE)" CHANGED_HEAD="$(CHANGED_HEAD)" $(PYTHON) $(CHANGED_SURFACES_SCRIPT) --print-targets)"; \
	if [ -z "$$TARGETS" ]; then \
		echo "No scoped checks required for current changes."; \
		exit 0; \
	fi; \
	echo "Running changed-scope checks: $$TARGETS"; \
	for target in $$TARGETS; do \
		$(MAKE) $$target; \
	done

e2e-smoke: ## Run dockerized end-to-end smoke check (web -> chat -> db)
	@set -euo pipefail; \
	keep_stack="$(KEEP_STACK)"; \
	cleanup() { \
		status="$$1"; \
		if [ "$$status" -ne 0 ]; then \
			echo "E2E smoke failed; recent compose logs:"; \
			$(DOCKER_COMPOSE) ps || true; \
			$(DOCKER_COMPOSE) logs --no-color --tail=$(E2E_LOG_TAIL) db chat web || true; \
		fi; \
		if [ "$$keep_stack" != "1" ]; then \
			$(DOCKER_COMPOSE) down --volumes --remove-orphans || true; \
		fi; \
		exit "$$status"; \
	}; \
	trap 'cleanup $$?' EXIT; \
	CHAT_INSTALL_LOCAL_STACK="$(CHAT_INSTALL_LOCAL_STACK)" $(DOCKER_COMPOSE) up $(E2E_COMPOSE_UP_FLAGS) db chat web; \
	$(PYTHON) $(E2E_SMOKE_SCRIPT) --web-url "http://127.0.0.1:3000" --chat-url "http://127.0.0.1:8000" --timeout $(E2E_SMOKE_TIMEOUT)

e2e-smoke-lite: ## Run dockerized contract smoke with minimal chat dependency profile
	$(MAKE) e2e-smoke CHAT_INSTALL_LOCAL_STACK=0

release-dry-run: ## Validate release prerequisites without publishing
	$(PYTHON) $(RELEASE_DRY_RUN_SCRIPT) $(if $(RELEASE_TAG),--tag "$(RELEASE_TAG)",)
	TOOLCHAIN_CHECK_ALLOW_NON_MISE=1 $(MAKE) quick-ci
	$(MAKE) test-scripts
	$(MAKE) docs-check

docs-check: ## Validate docs links
	$(PYTHON) scripts/verify_docs.py

ci: ## Run local CI checks
	$(MAKE) quick-ci
	$(MAKE) test-scripts
	$(MAKE) build
	$(MAKE) docs-check
