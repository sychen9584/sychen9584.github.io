# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install Ruby dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve -l -H localhost

# Build for production
bundle exec jekyll build

# Docker alternative
docker compose up

# JavaScript build
npm run build:js      # minify JS
npm run watch:js      # watch and rebuild JS
```

## Architecture Overview

This is a **Jekyll 3.10.0** academic portfolio site based on the **Minimal Mistakes** theme, customized with dark mode support and academic-specific content collections.

### Content Collections

Jekyll collections under `_publications/`, `_talks/`, `_teaching/`, and `_portfolio/` are the primary content areas. Each collection item is a Markdown file with YAML front matter. The corresponding listing pages live in `_pages/`.

### Layouts & Includes

- `_layouts/single.html` — primary template for all content pages
- `_includes/author-profile.html` — sidebar author card (social links pulled from `_config.yml`)
- `_includes/head.html` — inserts dark mode init script to avoid flash
- `_data/navigation.yml` — controls masthead nav links

### Styling Pipeline

SCSS source lives in `_sass/`, compiled via `assets/css/main.scss`. Theme variants:
- `_sass/theme/_default.scss` — light theme
- `_sass/theme/_dark.scss` — dark theme (custom addition)

### JavaScript

Source files in `assets/js/` are uglified into `assets/js/main.min.js` via `npm run build:js`. Always run the build after editing JS and commit the minified output. `theme-toggle.js` handles dark mode with `localStorage` persistence and `prefers-color-scheme` detection.

### Dark Mode

Implemented as a custom addition: masthead button → `theme-toggle.js` → CSS class on `<html>` → `_dark.scss`. Theme preference is persisted in `localStorage` as `theme`.

### Site Configuration

All site metadata, author social links, collection settings, and plugin config are in `_config.yml`. Author social profiles (GitHub, Google Scholar, ORCID, etc.) are defined under `author.links`.

### Automation

`.github/workflows/jekyll.yml` builds and deploys to GitHub Pages on push to `master`. A second workflow `scrape_talks.yml` auto-runs when talks data changes.

### Markdown Generation

`markdown_generator/` contains Python/Jupyter scripts for bulk-generating collection Markdown files from TSV data — use these when adding multiple publications or talks at once.
