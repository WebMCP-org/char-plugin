# Changelog

All notable changes to the char-setup skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2026-02-05

### Added
- **Live Preview via CDP injection** — new workflow to preview Char on any live website without touching their codebase
- `references/LIVE_PREVIEW.md` — step-by-step CDP injection playbook (navigate, extract styles, inject bundle, build sidebar, screenshot)
- Recipe 11 in RECIPES.md — "Live Preview on Customer Site (CDP)"
- Collapsible sidebar pattern as recommended placement (flex-sibling, pushes content left)
- Gotchas table for common CDP injection issues (CORS, timeouts, auth modes, Shadow DOM)
- Setup document generation guidance after successful live preview

### Changed (BREAKING)
- **CSS variable prefix**: `--wm-*` → `--char-*` across all files (e.g., `--wm-color-primary` → `--char-color-primary`)
- **Package name**: `@mcp-b/embedded-agent` → `@mcp-b/char` across all docs, examples, and scripts
- **CDN provider**: `unpkg.com` → `cdn.jsdelivr.net` (unpkg has CORS issues on `@latest` redirects)
- **CDN URLs**: All use `@latest` instead of pinned versions
- **CSS selectors**: `char { }` → `char-agent { }` in all examples (matches actual custom element tag)
- Sidebar pattern updated from fixed-position overlay to collapsible flex-sibling (recommended)
- `VISUAL_INTEGRATION.md` placement section rewritten with flex-sibling pattern and layout diagram
- `setup.js` verification function updated for new package name and CDN

### Previously Unreleased
- Synced tool registration docs with `navigator.modelContext.registerTool` and `execute`
- Updated embed docs to `auth-token` for production and `dev-mode` for stateless testing
- Clarified CSS variable styling; removed `theme` JSON override references
- Updated demo template to use the standalone CDN embed script
- Adjusted setup verification to detect the new embed script
- Removed React UI component guidance (web component only)
- Clarified Shadow DOM is always enabled (no opt-out) and updated tooling docs

## [2.0.0] - 2026-01-07

### Added
- Quick Reference section in SKILL.md for common tasks
- Success Criteria checklist to verify setup completion
- Version tracking in skill frontmatter
- Progressive disclosure optimization (37.5% token reduction)
- Visual Integration Workflow for design matching
- Style extraction script (assets/scripts/extract-page-styles.js)
- VISUAL_INTEGRATION.md best practices guide
- Automated theme generation from page styles
- Screenshot verification at multiple viewports
- WCAG accessibility checking
- This CHANGELOG file
- RECIPES.md with common setup patterns

### Changed
- SKILL.md reduced from 304 to 206 lines (32% reduction)
- Detailed workflows moved to reference files for progressive disclosure
- Enhanced demo.html with CSS variables and design token exposure
- Updated CUSTOMIZATION.md with automatic theme generation section
- Consolidated MCP integration details into Prerequisites section

### Improved
- Token usage: 37.5% reduction on skill invocation
- Navigation: Added "Additional Resources" section
- Documentation: Clearer structure with better links
- Examples: Added visual integration example

## [1.0.0] - 2025-12-15

### Added
- Initial char-setup skill release
- Basic setup workflow (stateless mode)
- MCP integration support (Chrome DevTools, WebMCP Docs)
- Demo template with contact form and counter
- CUSTOMIZATION.md theme reference
- WEBMCP_REFERENCE.md tool documentation
- TROUBLESHOOTING.md common issues guide
- PRODUCTION.md deployment guide

### Features
- Automated vs manual setup paths
- API key injection
- Browser launch integration
- WebMCP tools verification
