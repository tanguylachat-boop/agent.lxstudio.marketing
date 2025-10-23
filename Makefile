.PHONY: help install build dev clean lint test migrate seed start-api start-web queue-worker docker-up docker-down export-n8n

help: ## Affiche l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installe toutes les dépendances
	pnpm install

build: ## Build tous les packages et apps
	pnpm -r build

dev: ## Lance tous les services en mode dev (parallèle)
	pnpm -r --parallel dev

clean: ## Nettoie les artefacts de build
	pnpm -r clean
	rm -rf node_modules

lint: ## Lint tous les packages
	pnpm -r lint

type-check: ## Type-check tous les packages
	pnpm -r type-check

test: ## Lance les tests
	pnpm -r test

migrate: ## Exécute les migrations SQL
	@echo "⚠️  Exécutez manuellement les migrations via Supabase CLI ou Dashboard"
	@echo "Fichiers : apps/api/src/db/migrations/*.sql"
	pnpm --filter @lxstudio/api migrate

seed: ## Seed la base de données avec des données de démo
	pnpm --filter @lxstudio/api seed

start-api: ## Démarre l'API en mode production
	pnpm --filter @lxstudio/api start

start-web: ## Démarre le dashboard web en mode production
	pnpm --filter @lxstudio/web start

queue-worker: ## Démarre le worker BullMQ
	pnpm --filter @lxstudio/api queue:worker

docker-up: ## Démarre les services Docker (Redis, etc.)
	docker-compose up -d

docker-down: ## Arrête les services Docker
	docker-compose down

export-n8n: ## Exporte le workflow n8n (déjà dans n8n-workflows/)
	@echo "Workflow n8n disponible : n8n-workflows/n8n-workflow-lxstudio.json"
	@echo "Import via n8n UI : Settings > Import > Paste JSON"

# Raccourcis dev
api: ## Lance uniquement l'API en dev
	pnpm --filter @lxstudio/api dev

web: ## Lance uniquement le dashboard web en dev
	pnpm --filter @lxstudio/web dev

# Setup initial
setup: install migrate seed docker-up ## Setup complet du projet
	@echo "✅ Setup terminé !"
	@echo "Copiez .env.example vers .env et remplissez les variables"
	@echo "Lancez 'make dev' pour démarrer en mode développement"
