SHELL := /bin/bash

PYTHON ?= mise exec python@3.11 -- python
PIP ?= $(PYTHON) -m pip
PYTEST ?= $(PYTHON) -m pytest
UVICORN ?= $(PYTHON) -m uvicorn
RUFF ?= $(PYTHON) -m ruff
MYPY ?= $(PYTHON) -m mypy

API_DIR := src/api
CORE_REQ_FILE := $(API_DIR)/requirements-core.txt
LOCAL_REQ_FILE := $(API_DIR)/requirements-local.txt
TEST_REQ_FILE := tests/requirements-test.txt
DEV_REQ_FILE := requirements-dev.txt
CONSTRAINTS_FILE := constraints.txt
COVERAGE_TMP_DIR := .pytest_cache/coverage
DEPS_CHECK_SCRIPT := scripts/check_dependency_policy.py
CHAT_SETUP_PROFILE ?= core

export PIP_DISABLE_PIP_VERSION_CHECK := 1

.DEFAULT_GOAL := help

.PHONY: help check-python setup setup-core setup-full dev deps-check lint typecheck test test-integration quick-ci ci

help: ## Show available chat-service tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nChat service tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-20s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

check-python: ## Ensure chat commands run on Python 3.11
	@$(PYTHON) -c "import sys; assert sys.version_info[:2] == (3, 11), f'Expected Python 3.11, got {sys.version.split()[0]}'"

setup: ## Install chat runtime and test dependencies (CHAT_SETUP_PROFILE=core|full)
	$(MAKE) check-python
	@if [ "$(CHAT_SETUP_PROFILE)" != "core" ] && [ "$(CHAT_SETUP_PROFILE)" != "full" ]; then \
		echo "Unsupported CHAT_SETUP_PROFILE='$(CHAT_SETUP_PROFILE)' (expected core or full)"; \
		exit 2; \
	fi
	$(PIP) install -r $(CORE_REQ_FILE) -c $(CONSTRAINTS_FILE)
	@if [ "$(CHAT_SETUP_PROFILE)" = "full" ]; then \
		$(PIP) install -r $(LOCAL_REQ_FILE) -c $(CONSTRAINTS_FILE); \
	fi
	$(PIP) install -r $(TEST_REQ_FILE) -c $(CONSTRAINTS_FILE)
	$(PIP) install -r $(DEV_REQ_FILE) -c $(CONSTRAINTS_FILE)

setup-core: ## Install chat with core dependency profile
	$(MAKE) setup CHAT_SETUP_PROFILE=core

setup-full: ## Install chat with full local-LLM/vector dependency profile
	$(MAKE) setup CHAT_SETUP_PROFILE=full

dev: ## Run chat service with hot reload
	cd $(API_DIR) && $(UVICORN) main:app --reload --host 0.0.0.0 --port 8000

deps-check: ## Validate dependency pinning policy for chat service
	$(PYTHON) $(DEPS_CHECK_SCRIPT)

lint: ## Lint chat service
	$(RUFF) check src/api tests

typecheck: ## Type-check chat service
	$(MYPY) --config-file mypy.ini src/api

test: ## Run chat unit tests
	@mkdir -p $(COVERAGE_TMP_DIR)
	@tmp_cov="$$(mktemp "$(COVERAGE_TMP_DIR)/.coverage.XXXXXX")"; \
	COVERAGE_FILE="$$tmp_cov" $(PYTEST) tests/unit/ --cov=src/api --cov-report=term-missing -v

test-integration: ## Run chat integration tests (requires SERVICE_URL)
	$(PYTEST) tests/integration/ -v

quick-ci: ## Fast chat checks
	$(MAKE) check-python
	$(MAKE) deps-check
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test

ci: ## Chat merge-gate checks
	$(MAKE) quick-ci
