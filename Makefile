SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
NPM ?= npm

# All Python runs from the project virtualenv. PYTHON_BASE is only used to
# create it (override to `python` where mise is unavailable, e.g. CI).
VENV_DIR ?= .venv
VENV_PYTHON := $(VENV_DIR)/bin/python
PYTHON_BASE ?= mise exec python@3.11 -- python
PYTHON ?= $(VENV_PYTHON)
PIP ?= $(PYTHON) -m pip

# Put the venv's bin dir first so console scripts installed into it resolve
# without activation (ruff, mypy, pytest, uvicorn).
export PATH := $(abspath $(VENV_DIR))/bin:$(PATH)
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
CHAT_SETUP_PROFILE ?= core
DOCKER_DATABASE_URL ?= postgresql://postgres:postgres@localhost:5432/contoso-db

WEB_DIR := apps/web
WEB_MAKE := $(MAKE) -C $(WEB_DIR)
CHAT_DIR := services/chat
CHAT_MAKE := $(MAKE) -C $(CHAT_DIR)

ENV_FILE := .env
ENV_TEMPLATE := .env.example
CHAT_ENV_FILE := $(CHAT_DIR)/.env
CHAT_ENV_TEMPLATE := $(CHAT_DIR)/.env.example

.DEFAULT_GOAL := help

.PHONY: help venv toolchain-doctor env-contract-check agent-doctor env-init bootstrap setup setup-chat setup-chat-full local-provider-check diagnose-chat-local docker-init-fresh sync-web-env dev dev-web dev-chat up down migrate prisma-generate lint typecheck test test-scripts test-web test-chat build quick-ci quick-ci-changed quick-ci-web quick-ci-chat e2e-smoke e2e-smoke-lite e2e-smoke-full release-dry-run docs-check agent-docs-check ci

help: ## Show available tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nAvailable tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

$(VENV_PYTHON):
	@echo "Creating Python virtualenv in $(VENV_DIR)..."
	$(PYTHON_BASE) -m venv $(VENV_DIR)
	$(VENV_PYTHON) -m pip install --quiet --upgrade pip

venv: $(VENV_PYTHON) ## Create the project Python virtualenv (.venv)
	@$(VENV_PYTHON) -c "import sys; print(f'Virtualenv ready: {sys.executable} ({sys.version.split()[0]})')"

toolchain-doctor: | $(VENV_PYTHON) ## Verify local toolchain matches project baseline
	$(PYTHON) $(TOOLCHAIN_CHECK_SCRIPT)

env-contract-check: | $(VENV_PYTHON) ## Verify env contract matches templates and docs
	$(PYTHON) $(ENV_CONTRACT_CHECK_SCRIPT)

agent-doctor: | $(VENV_PYTHON) ## Verify agent-local environment is fully ready
	$(PYTHON) $(AGENT_DOCTOR_SCRIPT)

env-init: ## Create local .env files from templates when missing
	@if [ ! -f "$(ENV_FILE)" ]; then cp "$(ENV_TEMPLATE)" "$(ENV_FILE)"; echo "Created $(ENV_FILE) from $(ENV_TEMPLATE)."; else echo "$(ENV_FILE) already exists."; fi
	@if [ ! -f "$(CHAT_ENV_FILE)" ]; then cp "$(CHAT_ENV_TEMPLATE)" "$(CHAT_ENV_FILE)"; echo "Created $(CHAT_ENV_FILE) from $(CHAT_ENV_TEMPLATE)."; else echo "$(CHAT_ENV_FILE) already exists."; fi

bootstrap: ## One-command bootstrap for local and coding-agent development
	$(MAKE) venv
	$(MAKE) toolchain-doctor
	$(MAKE) env-contract-check
	$(MAKE) env-init
	$(MAKE) setup
	$(MAKE) setup-chat
	$(MAKE) sync-web-env
	$(MAKE) agent-doctor

setup: ## Install web dependencies
	$(WEB_MAKE) setup

sync-web-env: ## Sync root .env into apps/web/.env when present
	$(WEB_MAKE) sync-env

setup-chat: ## Install chat dependencies in the active Python environment
	$(CHAT_MAKE) setup CHAT_SETUP_PROFILE=$(CHAT_SETUP_PROFILE)

setup-chat-full: ## Install chat dependencies including local LLM/vector stack
	$(CHAT_MAKE) setup-full

local-provider-check: ## Validate local-provider prerequisites (Ollama/model/dependencies)
	@set -euo pipefail; \
	set -a; \
	if [ -f "$(ENV_FILE)" ]; then . "$(ENV_FILE)"; fi; \
	set +a; \
	$(CHAT_MAKE) local-provider-check

diagnose-chat-local: ## Run local chat diagnostics (preflight, health snapshot, compose state/log tail)
	@set -euo pipefail; \
	set -a; \
	if [ -f "$(ENV_FILE)" ]; then . "$(ENV_FILE)"; fi; \
	set +a; \
	$(CHAT_MAKE) diagnose-chat-local; \
	echo ""; \
	echo "-- docker compose chat status --"; \
	$(DOCKER_COMPOSE) ps chat || true; \
	echo ""; \
	echo "-- docker compose chat logs (tail 80) --"; \
	$(DOCKER_COMPOSE) logs --no-color --tail=80 chat || true

docker-init-fresh: ## Initialize fresh Docker DB data (migrate+seed) and restart chat indexing
	@set -euo pipefail; \
	$(DOCKER_COMPOSE) up -d db; \
	echo "Applying migrations to $(DOCKER_DATABASE_URL)..."; \
	cd "$(WEB_DIR)" && DATABASE_URL="$(DOCKER_DATABASE_URL)" npx prisma migrate deploy --schema prisma/schema.prisma; \
	echo "Seeding data into $(DOCKER_DATABASE_URL)..."; \
	cd "$(WEB_DIR)" && DATABASE_URL="$(DOCKER_DATABASE_URL)" npx prisma db seed --schema prisma/schema.prisma; \
	$(DOCKER_COMPOSE) up -d chat web; \
	$(DOCKER_COMPOSE) restart chat; \
	echo "docker-init-fresh complete."

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

test-scripts: | $(VENV_PYTHON) ## Run root script guardrail tests
	$(PYTHON) -m unittest discover -s tests/scripts -p "test_*.py" -v

test-web: ## Run web tests
	$(WEB_MAKE) test

test-chat: ## Run chat unit tests
	$(CHAT_MAKE) test

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

quick-ci-changed: | $(VENV_PYTHON) ## Fast local checks scoped to changed files (set CHANGED_BASE/CHANGED_HEAD for git range)
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

e2e-smoke: | $(VENV_PYTHON) ## Run dockerized end-to-end smoke check (web -> chat -> db)
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

e2e-smoke-full: ## Run dockerized smoke with full chat dependency profile
	$(MAKE) e2e-smoke CHAT_INSTALL_LOCAL_STACK=1

release-dry-run: | $(VENV_PYTHON) ## Validate release prerequisites without publishing
	$(PYTHON) $(RELEASE_DRY_RUN_SCRIPT) $(if $(RELEASE_TAG),--tag "$(RELEASE_TAG)",)
	TOOLCHAIN_CHECK_ALLOW_NON_MISE=1 $(MAKE) quick-ci
	$(MAKE) test-scripts
	$(MAKE) docs-check

docs-check: | $(VENV_PYTHON) ## Validate docs links and agent doc pointers
	$(PYTHON) scripts/verify_docs.py
	$(MAKE) agent-docs-check
	# AGENTS.md is a docs path, so a change to it never reaches test-scripts.
	# This guard reads AGENTS.md, so it has to run here too.
	$(PYTHON) -m unittest discover -s tests/scripts -p "test_agent_definitions.py"

agent-docs-check: | $(VENV_PYTHON) ## Verify CLAUDE.md/GEMINI.md/copilot-instructions.md stay pointers to AGENTS.md (set FIX=1 to restore)
	$(PYTHON) scripts/check_agent_docs.py $(if $(FIX),--fix,)

ci: ## Run local CI checks
	$(MAKE) quick-ci
	$(MAKE) test-scripts
	$(MAKE) build
	$(MAKE) docs-check
