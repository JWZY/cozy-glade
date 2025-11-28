# Daggerheart Campaign Planning

A modern, searchable web interface for tracking character goals and campaign planning documents.

## Features

- **Modern Dark Theme**: Easy on the eyes for long planning sessions
- **Vertical Sidebar Navigation**: Quick access to all character goals and campaign resources
- **Real-time Search**: Search across all documents with highlighted results
- **Markdown Rendering**: Beautiful rendering of all markdown content
- **Keyboard Shortcuts**: Press `Ctrl+K` (or `Cmd+K` on Mac) to focus search

## How to Use

1. Open `index.html` in your web browser
2. Click on any character's goals in the sidebar to view their content
3. Use the search bar to find specific content across all documents
4. Navigate between documents seamlessly

## Files

### Character Goals
- `javans-goals.md` - Javan's character goals
- `bory-goals.md` - Bory's character goals (southernetobicokelove)
- `tess-goals.md` - Tess's character goals
- `sarah-goals.md` - Sarah's character goals

### Campaign Resources
- `goal_pyramid_guide.md` - Guide for creating character goals with examples
- `DnD_Pyramid_goal_map.jpg` - Original goal pyramid reference image

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses Tailwind CSS for styling (CDN)
- Uses Marked.js for markdown parsing (CDN)
- No build step required - just open and use!
- Responsive design works on desktop and tablet

## Adding New Content

To add new character goals or campaign documents:

1. Create a new markdown file (e.g., `new-character-goals.md`)
2. Add it to the `files` array in `index.html` (around line 230)
3. Add a navigation button in the sidebar section (around line 90)

## Tips

- Keep markdown files in the same directory as `index.html`
- Use consistent heading levels for best rendering
- Search works across all loaded documents simultaneously
- Documents are cached after first load for faster switching

