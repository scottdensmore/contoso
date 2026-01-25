FROM python:3.11-slim as base

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
COPY services/chat/src/api/requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Prisma schema and generate client
COPY prisma/schema.prisma schema.prisma
RUN prisma generate

# Copy application code
COPY services/chat/src/api/main.py main.py
COPY services/chat/src/api/contoso_chat/ contoso_chat/
COPY services/chat/src/api/evaluators/ evaluators/
COPY services/chat/src/api/tracing.py tracing.py
COPY services/chat/src/api/evaluate.py evaluate.py

# Production stage
FROM base as production

# Security: Change ownership to non-root user
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PORT=8000 \
    HOST=0.0.0.0 \
    ENVIRONMENT=production

EXPOSE 8000

# Use uvicorn with production settings
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--access-log"]