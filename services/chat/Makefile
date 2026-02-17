SHELL := /bin/bash

PYTEST ?= pytest
PIP ?= pip3
UVICORN ?= uvicorn
RUFF ?= ruff
MYPY ?= mypy

API_DIR := src/api
REQ_FILE := $(API_DIR)/requirements.txt
TEST_REQ_FILE := tests/requirements-test.txt
DEV_REQ_FILE := requirements-dev.txt
CONSTRAINTS_FILE := constraints.txt
COVERAGE_TMP_DIR := .pytest_cache/coverage

.DEFAULT_GOAL := help

.PHONY: help setup dev lint typecheck test test-integration quick-ci ci

help: ## Show available chat-service tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nChat service tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-20s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

setup: ## Install chat runtime and test dependencies
	$(PIP) install -r $(REQ_FILE) -c $(CONSTRAINTS_FILE)
	$(PIP) install -r $(TEST_REQ_FILE) -c $(CONSTRAINTS_FILE)
	$(PIP) install -r $(DEV_REQ_FILE) -c $(CONSTRAINTS_FILE)

dev: ## Run chat service with hot reload
	cd $(API_DIR) && $(UVICORN) main:app --reload --host 0.0.0.0 --port 8000

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
	$(MAKE) lint
	$(MAKE) typecheck
	$(MAKE) test

ci: ## Chat merge-gate checks
	$(MAKE) quick-ci
