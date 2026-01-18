let allDocuments = {};
let currentContent = '';
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
        name: 'Bonetop',
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
                    { file: 'compendium/recipes.md', name: 'Recipes', sub: 'Food & Alchemy' }
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
                        <button onclick="loadMarkdownMobile('${campaign.basePath}${p.file}')" class="page-item w-full text-left px-4 py-4 rounded-xl bg-slate-800/50 border border-white/20">
                            <div class="font-medium text-white">${p.name}</div>
                            <div class="text-sm text-slate-400 mt-1">${p.sub}</div>
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

    for (const file of files) {
        try {
            const response = await fetch(file);
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
    try {
        let content;
        if (allDocuments[filename]) {
            content = allDocuments[filename];
        } else {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error('File not found');
            }
            content = await response.text();
        }
        
        currentContent = content;
        const html = marked.parse(content);
        const contentEl = document.getElementById('content');
        const mainContainer = document.getElementById('main-container');
        const mainScroller = document.getElementById('main-scroller');
        
        // Cleanup existing cover
        const existingCover = document.querySelector('.page-cover');
        if (existingCover) {
            existingCover.remove();
        }
        
        // Reset main container padding
        mainContainer.className = "max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12";

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
        
        // Highlight active nav item
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('bg-white/10', 'text-white');
            btn.classList.add('text-slate-300');
        });
        if (event && event.target) {
            event.target.closest('button')?.classList.add('bg-white/10', 'text-white');
            event.target.closest('button')?.classList.remove('text-slate-300');
        }
        
        // Scroll to top
        document.querySelector('main').scrollTop = 0;
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
        let html = isMobile ? '' : `
            <h1>Search Results</h1>
            <p class="text-slate-400 mb-6">Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"</p>
        `;
        
        if (isMobile) {
            html += `<p class="text-slate-400 mb-4 text-sm">${results.length} result${results.length !== 1 ? 's' : ''}</p>`;
        }
        
        results.forEach(result => {
            const highlightedLine = result.line.replace(
                new RegExp(query, 'gi'), 
                match => `<mark>${match}</mark>`
            );
            
            if (isMobile) {
                html += `
                    <button 
                        onclick="loadMarkdownFromSearch('${result.file}')" 
                        class="page-item w-full text-left mb-3 p-4 bg-slate-800/50 rounded-xl border border-white/20"
                    >
                        <div class="text-xs text-blue-400 mb-1">${result.file}</div>
                        <div class="text-sm text-slate-300 line-clamp-2">${highlightedLine}</div>
                    </button>
                `;
            } else {
                html += `
                    <div class="mb-6 p-4 bg-slate-800/50 rounded-lg border border-white/20">
                        <div class="text-sm text-blue-400 mb-2">${result.file}</div>
                        <div class="mb-2">${highlightedLine}</div>
                        <button 
                            onclick="loadMarkdown('${result.file}')" 
                            class="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                        >
                            View in document →
                        </button>
                    </div>
                `;
            }
        });
        
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

// Store original button content
    const buttonStates = {
    search: {
        icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>`,
        label: 'Search'
    },
    pages: {
        icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>`,
        label: 'Pages'
    }
};

const closeIcon = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
</svg>`;

// Mobile modal functions
function toggleMobileModal(type) {
    const modal = type === 'search' ? document.getElementById('mobileSearchModal') : document.getElementById('mobilePagesModal');
    const isOpen = !modal.classList.contains('hidden');
    
    if (isOpen) {
        closeMobileModal(type);
    } else {
        // Close the other modal if it's open
        const otherType = type === 'search' ? 'pages' : 'search';
        const otherModal = otherType === 'search' ? document.getElementById('mobileSearchModal') : document.getElementById('mobilePagesModal');
        
        if (!otherModal.classList.contains('hidden')) {
            // Crossfade: Start opening the new modal while the old one closes
            openMobileModal(type);
            closeModalSilently(otherType);
        } else {
            openMobileModal(type);
        }
    }
}

function closeModalSilently(type) {
    const modal = type === 'search' ? document.getElementById('mobileSearchModal') : document.getElementById('mobilePagesModal');
    const button = document.getElementById(type === 'search' ? 'searchButton' : 'pagesButton');
    
    // Start exit animation but let the new modal's entrance cover it
    modal.classList.remove('mobile-modal-enter');
    modal.classList.add('mobile-modal-exit');
    
    // Restore original button content immediately
    button.innerHTML = `
        ${buttonStates[type].icon}
        <span class="text-xs font-medium">${buttonStates[type].label}</span>
    `;
    button.classList.remove('text-red-400');
    button.classList.add('text-slate-400');
    
    // Clean up after animation completes
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'mobile-modal-exit');
        
        if (type === 'search') {
            document.getElementById('mobileSearchInput').value = '';
            document.getElementById('mobileSearchResults').innerHTML = `
                <div class="text-center py-12 text-slate-400">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p>Start typing to search</p>
                </div>
            `;
        }
    }, 250);
}

function openMobileModal(type) {
    const modal = type === 'search' ? document.getElementById('mobileSearchModal') : document.getElementById('mobilePagesModal');
    const button = document.getElementById(type === 'search' ? 'searchButton' : 'pagesButton');
    
    modal.classList.remove('hidden', 'mobile-modal-exit');
    modal.classList.add('flex', 'mobile-modal-enter');
    document.body.style.overflow = 'hidden';
    
    // Transform button to close button
    button.innerHTML = `
        ${closeIcon}
        <span class="text-xs font-medium">Close</span>
    `;
    button.classList.add('text-red-400');
    button.classList.remove('text-slate-400');
    
    if (type === 'search') {
        setTimeout(() => {
            document.getElementById('mobileSearchInput').focus();
        }, 100);
    }
}

function closeMobileModal(type) {
    const modal = type === 'search' ? document.getElementById('mobileSearchModal') : document.getElementById('mobilePagesModal');
    const button = document.getElementById(type === 'search' ? 'searchButton' : 'pagesButton');
    
    modal.classList.remove('mobile-modal-enter');
    modal.classList.add('mobile-modal-exit');
    document.body.style.overflow = '';
    
    // Restore original button content
    button.innerHTML = `
        ${buttonStates[type].icon}
        <span class="text-xs font-medium">${buttonStates[type].label}</span>
    `;
    button.classList.remove('text-red-400');
    button.classList.add('text-slate-400');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'mobile-modal-exit');
    }, 250);
    
    if (type === 'search') {
        document.getElementById('mobileSearchInput').value = '';
        document.getElementById('mobileSearchResults').innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <svg class="w-12 h-12 mx-auto mb-3 opacity-50 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p>Start typing to search</p>
            </div>
        `;
    }
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
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
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

// Initialize
renderNav();
loadAllDocuments().then(() => {
    if (currentCampaign === 'bonetop') {
        loadMarkdown('bonetop/campaign_overview.md');
    }
});

