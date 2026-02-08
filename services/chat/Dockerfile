FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -m -g appuser appuser

WORKDIR /app
RUN mkdir -p /app/data && chown -R appuser:appuser /app

# Switch to appuser
USER appuser

# Create virtualenv
RUN python -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Copy requirements first for better caching
COPY --chown=appuser:appuser services/chat/src/api/requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Prisma schema and generate client
COPY --chown=appuser:appuser prisma/schema.prisma schema.prisma
RUN prisma generate --generator pyclient

# Copy application code
COPY --chown=appuser:appuser services/chat/src/api/main.py main.py
COPY --chown=appuser:appuser services/chat/src/api/contoso_chat/ contoso_chat/
COPY --chown=appuser:appuser services/chat/src/api/evaluators/ evaluators/
COPY --chown=appuser:appuser services/chat/src/api/tracing.py tracing.py
COPY --chown=appuser:appuser services/chat/src/api/evaluate.py evaluate.py
COPY --chown=appuser:appuser services/chat/src/api/chat-entrypoint.sh chat-entrypoint.sh
COPY --chown=appuser:appuser infrastructure/scripts/index_products_local.py infrastructure/scripts/index_products_local.py

# Production stage
FROM base as production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PORT=8000 \
    HOST=0.0.0.0 \
    ENVIRONMENT=production

EXPOSE 8000

RUN chmod +x chat-entrypoint.sh

# Use the new entrypoint script
CMD ["./chat-entrypoint.sh"]
