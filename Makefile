# OBS setup — common commands. Run `make` for help.
.DEFAULT_GOAL := help
.PHONY: help backup preview gen release masks

help: ## Show this help
	@grep -E '^[a-z]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*## /\t/' | expand -t18

backup: ## Zip the ~/Downloads/OBS export + copy a scrubbed version into the repo
	@bash scripts/backup.sh

preview: ## Serve the HTML previewer at http://localhost:8000
	@echo "Previewer: http://localhost:8000  (Ctrl-C to stop)"
	@python3 -m http.server 8000

gen: ## Regenerate both device scene collections (MacBook Pro + Mac Mini)
	@python3 scripts/gen_scene_collection.py

release: ## Render overlays + package a dated OBS bundle .zip in ~/Downloads
	@bash release.sh $(FORCE)

masks: ## Regenerate the rounded webcam masks (needs: pip install pillow)
	@python3 masks/gen_masks.py
