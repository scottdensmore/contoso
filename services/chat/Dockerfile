FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

ARG INSTALL_LOCAL_STACK=0

# Prisma Python's nodeenv runtime requires libatomic at generation time.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libatomic1 \
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
COPY --chown=appuser:appuser services/chat/src/api/requirements-core.txt requirements-core.txt
COPY --chown=appuser:appuser services/chat/src/api/requirements-local.txt requirements-local.txt
COPY --chown=appuser:appuser services/chat/constraints.txt constraints.txt

# Install core dependencies first; optionally install the heavier local stack.
RUN pip install --no-cache-dir --default-timeout=300 --retries 5 -r requirements-core.txt -c constraints.txt && \
    if [ "${INSTALL_LOCAL_STACK}" = "1" ]; then \
      pip install --no-cache-dir --default-timeout=600 --retries 3 -r requirements-local.txt -c constraints.txt; \
    fi

# Copy application code

# Copy Prisma schema and generate client
COPY --chown=appuser:appuser apps/web/prisma/schema.prisma schema.prisma
RUN python -m prisma py generate --schema=schema.prisma --generator pyclient

# Copy application code
COPY --chown=appuser:appuser services/chat/src/api/main.py main.py
COPY --chown=appuser:appuser services/chat/src/api/contoso_chat/ contoso_chat/
COPY --chown=appuser:appuser services/chat/src/api/evaluators/ evaluators/
COPY --chown=appuser:appuser services/chat/src/api/tracing.py tracing.py
COPY --chown=appuser:appuser services/chat/src/api/evaluate.py evaluate.py
COPY --chown=appuser:appuser services/chat/src/api/chat-entrypoint.sh chat-entrypoint.sh
COPY --chown=appuser:appuser infrastructure/scripts/index_products_local.py infrastructure/scripts/index_products_local.py

# Production stage
FROM base AS production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5)"]

# Set environment variables
ENV PORT=8000 \
    HOST=0.0.0.0 \
    ENVIRONMENT=production

EXPOSE 8000

RUN chmod +x chat-entrypoint.sh

# Use the new entrypoint script
CMD ["./chat-entrypoint.sh"]
