# ============================================================================
# Where Is My Money — Project Task Runner
# ============================================================================
# Usage: make <target>
#   Run `make` or `make help` to see all available commands.
# ============================================================================

.PHONY: help
.DEFAULT_GOAL := help

COMPOSE_BASE := docker compose -f docker-compose.yml
COMPOSE_DEV  := $(COMPOSE_BASE) -f docker-compose.dev.yml
COMPOSE_PROD := $(COMPOSE_BASE) -f docker-compose.prod.yml

# ----------------------------------------------------------------------------
# Help
# ----------------------------------------------------------------------------

help: ## Show this help
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9._-]+:.*##/ { printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# ============================================================================
# Docker — Development
# ============================================================================

dev.up: ## Start all services (dev)
	$(COMPOSE_DEV) up

dev.up.d: ## Start all services (dev, detached)
	$(COMPOSE_DEV) up -d

dev.up.build: ## Build and start all services (dev)
	$(COMPOSE_DEV) up --build

dev.down: ## Stop all services (dev)
	$(COMPOSE_DEV) down

dev.down.volumes: ## Stop all services and remove volumes (dev) — DESTROYS DATA
	$(COMPOSE_DEV) down -v

dev.build: ## Build all images (dev)
	$(COMPOSE_DEV) build

dev.logs: ## Tail logs for all services (dev)
	$(COMPOSE_DEV) logs -f

dev.ps: ## List running services (dev)
	$(COMPOSE_DEV) ps

dev.restart: ## Restart all services (dev)
	$(COMPOSE_DEV) restart

# Per-service dev targets

dev.up.api: ## Start api + dependencies (dev)
	$(COMPOSE_DEV) up api

dev.up.frontend: ## Start frontend + dependencies (dev)
	$(COMPOSE_DEV) up frontend

dev.up.db: ## Start postgres only (dev)
	$(COMPOSE_DEV) up postgres

dev.up.ml: ## Start ml-classifier + dependencies (dev)
	$(COMPOSE_DEV) up ml-classifier

dev.logs.api: ## Tail api logs (dev)
	$(COMPOSE_DEV) logs -f api

dev.logs.frontend: ## Tail frontend logs (dev)
	$(COMPOSE_DEV) logs -f frontend

dev.logs.db: ## Tail postgres logs (dev)
	$(COMPOSE_DEV) logs -f postgres

dev.logs.ml: ## Tail ml-classifier logs (dev)
	$(COMPOSE_DEV) logs -f ml-classifier

dev.logs.ngrok: ## Tail ngrok logs (dev)
	$(COMPOSE_DEV) logs -f ngrok

# ============================================================================
# Docker — Production
# ============================================================================

prod.up: ## Start all services (prod)
	$(COMPOSE_PROD) up

prod.up.d: ## Start all services (prod, detached)
	$(COMPOSE_PROD) up -d

prod.up.build: ## Build and start all services (prod)
	$(COMPOSE_PROD) up --build

prod.down: ## Stop all services (prod)
	$(COMPOSE_PROD) down

prod.down.volumes: ## Stop all services and remove volumes (prod) — DESTROYS DATA
	$(COMPOSE_PROD) down -v

prod.build: ## Build all images (prod)
	$(COMPOSE_PROD) build

prod.logs: ## Tail logs for all services (prod)
	$(COMPOSE_PROD) logs -f

prod.ps: ## List running services (prod)
	$(COMPOSE_PROD) ps

prod.restart: ## Restart all services (prod)
	$(COMPOSE_PROD) restart

# ============================================================================
# Database — Migrations
# ============================================================================
# Migration commands load env vars from the top-level env/ directory
# (env/.env.dev or env/.env.prod). For generate, pass the migration name:
#   make db.migrate.generate name=AddUsersTable
# ============================================================================

db.migrate.dev: ## Run pending migrations (dev)
	npm run migrations:run:dev --prefix api-node

db.migrate.prod: ## Run pending migrations (prod)
	npm run migrations:run:prod --prefix api-node

db.migrate.generate: ## Generate migration from entity changes (dev) — name=<MigrationName>
	@if [ -z "$(name)" ]; then echo "Error: provide a migration name, e.g. make db.migrate.generate name=AddUsersTable"; exit 1; fi
	npm run migrations:generate:dev --prefix api-node -- src/migrations/$(name)

db.migrate.show.dev: ## Show migration status (dev)
	npm run migrations:show:dev --prefix api-node

db.migrate.show.prod: ## Show migration status (prod)
	npm run migrations:show:prod --prefix api-node

db.migrate.revert.dev: ## Revert last migration (dev)
	npm run migrations:revert:dev --prefix api-node

db.migrate.revert.prod: ## Revert last migration (prod)
	npm run migrations:revert:prod --prefix api-node

# ============================================================================
# API (NestJS) — Local development (outside Docker)
# ============================================================================

api.dev: ## Start API in watch mode (dev, local)
	npm run start:dev --prefix api-node

api.build: ## Build API
	npm run build --prefix api-node

api.lint: ## Lint API source
	npm run lint --prefix api-node

api.format: ## Format API source with Prettier
	npm run format --prefix api-node

api.test: ## Run API unit tests
	npm test --prefix api-node

api.install: ## Install API dependencies
	npm install --prefix api-node

# ============================================================================
# Frontend (React + Vite) — Local development (outside Docker)
# ============================================================================

frontend.dev: ## Start frontend dev server (local)
	npm run dev --prefix frontend

frontend.build: ## Build frontend for production
	npm run build --prefix frontend

frontend.lint: ## Lint frontend source
	npm run lint --prefix frontend

frontend.preview: ## Preview production build locally
	npm run preview --prefix frontend

frontend.install: ## Install frontend dependencies
	npm install --prefix frontend

# ============================================================================
# ML Classifier (Python) — Local development (outside Docker)
# ============================================================================

ml.dev: ## Start ML classifier worker (local)
	set -a && . ./env/.env.local && set +a && cd ml-classifier-python && ./env/bin/python server.py

ml.install: ## Install ML classifier Python dependencies
	cd ml-classifier-python && ./env/bin/pip install -r requirements.txt

# ============================================================================
# Convenience
# ============================================================================

install: ## Install dependencies for all projects
	npm install --prefix api-node
	npm install --prefix frontend
	cd ml-classifier-python && ./env/bin/pip install -r requirements.txt

db.shell: ## Open a psql shell to the running postgres container
	$(COMPOSE_DEV) exec postgres psql -U user -d wymm

db.shell.prod: ## Open a psql shell (prod compose)
	$(COMPOSE_PROD) exec postgres psql -U user -d wymm
