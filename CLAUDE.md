# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static web app for Daggerheart TTRPG campaign planning. Displays markdown documents for character goals, NPCs, and campaign notes with real-time search across all content.

## Running the Project

Start a local server from the project root:
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000

No build step required - vanilla HTML/CSS/JS with CDN dependencies (Tailwind CSS, Marked.js).

## Architecture

### Campaign System

The app supports multiple campaigns defined in `app.js` in the `campaigns` object. Each campaign has:
- `basePath`: folder containing campaign markdown files (e.g., `bonetop/`, `prison-planet/`)
- `sections`: array of nav sections, each with `title` and `items` (file references)
- `items` can have `dmOnly: true` to hide from non-DM view

Current campaigns:
- **Bonetop** (default): `bonetop/` - cozy slice of life campaign
- **Prison Planet**: `prison-planet/` - space western campaign

### Key Files

- `index.html` - Single page app shell with sidebar nav and mobile modals
- `app.js` - All application logic: campaign config, markdown loading, search, DM mode
- `styles.css` - Custom styles including glass effects, markdown rendering, character backgrounds

### Features

- **DM Mode**: Toggle with `Alt+Shift+D` to reveal hidden DM-only documents and campaign switcher
- **Campaign Toggle**: Hidden until DM mode enabled; switches between campaigns
- **Cover Images**: Markdown files can specify `<!-- cover: url -->` comment for hero images
- **Character Backgrounds**: Configured in `characterBackgrounds` object in `app.js` - maps file paths to SVG backgrounds
- **Search**: `Ctrl/Cmd+K` to focus; searches across all loaded markdown documents

### Adding Content

1. Create markdown file in campaign folder (e.g., `bonetop/NewCharacter.md`)
2. Add entry to appropriate section in `campaigns` object in `app.js`:
   ```js
   { file: 'NewCharacter.md', name: 'Display Name', sub: 'Subtitle' }
   ```
3. For DM-only content, add `dmOnly: true` to the item
