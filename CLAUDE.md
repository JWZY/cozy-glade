# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static web app for the **Bonetop** Daggerheart TTRPG campaign - a cozy slice-of-life adventure. Features a Pokédex-inspired Compendium for tracking discovered creatures, plants, and recipes.

**Live site**: https://jwzy.github.io/daggerheart-planning

## Running the Project

```bash
python3 -m http.server 8000
```
Then open http://localhost:8000

No build step required - vanilla HTML/CSS/JS with CDN dependencies.

## Key Files

- `index.html` - App shell, includes cache-busting version params on CSS/JS
- `app.js` - Campaign config, markdown loading, search, color extraction functions
- `styles.css` - Custom styles including compendium cards, glass effects, bestiary layouts

## Compendium System

The Compendium (`bonetop/compendium/`) has three sections:
- **Fauna** (`fauna/`) - Creatures & beasts
- **Flora** (`flora/`) - Plants & fungi
- **Feasts** (`recipes/`) - Culinary creations (note: folder is "recipes" but displays as "Feasts")

### Entry Template Structure

Each compendium entry uses this structure:
```html
<div class="breadcrumb-title">
  <a onclick="loadMarkdown('bonetop/compendium/fauna.md')">Fauna</a>
  <span class="breadcrumb-caret">></span>
  <span class="breadcrumb-current">Entry Name</span>
</div>

<div class="bestiary-page">
  <div class="bestiary-illustration"><!-- gallery or placeholder --></div>
  <div class="bestiary-details">
    <div class="bestiary-props"><!-- Size, Temperament, Habitat etc --></div>
    <div class="bestiary-section"><!-- Description, Behavior, Field Notes --></div>
  </div>
</div>
```

### Card Grid (Index Pages)

Cards with images use `applyCardGradient()` for dynamic color extraction:
```html
<a class="compendium-card" id="card-id">
  <div class="compendium-card-content">...</div>
  <div class="compendium-card-img">
    <img onload="applyCardGradient(this, document.getElementById('card-id'))">
  </div>
</a>
```

Cards without images use `compendium-card-no-img` class for glass styling.

### Adding New Entries

1. Create markdown file in appropriate folder (e.g., `fauna/new_creature.md`)
2. Add card to index page (e.g., `fauna.md`)
3. Use `#XXX` numbering for entry numbers
4. Use placeholder classes for unknown info: `<span class="prop-value placeholder">Awaiting measurement</span>`

## Cache Busting

When deploying updates, increment the version param in `index.html`:
- `styles.css?v=YYYYMMDD`
- `app.js?v=YYYYMMDD`

## Features

- **DM Mode**: `Alt+Shift+D` reveals hidden documents
- **Cover Images**: `<!-- cover: url -->` comment in markdown for hero images
- **Search**: `Ctrl/Cmd+K` to focus search
- **Color Thief**: Extracts dominant colors from images for card gradients
- **Favorite Images**: Gallery thumbnails have star button to set preferred image (localStorage)
- **Season VFX**: `playSeasonVFX(season)` fires a ~3s particle burst on season toggle — godrays for summer, snowflakes for spring. Uses Web Animations API with auto-cleanup (`element.animate()` + `.onfinish` removal)

## Style Notes

- Use `compendium-card-no-img` for glass-style cards without images
- Markdown must have NO indentation for raw HTML to render (marked.js quirk)
- Nav highlighting for nested paths: `compendium/fauna/frog_boar.md` highlights parent `compendium/fauna.md`
