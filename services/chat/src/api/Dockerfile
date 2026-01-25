FROM python:3.11-slim as base

# Set build arguments
ARG BUILD_DATE
ARG GIT_COMMIT
ARG VERSION

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY src/api/requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/api/main.py main.py
COPY src/api/contoso_chat/ contoso_chat/
COPY src/api/evaluators/ evaluators/
COPY src/api/tracing.py tracing.py
COPY src/api/evaluate.py evaluate.py

# Add metadata labels
LABEL maintainer="Contoso Outdoor <team@contoso-outdoor.com>" \
      description="Contoso Chat API - Production Build" \
      version="$VERSION" \
      build_date="$BUILD_DATE" \
      git_commit="$GIT_COMMIT"

# Production stage
FROM base as production

# Security: Change ownership to non-root user
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Set environment variables for Cloud Run
ENV PORT=80 \
    HOST=0.0.0.0 \
    ENVIRONMENT=production

EXPOSE 80

# Use uvicorn with production settings
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--workers", "1", "--access-log"]
