#!/bin/bash

# Test runner script for Contoso Chat

set -e

echo "🧪 Running Contoso Chat Tests"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if we're in the right directory
if [ ! -f "src/api/main.py" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Install test dependencies
log_info "Installing test dependencies..."
pip install -r tests/requirements-test.txt

# Install main dependencies for testing
log_info "Installing main dependencies..."
pip install -r src/api/requirements.txt

# Add FastAPI test client
pip install httpx

# Run unit tests
log_info "Running unit tests..."
pytest tests/unit/ --cov=src/api --cov-report=term-missing -v

if [ $? -eq 0 ]; then
    log_success "Unit tests passed!"
else
    log_error "Unit tests failed!"
    exit 1
fi

# Run integration tests if SERVICE_URL is provided
if [ -n "$SERVICE_URL" ]; then
    log_info "Running integration tests against $SERVICE_URL..."
    pytest tests/integration/ -v

    if [ $? -eq 0 ]; then
        log_success "Integration tests passed!"
    else
        log_error "Integration tests failed!"
        exit 1
    fi
else
    log_info "Skipping integration tests (no SERVICE_URL provided)"
    log_info "To run integration tests: SERVICE_URL=https://your-service-url.com ./run_tests.sh"
fi

# Validate code structure
log_info "Validating code structure..."
cd src/api
python -m py_compile main.py
python -m py_compile contoso_chat/chat_request.py
python -m py_compile evaluators/custom_evals/relevance.py
cd ../..

log_success "All tests completed successfully! 🎉"