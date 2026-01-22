let allDocuments = {};
let currentContent = '';
let currentFile = '';
let currentCampaign = 'bonetop';
let isDmMode = false;
const dmFileSet = new Set();

const campaigns = {
    'prison-planet': {
        name: 'Prison Planet',
        description: 'Space western',
        icon: '🪐',
        basePath: 'prison-planet/',
        sections: [
            {
                title: 'Player Characters',
                items: [
                    { file: 'javan.md', name: 'Bran', sub: 'Played by Javan' },
                    { file: 'pat.md', name: 'Bory', sub: 'Played by Pat' },
                    { file: 'tess.md', name: 'Nyra', sub: 'Played by Tess' },
                    { file: 'sarah.md', name: 'Madsen', sub: 'Played by Sarah' }
                ]
            }
        ]
    },
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
                    { file: 'session_1_prep.md', name: 'Session 1 Prep', sub: 'Encounters & Scenes', dmOnly: true },
                    { file: 'dm_notes.md', name: 'DM Notes', sub: 'Factions & Goals', dmOnly: true }
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
                    { file: 'compendium/recipes.md', name: 'Feasts', sub: 'Culinary Creations' }
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

function toggleCampaign() {
    currentCampaign = currentCampaign === 'prison-planet' ? 'bonetop' : 'prison-planet';
    renderNav();
    loadAllDocuments();
    
    if (currentCampaign === 'bonetop') {
        loadMarkdown('bonetop/campaign_overview.md');
    } else {
        // Reset content to welcome screen for other campaigns
        document.getElementById('content').innerHTML = `
            <div class="text-center py-12 md:py-20">
                <svg class="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <h1 class="text-2xl md:text-4xl font-bold text-white mb-4">Welcome to ${campaigns[currentCampaign].name}</h1>
                <p class="text-slate-400 text-base md:text-lg mb-8 hidden md:block">Select a document from the sidebar to begin</p>
            </div>
        `;
    }
}

function toggleDmMode() {
    isDmMode = !isDmMode;
    console.log('DM Mode:', isDmMode);
    renderNav();
    // Reload documents if turning on DM mode to ensure we have them
    if (isDmMode) loadAllDocuments();
    
    // Visual feedback
    const indicator = document.createElement('div');
    indicator.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-1000';
    indicator.textContent = isDmMode ? 'DM Mode Enabled' : 'DM Mode Disabled';
    document.body.appendChild(indicator);
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 1000);
    }, 2000);
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
        document.getElementById('campaign-toggle-btn'),
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

        // Check for cover image metadata: <!-- cover: url -->
        const coverMatch = content.match(/<!--\s*cover:\s*(.*?)\s*-->/);

        if (coverMatch && coverMatch[1]) {
            const coverUrl = coverMatch[1];
            const h1 = contentEl.querySelector('h1');

            if (h1) {
                // Create full width cover
                const cover = document.createElement('div');
                cover.className = 'page-cover';

                // Apply background with gradient
                cover.style.backgroundImage = `
                    linear-gradient(to bottom, rgba(2, 6, 23, 0.1) 50%, rgba(2, 6, 23, 1) 100%),
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
                    <a href="javascript:void(0)" onclick="loadMarkdown('${result.file}')" class="search-result-card">
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

function collapseDesktopSearch() {
    const container = document.getElementById('desktopSearchContainer');
    const input = document.getElementById('desktopSearchInput');
    if (container) {
        const hadSearchQuery = input && input.value.trim();
        container.classList.remove('expanded');
        if (input) input.value = '';
        clearTimeout(desktopSearchTimeout);

        // Reload current page if search was used (to restore proper page structure)
        if (hadSearchQuery && currentFile) {
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
            const color1 = rgbToHex(palette[0]);
            const color2 = rgbToHex(palette[1]);

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
            const color1 = adjustColorForCard(palette[0]);
            const color2 = adjustColorForCard(palette[1], 0.6, 0.6);

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

// Initialize
renderNav();
loadAllDocuments().then(() => {
    if (currentCampaign === 'bonetop') {
        loadMarkdown('bonetop/campaign_overview.md');
    }
});

