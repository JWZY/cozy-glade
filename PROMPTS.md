# PROMPTS.md

Key prompts used to build this project, in order. Follow these to replicate the build.

---

## 2026-02-10 — Arc 2 Live Session & Wiki Features

### DM Mode UI
- "Add a DM mode button to the top nav, and make DM-only pages show as thumbnails on the front page when in DM mode"

### Arc 2 Session Prep
- "Look through all player context — all 3 players have finished their short-term goals. We're doing a time skip to summer. Create a session prep doc with worldbuilding and challenges."
- "Change Session 1/2 to Arc 1/2 everywhere"

### Live Session Updates (fed in real-time during play)
- Character goal updates, relationship sections, developments — fed as they happened at the table
- "Finley started a Hot Goss Club, Oleg crashes the meetings"
- "Halden built homesteads for everyone, wants to build a tavern"
- "Ellery's floating library has no entrance — she forgot to design one"
- "Add fauna: Bad Luck Bees, Wooly Moss Moose. Add flora: Rolling Moss (Roly Polys)"
- "The wooly moss moose swallow the roly polys like jawbreakers and lick them until the moss is gone, then spit the rocks out"
- "Halden domesticated a moose — it imprinted on him. The moose spit moss balls at enemies."

### Raw Transcript Parsing
- "I'm going to dump a crapload of raw session notes — commit it somewhere and we can parse through it"
- *Dumped ~7000 lines of automated audio transcription*
- Claude saved to `bonetop/session_notes/arc2_raw_transcript.md`, parsed the full transcript, and identified what was already logged vs what needed capturing

### Post-Session Updates
- "Everything from the parse is canon except Anja's ashes as magical component — that was a joke"
- "Halden respecced from a Brawler, not Marshal"
- Updated DM notes with narrative threads (moose nemesis system, Halden's Anja conflict, forest queens, jade tree gradient, dampening bracelet)
- Updated player wishlist with emergent threads from dice-driven storytelling

### Session Notes Section
- "Add a compendium section called Session Notes with a subpage — give it a name and the date (Feb 10)"
- Created "The Wooly Terrors" session summary
- "Add a card on the home page too"
- "Add an in-game date — Year 1, Summer"
- "Make it point form"

### Wiki Auto-Linking
- "Make it so there's internal linking between wiki pages — every time Halden is mentioned, auto-link to the Halden page. Every time Wooly Moss Moose is mentioned, auto-link. Is there a way to automatically create a wiki like that?"
- Built a post-render text node walker with a term→page dictionary, dotted underline styling, skips self-references/headings/links

### Loading & Routing
- "Remove the welcome splash — just load the overview directly"
- "Now it's an empty screen for a second — add a loading bar"
- "Everything sits on the home URL and you can't share pages — how do we tackle that?"
- Hash-based routing: URL updates on navigate (`#bonetop/Halden.md`), browser back/forward works, shared links load the right page

### Bug Fixes
- "Search results don't navigate when clicked" → `collapseDesktopSearch` was racing with `loadMarkdown`, added `skipReload` param
- "Card text alignment is uneven" → Changed `justify-content: center` to `flex-start`
- "Rolling Moss layout is different from Crystal Pines" → Was using wrong template class
