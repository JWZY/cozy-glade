# Bonetop Campaign Wiki

A web-based campaign companion for the Bonetop Daggerheart campaign - a cozy slice-of-life adventure beneath the calcified skeleton of an ancient dragon.

## Live Site

**[jwzy.github.io/daggerheart-planning](https://jwzy.github.io/daggerheart-planning)**

## Features

- **Hub-Style Overview**: Quick access to PCs, NPCs, and the Compendium from the main page
- **Compendium**: Pokédex-inspired entries for discoveries
  - **Fauna**: Creatures & beasts encountered (Frog Boar, Flyverns)
  - **Flora**: Plants & fungi discovered (Weeping Crystal Pine)
  - **Feasts**: Culinary creations from local ingredients
- **Character Pages**: Detailed info for player characters and NPCs
- **Real-time Search**: Search across all documents with `Ctrl/Cmd+K`
- **Mobile Support**: Bottom navigation bar for mobile browsing
- **Dynamic Color Extraction**: Cards with images get gradient backgrounds extracted from the artwork

## Tech Stack

- Vanilla HTML, CSS, JavaScript (no build step)
- [Tailwind CSS](https://tailwindcss.com/) for utility styling
- [Marked.js](https://marked.js.org/) for markdown rendering
- [Color Thief](https://lokeshdhakar.com/projects/color-thief/) for image color extraction
- Hosted on GitHub Pages

## Local Development

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000)

## Adding Content

### New Compendium Entry

1. Create markdown file in the appropriate folder:
   - `bonetop/compendium/fauna/creature_name.md`
   - `bonetop/compendium/flora/plant_name.md`
   - `bonetop/compendium/recipes/recipe_name.md`

2. Use the existing entry templates (breadcrumb, bestiary-page layout)

3. Add card to the index page (`fauna.md`, `flora.md`, or `recipes.md`)

### New Character/NPC

1. Create markdown file in `bonetop/` folder
2. Add entry to the appropriate section in `app.js` campaigns object

## DM Mode

Press `Alt+Shift+D` to toggle DM mode, which reveals hidden documents marked with `dmOnly: true`.
