let allDocuments = {};
let currentContent = '';
let currentFile = '';
let currentCampaign = 'bonetop';
let isDmMode = false;
const dmFileSet = new Set();

// Seasonal theme system
const seasons = ['summer', 'spring'];
let currentSeason = localStorage.getItem('bonetop-season') || 'summer';

const seasonIcons = {
    summer: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/></svg>',
    spring: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/><path d="M5 21h14"/></svg>'
};

function applySeason(season) {
    document.body.dataset.season = season;
    // Update season toggle icons
    ['seasonBtn', 'mobileSeasonBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.innerHTML = seasonIcons[season];
    });
}

const seasonImages = { summer: 'bonetop/img/Year 1 Summer.png', spring: 'bonetop/img/Year 1 Spring.png' };

function cycleSeason() {
    const idx = seasons.indexOf(currentSeason);
    const oldSeason = currentSeason;
    currentSeason = seasons[(idx + 1) % seasons.length];

    const cover = document.querySelector('.page-cover');
    if (cover) {
        // Capture old gradient values before switching
        const oldBgRgb = getComputedStyle(document.body).getPropertyValue('--bg-rgb').trim();

        // Switch season (CSS vars + icon update)
        applySeason(currentSeason);

        // Set new season image on cover
        cover.style.backgroundImage = `
            linear-gradient(to bottom, rgba(var(--bg-rgb), 0.1) 50%, rgba(var(--bg-rgb), 1) 100%),
            url('${seasonImages[currentSeason]}')
        `;
        cover.style.animation = 'none';

        // Crossfade: overlay with old image fades out
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute; inset: 0; z-index: 1;
            background-image: linear-gradient(to bottom, rgba(${oldBgRgb}, 0.1) 50%, rgba(${oldBgRgb}, 1) 100%), url('${seasonImages[oldSeason]}');
            background-size: cover;
            background-position: center 35%;
            transition: opacity 0.8s ease;
            pointer-events: none;
        `;
        cover.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '0';
        });
        overlay.addEventListener('transitionend', () => overlay.remove());
    } else {
        applySeason(currentSeason);
        if (currentFile) loadMarkdown(currentFile);
    }

    localStorage.setItem('bonetop-season', currentSeason);
    playSeasonVFX(currentSeason);
}

function playSeasonVFX(season) {
    // Remove any existing VFX container
    const existing = document.querySelector('.season-vfx');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'season-vfx';
    document.body.appendChild(container);

    const W = window.innerWidth;
    const H = window.innerHeight;

    let spawnInterval;

    if (season === 'summer') {
        // Godrays — burst then trickle
        const spawnRay = () => {
            const ray = document.createElement('div');
            ray.className = 'ray';

            const rayWidth = 10 + Math.random() * 20;
            const rayHeight = H * (0.65 + Math.random() * 0.26);
            ray.style.width = rayWidth + 'px';
            ray.style.height = rayHeight + 'px';

            const progress = Math.random();
            ray.style.left = (W * 0.95 - progress * W * 0.9) + 'px';
            ray.style.top = '-20px';

            const angle = 15 + progress * 30 + (Math.random() - 0.5) * 10;
            ray.style.transform = `rotate(${angle}deg)`;
            ray.style.transformOrigin = 'top center';

            container.appendChild(ray);

            ray.animate([
                { opacity: 0, transform: `rotate(${angle}deg) scaleY(0.7)` },
                { opacity: 0.575, transform: `rotate(${angle}deg) scaleY(1)`, offset: 0.3 },
                { opacity: 0.46, transform: `rotate(${angle}deg) scaleY(1)`, offset: 0.7 },
                { opacity: 0, transform: `rotate(${angle}deg) scaleY(0.8)` }
            ], {
                duration: 3500 + Math.random() * 2000,
                easing: 'ease-in-out'
            }).onfinish = () => ray.remove();
        };

        // Initial burst
        for (let i = 0; i < 15; i++) spawnRay();
        // Trickle for 2s
        spawnInterval = setInterval(spawnRay, 200);
        setTimeout(() => clearInterval(spawnInterval), 2000);

    } else if (season === 'spring') {
        // Snowflakes — burst then trickle
        const spawnFlake = () => {
            const flake = document.createElement('div');
            flake.className = 'snowflake';

            // Depth system
            const depthRand = Math.random();
            const depth = depthRand < 0.6 ? depthRand * 0.5 : 0.25 + depthRand * 0.75;

            const size = 2 + depth * 6 + Math.random() * 2;
            flake.style.width = size + 'px';
            flake.style.height = size + 'px';

            if (depth < 0.4) {
                const blur = (0.4 - depth) * 3;
                flake.style.filter = `blur(${blur}px)`;
            }

            const startX = Math.random() * (W + 40) - 20;
            flake.style.left = startX + 'px';
            flake.style.top = '-20px';

            container.appendChild(flake);

            const driftX = 20 + Math.random() * 40;
            const wobble1 = (Math.random() - 0.5) * 30;
            const wobble2 = (Math.random() - 0.5) * 36;
            const fallDist = H + 50;
            const opacity = 0.6 + depth * 0.35;
            const dur = 2000 + Math.random() * 2000;

            flake.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: opacity },
                { transform: `translate(${driftX * 0.3 + wobble1}px, ${fallDist * 0.3}px) rotate(120deg)`, opacity: opacity, offset: 0.3 },
                { transform: `translate(${driftX * 0.6 + wobble2}px, ${fallDist * 0.6}px) rotate(240deg)`, opacity: opacity * 0.95, offset: 0.6 },
                { transform: `translate(${driftX * 0.85 + wobble1}px, ${fallDist * 0.85}px) rotate(360deg)`, opacity: opacity * 0.8, offset: 0.85 },
                { transform: `translate(${driftX}px, ${fallDist}px) rotate(420deg)`, opacity: 0 }
            ], {
                duration: dur,
                easing: 'linear'
            }).onfinish = () => flake.remove();
        };

        // Initial burst
        for (let i = 0; i < 20; i++) spawnFlake();
        // Trickle for 2s
        spawnInterval = setInterval(spawnFlake, 50);
        setTimeout(() => clearInterval(spawnInterval), 2000);
    }

    // Remove container after all particles finish
    setTimeout(() => container.remove(), 6000);
}

// Apply saved season immediately
applySeason(currentSeason);

const campaigns = {
    'bonetop': {
        name: 'Cozy Glade',
        description: 'Cozy slice of life',
        icon: '🦴',
        basePath: 'bonetop/',
        sections: [
            {
                title: 'Campaign Overview',
                items: [
                    { file: 'campaign_overview.md', name: 'Overview & Setting', sub: 'The World' },
                    { file: 'arc2_roadmap.md', name: 'Arc 2 Roadmap', sub: 'Portents & Pressures', dmOnly: true },
                    { file: 'player_wishlist.md', name: 'Player Wishlist', sub: 'Session Ideas', dmOnly: true }
                ]
            },
            {
                title: 'Player Characters',
                items: [
                    { file: 'Oleg.md', name: 'Oleg', sub: 'Played by Token' },
                    { file: 'Halden.md', name: 'Halden', sub: 'Played by Lumberjake' },
                    { file: 'Ellery.md', name: 'Ellery Briggs', sub: 'Played by Cheez' }
                ]
            },
            {
                title: 'NPCs',
                items: [
                    { file: 'Finley_Boreas.md', name: 'Finley Boreas', sub: 'NPC' },
                    { file: 'Nellie_Saddler.md', name: 'Nellie Saddler', sub: 'NPC' },
                    { file: 'Vinos.md', name: 'Vinos', sub: 'NPC' }
                ]
            },
            {
                title: 'Compendium',
                items: [
                    { file: 'compendium/fauna.md', name: 'Fauna', sub: 'Creatures & Beasts' },
                    { file: 'compendium/flora.md', name: 'Flora', sub: 'Plants & Fungi' },
                    { file: 'compendium/recipes.md', name: 'Feasts', sub: 'Culinary Creations' },
                    { file: 'compendium/session_notes.md', name: 'Session Notes', sub: 'Adventure Log' }
                ]
            }
        ]
    }
};

const sharedResources = [
    'goal_pyramid_guide.md'
];

const characterBackgrounds = {
    'bonetop/Ellery.md': 'bonetop/img/ellery-svg.svg',
    'bonetop/Halden.md': 'bonetop/img/halden-svg.svg',
    'bonetop/Oleg.md': 'bonetop/img/oleg-svg.svg'
};

// Wiki-link dictionary: term → page path (longest terms first to avoid partial matches)
const wikiLinks = [
    { term: 'Wooly Moss Moose', file: 'bonetop/compendium/fauna/wooly_moss_moose.md' },
    { term: 'Weeping Crystal Pine', file: 'bonetop/compendium/flora/crystalline_pines.md' },
    { term: 'Crystal Pine', file: 'bonetop/compendium/flora/crystalline_pines.md' },
    { term: 'Bad Luck Bees', file: 'bonetop/compendium/fauna/bad_luck_bees.md' },
    { term: 'Rolling Moss', file: 'bonetop/compendium/flora/rolling_moss.md' },
    { term: 'Roly Poly', file: 'bonetop/compendium/flora/rolling_moss.md' },
    { term: 'Roly Polys', file: 'bonetop/compendium/flora/rolling_moss.md' },
    { term: 'Flyverns', file: 'bonetop/compendium/fauna/flyverns.md' },
    { term: 'Night Strix', file: 'bonetop/compendium/fauna/night_strix.md' },
    { term: 'PolliHog', file: 'bonetop/compendium/fauna/pollihog.md' },
    { term: 'Pollihog', file: 'bonetop/compendium/fauna/pollihog.md' },
    { term: 'Jub-jub', file: 'bonetop/compendium/fauna/jub_jub.md' },
    { term: 'Jub-jubs', file: 'bonetop/compendium/fauna/jub_jub.md' },
    { term: 'Ellery', file: 'bonetop/Ellery.md' },
    { term: 'Halden', file: 'bonetop/Halden.md' },
    { term: 'Oleg', file: 'bonetop/Oleg.md' },
    { term: 'Finley', file: 'bonetop/Finley_Boreas.md' },
    { term: 'Nellie', file: 'bonetop/Nellie_Saddler.md' },
    { term: 'Vinos', file: 'bonetop/Vinos.md' },
];

function applyWikiLinks(container, currentFilename) {
    // Tags to skip: links, buttons, headings, breadcrumbs, card elements, props
    const skipTags = new Set(['A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'SCRIPT', 'STYLE', 'CODE', 'PRE']);
    const skipClasses = ['breadcrumb-title', 'compendium-card', 'bestiary-prop', 'prop-value', 'prop-label', 'section-label', 'compendium-card-name'];

    function shouldSkip(node) {
        let el = node.nodeType === 3 ? node.parentElement : node;
        while (el && el !== container) {
            if (skipTags.has(el.tagName)) return true;
            if (el.className && skipClasses.some(c => el.className.includes(c))) return true;
            el = el.parentElement;
        }
        return false;
    }

    // Build regex: match longest terms first (already sorted in array)
    const pattern = wikiLinks
        .filter(w => w.file !== currentFilename)
        .map(w => w.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    if (!pattern) return;
    const regex = new RegExp(`\\b(${pattern})\\b`, 'g');

    // Walk text nodes
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
        if (shouldSkip(node)) return;
        const text = node.textContent;
        if (!regex.test(text)) return;
        regex.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            // Create link
            const link = document.createElement('a');
            link.href = 'javascript:void(0)';
            link.className = 'wiki-link';
            const entry = wikiLinks.find(w => w.term === match[0]);
            link.onclick = () => loadMarkdown(entry.file);
            link.textContent = match[0];
            frag.appendChild(link);
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        node.parentNode.replaceChild(frag, node);
    });
}

// Initialize DM file set
Object.values(campaigns).forEach(campaign => {
    campaign.sections.forEach(section => {
        section.items.forEach(item => {
            if (item.dmOnly) {
                dmFileSet.add(campaign.basePath + item.file);
            }
        });
    });
});


function toggleDmMode() {
    isDmMode = !isDmMode;
    console.log('DM Mode:', isDmMode);
    renderNav();
    updateDmModeButton();
    // Reload documents if turning on DM mode to ensure we have them
    if (isDmMode) loadAllDocuments();

    // Toggle DM-only elements on the current page
    document.querySelectorAll('.dm-only').forEach(el => {
        el.style.display = isDmMode ? '' : 'none';
    });
}

function updateDmModeButton() {
    const btn = document.getElementById('dmModeBtn');
    if (btn) {
        if (isDmMode) {
            btn.classList.remove('hidden');
            btn.classList.add('dm-mode-active');
        } else {
            btn.classList.add('hidden');
            btn.classList.remove('dm-mode-active');
        }
    }
}

function renderNav() {
    const campaign = campaigns[currentCampaign];
    
    // Update Header
    const titleEl = document.getElementById('campaign-title');
    const descEl = document.getElementById('campaign-desc');
    const iconEl = document.getElementById('campaign-icon');
    
    if(titleEl) titleEl.textContent = campaign.name;
    if(descEl) descEl.textContent = campaign.description;
    if(iconEl) iconEl.textContent = campaign.icon;

    // Handle DM Only Elements
    const dmElements = [
        document.getElementById('resources-header'),
        document.getElementById('goal-pyramid-nav'),
        document.getElementById('mobile-resources-section')
    ];

    dmElements.forEach(el => {
        if (el) {
            if (isDmMode) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
    
    // Desktop Nav
    const desktopContainer = document.getElementById('campaign-nav-container');
    if (desktopContainer) {
        desktopContainer.innerHTML = campaign.sections.map((section, index) => {
            const visibleItems = section.items.filter(item => isDmMode || !item.dmOnly);
            if (visibleItems.length === 0) return '';
            
            const marginTop = (index === 0 && !isDmMode) ? '' : 'mt-6';
            
            return `
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 ${marginTop}">${section.title}</div>
            ${visibleItems.map(p => `
                <button onclick="loadMarkdown('${campaign.basePath}${p.file}')" class="nav-item w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
                    <div class="font-medium">${p.name}</div>
                    <div class="text-xs text-slate-400 mt-0.5">${p.sub}</div>
                </button>
            `).join('')}
        `}).join('');
    }

    // Mobile Nav
    const mobileContainer = document.getElementById('mobile-campaign-nav-container');
    if(mobileContainer) {
        mobileContainer.innerHTML = campaign.sections.map(section => {
            const visibleItems = section.items.filter(item => isDmMode || !item.dmOnly);
            if (visibleItems.length === 0) return '';

            return `
            <div class="mb-4">
                <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">${section.title}</div>
                <div class="space-y-2">
                    ${visibleItems.map(p => `
                        <button onclick="loadMarkdownMobile('${campaign.basePath}${p.file}')" class="page-item">
                            <div class="page-item-title">${p.name}</div>
                            <div class="page-item-sub">${p.sub}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `}).join('');
    }
}

// Load all markdown files
async function loadAllDocuments() {
    const campaign = campaigns[currentCampaign];
    // Flatten files from all sections
    const campaignFiles = campaign.sections.flatMap(section => 
        section.items.map(item => campaign.basePath + item.file)
    );
    
    const files = [
        ...sharedResources,
        ...campaignFiles
    ];

    const cacheBust = Date.now();
    for (const file of files) {
        try {
            const response = await fetch(file + '?v=' + cacheBust);
            if (response.ok) {
                const text = await response.text();
                allDocuments[file] = text;
            }
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }
}

// Load and display markdown file
async function loadMarkdown(filename) {
    const mainContainer = document.getElementById('main-container');
    const mainScroller = document.getElementById('main-scroller');

    // Fade out
    mainContainer.classList.add('fade-out');
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        let content;
        if (allDocuments[filename]) {
            content = allDocuments[filename];
        } else {
            const response = await fetch(filename + '?v=' + Date.now());
            if (!response.ok) {
                throw new Error('File not found');
            }
            content = await response.text();
        }

        currentContent = content;
        currentFile = filename;
        // Update URL hash for shareable links & browser history
        const hashPath = filename.replace(/^bonetop\//, '');
        if (window.location.hash.slice(1) !== hashPath) {
            history.pushState(null, '', '#' + hashPath);
        }
        const html = marked.parse(content);
        const contentEl = document.getElementById('content');

        // Cleanup existing cover
        const existingCover = document.querySelector('.page-cover');
        if (existingCover) {
            existingCover.remove();
        }

        // Reset main container padding (preserve fade-out class)
        mainContainer.className = "max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 fade-out";

        // Handle character backgrounds
        if (characterBackgrounds[filename]) {
            mainScroller.classList.add('character-bg');
            mainScroller.style.setProperty('--char-bg-image', `url('${characterBackgrounds[filename]}')`);
        } else {
            mainScroller.classList.remove('character-bg');
            mainScroller.style.removeProperty('--char-bg-image');
        }

        contentEl.innerHTML = html;

        // Show/hide DM-only elements based on current mode
        contentEl.querySelectorAll('.dm-only').forEach(el => {
            el.style.display = isDmMode ? '' : 'none';
        });

        // Auto-link wiki terms
        applyWikiLinks(contentEl, filename);

        // Check for cover image metadata: <!-- cover: url -->
        const coverMatch = content.match(/<!--\s*cover:\s*(.*?)\s*-->/);

        if (coverMatch && coverMatch[1]) {
            const coverUrl = coverMatch[1] === 'season' ? seasonImages[currentSeason] : coverMatch[1];
            const h1 = contentEl.querySelector('h1');

            if (h1) {
                // Create full width cover
                const cover = document.createElement('div');
                cover.className = 'page-cover';

                // Apply background with gradient — uses CSS var so it adapts to season changes
                cover.style.backgroundImage = `
                    linear-gradient(to bottom, rgba(var(--bg-rgb), 0.1) 50%, rgba(var(--bg-rgb), 1) 100%),
                    url('${coverUrl}')
                `;

                // Create inner container for alignment
                const coverContent = document.createElement('div');
                coverContent.className = 'page-cover-content markdown-content';

                // Move H1 into cover
                coverContent.appendChild(h1);
                cover.appendChild(coverContent);

                // Insert before main container
                mainScroller.insertBefore(cover, mainContainer);

                // Remove top padding from main container so it flows nicely
                mainContainer.classList.remove('py-8', 'md:py-12');
                mainContainer.classList.add('pb-8', 'md:pb-12');
            }
        }

        // Highlight active nav item (including parent for subpages)
        highlightNavItem(filename);

        // Update back button visibility
        updateBackButton();

        // Scroll to top
        document.querySelector('main').scrollTop = 0;

        // Fade in
        requestAnimationFrame(() => {
            mainContainer.classList.remove('fade-out');
        });
    } catch (error) {
        document.getElementById('content').innerHTML = `
            <div class="text-center py-20">
                <svg class="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 class="text-2xl font-bold text-white mb-2">Error Loading Document</h2>
                <p class="text-slate-400">Could not load ${filename}</p>
                <p class="text-sm text-slate-400 mt-2">${error.message}</p>
            </div>
        `;
        // Fade in even on error
        mainContainer.classList.remove('fade-out');
    }
}

// Load markdown from mobile modal
function loadMarkdownMobile(filename) {
    closeMobileModal('pages');
    loadMarkdown(filename);
}

// Search functionality
function performSearch(query, targetElement) {
    if (!query) {
        if (targetElement.id === 'mobileSearchResults') {
            targetElement.innerHTML = `
                <div class="text-center py-12 text-slate-400">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p>Start typing to search</p>
                </div>
            `;
        } else if (currentContent) {
            const html = marked.parse(currentContent);
            targetElement.innerHTML = html;
        }
        return;
    }

    // Search through all documents
    let results = [];
    for (const [filename, content] of Object.entries(allDocuments)) {
        // Skip DM files if not in DM mode
        if (!isDmMode && dmFileSet.has(filename)) continue;

        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(query)) {
                results.push({
                    file: filename,
                    line: line,
                    lineNumber: index + 1,
                    context: lines.slice(Math.max(0, index - 1), index + 2).join('\n')
                });
            }
        });
    }

    // Display search results
    if (results.length > 0) {
        const isMobile = targetElement.id === 'mobileSearchResults';

        // Helper to strip HTML tags and clean up the line for display
        function cleanLine(line) {
            return line
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert images to alt text
                .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert links to text
                .replace(/^#+\s*/, '') // Remove heading markers
                .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
                .replace(/\*([^*]+)\*/g, '$1') // Remove italic
                .trim();
        }

        // Filter out empty/useless results and deduplicate by file
        const seenFiles = new Map();
        const filteredResults = results.filter(result => {
            const cleaned = cleanLine(result.line);
            if (!cleaned || cleaned.length < 3) return false;

            // Keep best result per file (first meaningful one)
            if (!seenFiles.has(result.file)) {
                seenFiles.set(result.file, true);
                return true;
            }
            return false;
        });

        let html = isMobile ? '' : `
            <h1>Search Results</h1>
            <p class="text-slate-400 mb-6">Found ${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${query}"</p>
        `;

        if (isMobile) {
            html += `<p class="text-slate-400 mb-4 text-sm">${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''}</p>`;
        }

        filteredResults.forEach(result => {
            const cleanedLine = cleanLine(result.line);
            const highlightedLine = cleanedLine.replace(
                new RegExp(query, 'gi'),
                match => `<mark>${match}</mark>`
            );

            // Get a friendly name from the file path
            const fileName = result.file.split('/').pop().replace('.md', '').replace(/_/g, ' ');
            const friendlyName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

            if (isMobile) {
                html += `
                    <button
                        onclick="loadMarkdownFromSearch('${result.file}')"
                        class="page-item"
                    >
                        <div class="page-item-title">${friendlyName}</div>
                        <div class="page-item-sub line-clamp-2">${highlightedLine}</div>
                    </button>
                `;
            } else {
                html += `
                    <a href="javascript:void(0)" onclick="collapseDesktopSearch(true); loadMarkdown('${result.file}')" class="search-result-card">
                        <div class="search-result-title">${friendlyName}</div>
                        <div class="search-result-excerpt">${highlightedLine}</div>
                    </a>
                `;
            }
        });

        if (filteredResults.length === 0) {
            html = `
                <div class="text-center py-12">
                    <h2 class="text-xl font-bold text-white mb-2">No Results Found</h2>
                    <p class="text-slate-400 text-sm">Try searching for something else</p>
                </div>
            `;
        }

        targetElement.innerHTML = html;
    } else {
        targetElement.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-12 h-12 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <h2 class="text-xl font-bold text-white mb-2">No Results Found</h2>
                <p class="text-slate-400 text-sm">Try searching for something else</p>
            </div>
        `;
    }
}

function loadMarkdownFromSearch(filename) {
    closeMobileModal('search');
    loadMarkdown(filename);
}

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        performSearch(query, document.getElementById('content'));
    }, 300);
});

// Mobile search
let mobileSearchTimeout;
document.getElementById('mobileSearchInput').addEventListener('input', (e) => {
    clearTimeout(mobileSearchTimeout);
    mobileSearchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        performSearch(query, document.getElementById('mobileSearchResults'));
    }, 300);
});

// Desktop floating search
let desktopSearchTimeout;
const desktopSearchInput = document.getElementById('desktopSearchInput');
if (desktopSearchInput) {
    desktopSearchInput.addEventListener('input', (e) => {
        clearTimeout(desktopSearchTimeout);
        desktopSearchTimeout = setTimeout(() => {
            // Only search if the search is still expanded (not being collapsed)
            const container = document.getElementById('desktopSearchContainer');
            if (!container || !container.classList.contains('expanded')) return;

            const query = e.target.value.toLowerCase().trim();
            performSearch(query, document.getElementById('content'));
        }, 300);
    });

    // Allow Escape to close desktop search
    desktopSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            collapseDesktopSearch();
        }
    });
}

// Get parent path for back navigation
function getParentPath(filename) {
    if (!filename) return null;

    const campaign = campaigns[currentCampaign];
    const overviewPath = campaign.basePath + 'campaign_overview.md';

    // Overview has no parent
    if (filename === overviewPath) return null;

    // Get path relative to campaign base
    const relativePath = filename.replace(campaign.basePath, '');
    const pathParts = relativePath.split('/');

    // Compendium detail pages go to their section index
    // e.g., compendium/fauna/frog_boar.md -> compendium/fauna.md
    if (pathParts.length > 2 && pathParts[0] === 'compendium') {
        const section = pathParts[1]; // 'fauna', 'flora', 'recipes'
        return campaign.basePath + 'compendium/' + section + '.md';
    }

    // Compendium section indexes go to overview
    // e.g., compendium/fauna.md -> campaign_overview.md
    if (pathParts.length === 2 && pathParts[0] === 'compendium') {
        return overviewPath;
    }

    // Everything else (characters, NPCs) goes to overview
    return overviewPath;
}

// Navigate to parent page
function goBack() {
    const parentPath = getParentPath(currentFile);
    if (parentPath) {
        // Close any open modals
        const searchModal = document.getElementById('mobileSearchModal');
        const pagesModal = document.getElementById('mobilePagesModal');

        if (searchModal && !searchModal.classList.contains('hidden')) {
            closeMobileModal('search');
        }
        if (pagesModal && !pagesModal.classList.contains('hidden')) {
            closeMobileModal('pages');
        }

        // Close desktop search if open
        collapseDesktopSearch();

        loadMarkdown(parentPath);
    }
}

// Update back button visibility based on current page
function updateBackButton() {
    const parentPath = getParentPath(currentFile);
    const hasParent = parentPath !== null;

    // Desktop back button
    const desktopBackBtn = document.getElementById('desktopBackBtn');
    if (desktopBackBtn) {
        if (hasParent) {
            desktopBackBtn.classList.remove('disabled');
            desktopBackBtn.disabled = false;
        } else {
            desktopBackBtn.classList.add('disabled');
            desktopBackBtn.disabled = true;
        }
    }

    // Mobile back button
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    if (mobileBackBtn) {
        if (hasParent) {
            mobileBackBtn.classList.remove('disabled');
            mobileBackBtn.disabled = false;
        } else {
            mobileBackBtn.classList.add('disabled');
            mobileBackBtn.disabled = true;
        }
    }
}

// Home button (works for both mobile and desktop)
function goHome() {
    // Close any open modals
    const searchModal = document.getElementById('mobileSearchModal');
    const pagesModal = document.getElementById('mobilePagesModal');

    if (searchModal && !searchModal.classList.contains('hidden')) {
        closeMobileModal('search');
    }
    if (pagesModal && !pagesModal.classList.contains('hidden')) {
        closeMobileModal('pages');
    }

    // Close desktop search if open
    collapseDesktopSearch();

    loadMarkdown('bonetop/campaign_overview.md');
}

// Desktop search expand/collapse
function toggleDesktopSearch() {
    const container = document.getElementById('desktopSearchContainer');
    const input = document.getElementById('desktopSearchInput');

    if (container.classList.contains('expanded')) {
        collapseDesktopSearch();
    } else {
        container.classList.add('expanded');
        setTimeout(() => input.focus(), 250);
    }
}

function collapseDesktopSearch(skipReload) {
    const container = document.getElementById('desktopSearchContainer');
    const input = document.getElementById('desktopSearchInput');
    if (container) {
        const hadSearchQuery = input && input.value.trim();
        container.classList.remove('expanded');
        if (input) input.value = '';
        clearTimeout(desktopSearchTimeout);

        // Reload current page if search was used (to restore proper page structure)
        // Skip reload when navigating to a new page from search results
        if (!skipReload && hadSearchQuery && currentFile) {
            loadMarkdown(currentFile);
        }
    }
}

// Close desktop search when clicking outside
document.addEventListener('click', function(e) {
    const container = document.getElementById('desktopSearchContainer');
    if (container && container.classList.contains('expanded')) {
        if (!container.contains(e.target)) {
            collapseDesktopSearch();
        }
    }
});

// Mobile modal functions
function toggleMobileModal(type) {
    const modal = document.getElementById(type === 'search' ? 'mobileSearchModal' : 'mobilePagesModal');
    const isOpen = !modal.classList.contains('hidden');

    if (isOpen) {
        closeMobileModal(type);
    } else {
        const otherType = type === 'search' ? 'pages' : 'search';
        const otherModal = document.getElementById(otherType === 'search' ? 'mobileSearchModal' : 'mobilePagesModal');

        if (!otherModal.classList.contains('hidden')) {
            openMobileModal(type);
            closeModalSilently(otherType);
        } else {
            openMobileModal(type);
        }
    }
}

function closeModalSilently(type) {
    const modal = document.getElementById(type === 'search' ? 'mobileSearchModal' : 'mobilePagesModal');
    const button = document.getElementById(type === 'search' ? 'searchButton' : 'pagesButton');

    modal.classList.remove('mobile-modal-enter');
    modal.classList.add('mobile-modal-exit');
    button.classList.remove('active');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'mobile-modal-exit');
        if (type === 'search') {
            document.getElementById('mobileSearchInput').value = '';
            resetMobileSearchResults();
        }
    }, 250);
}

function openMobileModal(type) {
    const modal = document.getElementById(type === 'search' ? 'mobileSearchModal' : 'mobilePagesModal');
    const button = document.getElementById(type === 'search' ? 'searchButton' : 'pagesButton');

    modal.classList.remove('hidden', 'mobile-modal-exit');
    modal.classList.add('flex', 'mobile-modal-enter');
    document.body.style.overflow = 'hidden';
    button.classList.add('active');

    if (type === 'search') {
        setTimeout(() => document.getElementById('mobileSearchInput').focus(), 100);
    }
}

function closeMobileModal(type) {
    const modal = document.getElementById(type === 'search' ? 'mobileSearchModal' : 'mobilePagesModal');
    const button = document.getElementById(type === 'search' ? 'searchButton' : 'pagesButton');

    modal.classList.remove('mobile-modal-enter');
    modal.classList.add('mobile-modal-exit');
    document.body.style.overflow = '';
    button.classList.remove('active');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'mobile-modal-exit');
    }, 250);

    if (type === 'search') {
        document.getElementById('mobileSearchInput').value = '';
        resetMobileSearchResults();
    }
}

function resetMobileSearchResults() {
    document.getElementById('mobileSearchResults').innerHTML = `
        <div class="text-center py-12 text-slate-400">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <p>Start typing to search</p>
        </div>
    `;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Toggle DM Mode: Alt + Shift + D
    // Using e.code to handle Mac Option key correctly (which changes e.key value)
    if (e.altKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        toggleDmMode();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // On desktop, use the floating search; on mobile, open mobile search modal
        if (window.innerWidth >= 768) {
            const container = document.getElementById('desktopSearchContainer');
            const input = document.getElementById('desktopSearchInput');
            if (container && input) {
                container.classList.add('expanded');
                setTimeout(() => input.focus(), 250);
            }
        } else {
            toggleMobileModal('search');
        }
    }
    
    // Close mobile modals with Escape
    if (e.key === 'Escape') {
        const searchModal = document.getElementById('mobileSearchModal');
        const pagesModal = document.getElementById('mobilePagesModal');
        
        if (searchModal && !searchModal.classList.contains('hidden')) {
            closeMobileModal('search');
        }
        if (pagesModal && !pagesModal.classList.contains('hidden')) {
            closeMobileModal('pages');
        }
    }
});

// Lightbox for bestiary gallery
function openLightbox(element) {
    const img = element.querySelector('img');
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.onclick = () => overlay.remove();

    const lightboxImg = document.createElement('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;

    overlay.appendChild(lightboxImg);
    document.body.appendChild(overlay);

    // Close on escape
    const closeOnEscape = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    document.addEventListener('keydown', closeOnEscape);
}

// Switch main image in bestiary gallery
function switchMainImage(thumbElement, imageSrc) {
    // Update main image
    const mainImg = document.querySelector('.bestiary-gallery-main img');
    if (mainImg) {
        mainImg.src = imageSrc;
        // Re-apply gradient for the new image
        mainImg.onload = () => applyImageGradient(mainImg);
    }

    // Update active state on thumbnails
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
}

// Extract colors from image and apply gradient background
function applyImageGradient(img) {
    if (typeof ColorThief === 'undefined') return;

    const colorThief = new ColorThief();

    const applyGradient = () => {
        try {
            const palette = colorThief.getPalette(img, 5);
            const [c1, c2] = pickContrastingPair(palette);
            const color1 = rgbToHex(c1);
            const color2 = rgbToHex(c2);

            const galleryMain = document.querySelector('.bestiary-gallery-main');
            if (galleryMain) {
                galleryMain.style.setProperty('--bestiary-gradient', `linear-gradient(135deg, ${color1}, ${color2})`);
            }
        } catch (e) {
            console.warn('Color extraction failed:', e);
        }
    };

    // If image is already loaded, extract immediately
    if (img.complete) {
        setTimeout(applyGradient, 50);
    } else {
        img.addEventListener('load', () => setTimeout(applyGradient, 50));
    }
}

function rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Euclidean distance between two RGB colors
function colorDistance([r1, g1, b1], [r2, g2, b2]) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Pick the two most dominant non-background colors from a palette
// ColorThief returns colors sorted by dominance, so after filtering
// out near-white/near-black, the first two are the most representative
function pickContrastingPair(palette) {
    const valid = palette.filter(([r, g, b]) => {
        const brightness = (r + g + b) / 3;
        return brightness > 30 && brightness < 230;
    });

    if (valid.length >= 2) return [valid[0], valid[1]];

    if (valid.length === 1) {
        const fallback = palette.find(c => c !== valid[0]) || palette[1];
        return [valid[0], fallback];
    }

    return [palette[0], palette[1]];
}

// Desaturate and darken a color for better card backgrounds
function adjustColorForCard([r, g, b], saturationMult = 0.7, brightnessMult = 0.8) {
    // Convert to HSL, adjust, convert back
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (Math.max(r, g, b)) {
            case r: h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / 255 / d + 2) / 6; break;
            case b: h = ((r - g) / 255 / d + 4) / 6; break;
        }
    }

    // Adjust saturation and lightness
    s = Math.min(1, s * saturationMult);
    l = Math.min(0.4, l * brightnessMult); // Cap lightness for dark theme

    // Convert back to RGB
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };

    let newR, newG, newB;
    if (s === 0) {
        newR = newG = newB = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        newR = hue2rgb(p, q, h + 1/3);
        newG = hue2rgb(p, q, h);
        newB = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(newR * 255), Math.round(newG * 255), Math.round(newB * 255)];
}

// Apply gradient to compendium card based on its image
function applyCardGradient(img, card) {
    if (typeof ColorThief === 'undefined') return;

    const colorThief = new ColorThief();

    const apply = () => {
        try {
            const palette = colorThief.getPalette(img, 5);
            const [c1, c2] = pickContrastingPair(palette);
            const color1 = adjustColorForCard(c1);
            const color2 = adjustColorForCard(c2, 0.6, 0.6);

            const hex1 = rgbToHex(color1);
            const hex2 = rgbToHex(color2);

            card.style.setProperty('--card-gradient', `linear-gradient(135deg, ${hex1}, ${hex2})`);
            card.style.setProperty('--card-border', `${hex1}33`);
            card.style.setProperty('--card-shadow', `${hex1}40`);
        } catch (e) {
            console.warn('Card color extraction failed:', e);
        }
    };

    if (img.complete && img.naturalWidth > 0) {
        setTimeout(apply, 10);
    } else {
        img.addEventListener('load', () => setTimeout(apply, 10));
    }
}

// Highlight nav item for current page (including parent for subpages)
function highlightNavItem(filename) {
    const campaign = campaigns[currentCampaign];

    // Reset all nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('bg-white/10', 'text-white');
        btn.classList.add('text-slate-300');
    });

    // Find matching nav item - check for exact match or parent match
    let matchFile = filename;

    // If this is a subpage (e.g., compendium/fauna/frog_boar.md), find parent (compendium/fauna.md)
    const relativePath = filename.replace(campaign.basePath, '');
    const pathParts = relativePath.split('/');

    if (pathParts.length > 2) {
        // It's nested: compendium/fauna/frog_boar.md -> compendium/fauna.md
        const parentDir = pathParts.slice(0, -1).join('/');
        matchFile = campaign.basePath + parentDir + '.md';
    }

    // Find and highlight the nav button
    document.querySelectorAll('.nav-item').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(matchFile)) {
            btn.classList.add('bg-white/10', 'text-white');
            btn.classList.remove('text-slate-300');
        }
    });
}

// Mobile bottom bar bubble interaction
(function() {
    const mobileBar = document.getElementById('mobileBottomBar');
    const bubble = document.getElementById('mobileBubble');
    if (!mobileBar || !bubble) return;

    const buttons = mobileBar.querySelectorAll('.mobile-bar-btn');
    let isDragging = false;
    let lastX = 0;
    let wobbleTimeout = null;

    function applyWobble(velocityX) {
        const clampedVel = Math.max(-50, Math.min(50, velocityX));
        const skew = clampedVel * 0.8;
        const scaleX = 1 + Math.abs(clampedVel) * 0.02;
        const scaleY = 1 - Math.abs(clampedVel) * 0.012;

        bubble.style.transform = `scale(${scaleX}, ${scaleY}) skewX(${skew}deg)`;

        clearTimeout(wobbleTimeout);
        wobbleTimeout = setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 100);
    }

    function handleStart(e) {
        isDragging = true;
        mobileBar.classList.add('dragging');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        lastX = clientX;

        // Position bubble at touch point
        const barRect = mobileBar.getBoundingClientRect();
        const relativeX = clientX - barRect.left;
        const clampedX = Math.max(32, Math.min(relativeX, barRect.width - 32));
        bubble.style.left = (clampedX - 32) + 'px';
    }

    function handleMove(e) {
        if (!isDragging) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const barRect = mobileBar.getBoundingClientRect();

        // Calculate velocity for wobble
        const velocity = clientX - lastX;
        lastX = clientX;
        applyWobble(velocity);

        // Follow thumb directly
        const relativeX = clientX - barRect.left;
        const clampedX = Math.max(32, Math.min(relativeX, barRect.width - 32));
        bubble.style.left = (clampedX - 32) + 'px';
    }

    function handleEnd() {
        isDragging = false;
        mobileBar.classList.remove('dragging');
        clearTimeout(wobbleTimeout);
        bubble.style.transform = '';
    }

    // Touch events
    mobileBar.addEventListener('touchstart', handleStart, { passive: true });
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd);

    // Mouse events (for testing on desktop)
    mobileBar.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
})();

// Hash routing
function getPageFromHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    // Add bonetop/ prefix if not present
    return hash.startsWith('bonetop/') ? hash : 'bonetop/' + hash;
}

window.addEventListener('popstate', () => {
    const page = getPageFromHash();
    if (page && page !== currentFile) {
        loadMarkdown(page);
    }
});

// Initialize
renderNav();
loadAllDocuments().then(() => {
    const startPage = getPageFromHash() || 'bonetop/campaign_overview.md';
    loadMarkdown(startPage);
});

