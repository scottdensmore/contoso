SHELL := /bin/bash

PYTEST ?= pytest
PIP ?= pip3
UVICORN ?= uvicorn

API_DIR := src/api
REQ_FILE := $(API_DIR)/requirements.txt
TEST_REQ_FILE := tests/requirements-test.txt

.DEFAULT_GOAL := help

.PHONY: help setup dev test test-integration quick-ci ci

help: ## Show available chat-service tasks
	@awk 'BEGIN {FS = ":.*##"; printf "\nChat service tasks:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-20s %s\n", $$1, $$2} END {print ""}' $(MAKEFILE_LIST)

setup: ## Install chat runtime and test dependencies
	$(PIP) install -r $(REQ_FILE)
	$(PIP) install -r $(TEST_REQ_FILE)
	$(PIP) install httpx pytest-cov prisma

dev: ## Run chat service with hot reload
	cd $(API_DIR) && $(UVICORN) main:app --reload --host 0.0.0.0 --port 8000

test: ## Run chat unit tests
	$(PYTEST) tests/unit/ --cov=src/api --cov-report=term-missing -v

test-integration: ## Run chat integration tests (requires SERVICE_URL)
	$(PYTEST) tests/integration/ -v

quick-ci: ## Fast chat checks
	$(MAKE) test

ci: ## Chat merge-gate checks
	$(MAKE) quick-ci
