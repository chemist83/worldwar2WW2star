// ============================================================================
// Age of History II - Enhanced European Theater 1936
// ============================================================================

// Sabitler ve Global Değişkenler
const WAR_CHANCE_BASE = 0.15;
const UNIT_COST = 20;
const INCOME_PER_REGION = 10;
const INITIAL_PLAYER_COINS = 150;
const INITIAL_AI_COINS = 100;
const STARTING_UNITS_PER_REGION = 2;

// AI Personality Types - Enhanced
const AI_PERSONALITIES = {
    AGGRESSIVE: { warChance: 0.3, expansionFocus: 0.8, defenseFocus: 0.2, riskTolerance: 0.7 },
    DEFENSIVE: { warChance: 0.1, expansionFocus: 0.3, defenseFocus: 0.7, riskTolerance: 0.3 },
    BALANCED: { warChance: 0.2, expansionFocus: 0.5, defenseFocus: 0.5, riskTolerance: 0.5 },
    EXPANSIONIST: { warChance: 0.25, expansionFocus: 0.9, defenseFocus: 0.1, riskTolerance: 0.6 },
    DIPLOMATIC: { warChance: 0.15, expansionFocus: 0.4, defenseFocus: 0.6, riskTolerance: 0.4 }
};

// Government Types
const GOVERNMENT_TYPES = {
    democracy: { name: 'Demokrasi', bonus: { income: 1.1, stability: 1.2, warPenalty: 0.8 } },
    monarchy: { name: 'Monarşi', bonus: { income: 1.0, stability: 1.1, warPenalty: 1.0 } },
    dictatorship: { name: 'Diktatörlük', bonus: { income: 1.2, stability: 0.9, warPenalty: 1.1 } },
    communism: { name: 'Komünizm', bonus: { income: 1.15, stability: 1.0, warPenalty: 1.05 } },
    fascism: { name: 'Faşizm', bonus: { income: 1.25, stability: 0.8, warPenalty: 1.2 } }
};

// Historical Leaders Data
const HISTORICAL_LEADERS = {
    'GERMAN_REICH': { name: 'Adolf Hitler', title: 'Führer', image: 'germany.png' },
    'USSR': { name: 'Josef Stalin', title: 'General Secretary', image: 'Başlıksız68_20250802101912.png' },
    'BRITISH_EMPIRE': { name: 'Neville Chamberlain', title: 'Prime Minister', image: 'Başlıksız68_20250802112935.png' },
    'FRENCH_REPUBLIC': { name: 'Édouard Daladier', title: 'Prime Minister', image: 'france.png' },
    'KINGDOM_OF_ITALY': { name: 'Benito Mussolini', title: 'Duce', image: 'italy.png' },
    'POLAND': { name: 'Ignacy Mościcki', title: 'President', image: 'poland.png' },
    'CZECHOSLOVAKIA': { name: 'Edvard Beneš', title: 'President', image: 'czech.png' },
    'HUNGARY': { name: 'Miklós Horthy', title: 'Regent', image: 'hungary.png' },
    'ROMANIA': { name: 'Carol II', title: 'King', image: 'romania.png' },
    'YUGOSLAVIA': { name: 'Peter II', title: 'King', image: 'yugoslavia.png' }
};

// Country Flags
const COUNTRY_FLAGS = {
    'GERMAN_REICH': '🇩🇪',
    'USSR': '🇷🇺',
    'BRITISH_EMPIRE': '🇬🇧',
    'FRENCH_REPUBLIC': '🇫🇷',
    'KINGDOM_OF_ITALY': '🇮🇹',
    'POLAND': '🇵🇱',
    'CZECHOSLOVAKIA': '🇨🇿',
    'HUNGARY': '🇭🇺',
    'ROMANIA': '🇷🇴',
    'YUGOSLAVIA': '🇷🇸',
    'RUSSIAN_FEDERATION': '🇷🇺',
    'RUSSIAN_EMPIRE': '🇷🇺',
    'RUSSIAN_SOVIET': '🇷🇺',
    'RUSSIAN_DEMOCRATIC': '🇷🇺'
};

let playerName = '';
let playerCountryId = '';
let playerCountryName = '';
let currentTurn = 1;
let gameMapObject;
let svgDoc;
let currentAttackMode = false;
let selectedAttackingRegionNutsId = null;
let targetCountryIdForWar = null;
let warDeclarations = {};
let gamePhase = 'setup';
let victoryConditions = {
    territoryControl: 0.6,
    economicDominance: 10000
};

// Enhanced Countries Data - Russia Split into 4 Territories
let countriesData = {
    // Russian Federation (Western Russia)
    'RUSSIAN_FEDERATION': { 
        name: 'Rusya Federasyonu', 
        nuts2: ['EE00', 'LV00', 'LT00', 'FI13', 'FI18', 'FI19', 'FI1A', 'FI20'],
        isPlayer: false, 
        color: '#CC0000', 
        coins: INITIAL_AI_COINS * 1.5,
        units: 0,
        personality: 'AGGRESSIVE',
        capital: 'LV00',
        era: '1936',
        type: 'major_power',
        government: 'dictatorship',
        leader: { name: 'Vladimir Putin', title: 'President', image: 'russia1.png' }
    },
    
    // Russian Empire (Central Russia)
    'RUSSIAN_EMPIRE': { 
        name: 'Rusya İmparatorluğu', 
        nuts2: ['PL11', 'PL12', 'PL21', 'PL22', 'PL31', 'PL32', 'PL33', 'PL34'],
        isPlayer: false, 
        color: '#8B0000', 
        coins: INITIAL_AI_COINS * 1.3,
        units: 0,
        personality: 'BALANCED',
        capital: 'PL12',
        era: '1936',
        type: 'major_power',
        government: 'monarchy',
        leader: { name: 'Nicholas II', title: 'Tsar', image: 'russia2.png' }
    },
    
    // Russian Soviet Republic (Eastern Russia)
    'RUSSIAN_SOVIET': { 
        name: 'Rusya Sovyet Cumhuriyeti', 
        nuts2: ['PL41', 'PL42', 'PL43', 'PL51', 'PL52', 'PL61', 'PL62', 'PL63'],
        isPlayer: false, 
        color: '#DC143C', 
        coins: INITIAL_AI_COINS * 1.4,
        units: 0,
        personality: 'COMMUNIST',
        capital: 'PL52',
        era: '1936',
        type: 'major_power',
        government: 'communism',
        leader: { name: 'Lenin', title: 'Chairman', image: 'russia3.png' }
    },
    
    // Russian Democratic Republic (Northern Russia)
    'RUSSIAN_DEMOCRATIC': { 
        name: 'Rusya Demokratik Cumhuriyeti', 
        nuts2: ['CZ01', 'CZ02', 'CZ03', 'CZ04', 'CZ05', 'CZ06', 'CZ07', 'CZ08'],
        isPlayer: false, 
        color: '#FF4500', 
        coins: INITIAL_AI_COINS * 1.2,
        units: 0,
        personality: 'DIPLOMATIC',
        capital: 'CZ01',
        era: '1936',
        type: 'major_power',
        government: 'democracy',
        leader: { name: 'Alexander Kerensky', title: 'Prime Minister', image: 'russia4.png' }
    },
    
    // Alman Reich (Nazi Almanya)
    'GERMAN_REICH': { 
        name: 'Alman Reich', 
        nuts2: ['DE11', 'DE12', 'DE13', 'DE14', 'DE21', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27', 'DE30', 'DE42', 'DE41', 'DE50', 'DE60', 'DE71', 'DE72', 'DE73', 'DE80', 'DE91', 'DE92', 'DE93', 'DE94', 'DEA1', 'DEA2', 'DEA3', 'DEA4', 'DEA5', 'DEB1', 'DEB2', 'DEB3', 'DEC0', 'DED1', 'DED2', 'DED3', 'DEE0', 'DEF0', 'DEG0', 'AT11', 'AT12', 'AT13', 'AT21', 'AT22', 'AT31', 'AT32', 'AT33', 'AT34'],
        isPlayer: false, 
        color: '#444444', 
        coins: INITIAL_AI_COINS * 2, 
        units: 0,
        personality: 'AGGRESSIVE',
        capital: 'DE30',
        era: '1936',
        type: 'major_power',
        government: 'fascism',
        leader: { name: 'Adolf Hitler', title: 'Führer', image: 'germany.png' }
    },
    
    // Büyük Britanya İmparatorluğu
    'BRITISH_EMPIRE': { 
        name: 'Büyük Britanya İmparatorluğu', 
        nuts2: ['UKC1', 'UKC2', 'UKD1', 'UKD2', 'UKD3', 'UKD4', 'UKD5', 'UKE1', 'UKE2', 'UKE3', 'UKE4', 'UKF1', 'UKF2', 'UKF3', 'UKG1', 'UKG2', 'UKG3', 'UKH1', 'UKH2', 'UKH3', 'UKI1', 'UKI2', 'UKJ1', 'UKJ2', 'UKJ3', 'UKJ4', 'UKK1', 'UKK2', 'UKK3', 'UKK4', 'UKL1', 'UKL2', 'UKM2', 'UKM3', 'UKM5', 'UKM6', 'UKN0', 'IE01', 'IE02'],
        isPlayer: false, 
        color: '#000080', 
        coins: INITIAL_AI_COINS * 2, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'UKI1',
        era: '1936',
        type: 'major_power',
        government: 'democracy',
        leader: { name: 'Neville Chamberlain', title: 'Prime Minister', image: 'Başlıksız68_20250802112935.png' }
    },
    
    // Fransız Cumhuriyeti
    'FRENCH_REPUBLIC': { 
        name: 'Fransız Cumhuriyeti', 
        nuts2: ['FR10', 'FR21', 'FR22', 'FR23', 'FR24', 'FR25', 'FR26', 'FR30', 'FR41', 'FR42', 'FR43', 'FR51', 'FR52', 'FR53', 'FR61', 'FR62', 'FR63', 'FR71', 'FR72', 'FR81', 'FR82', 'FR83', 'BE10', 'BE21', 'BE22', 'BE23', 'BE24', 'BE25', 'BE31', 'BE32', 'BE33', 'BE34', 'BE35', 'NL11', 'NL12', 'NL13', 'NL21', 'NL22', 'NL23', 'NL31', 'NL32', 'NL33', 'NL34', 'NL41', 'NL42', 'LU00'],
        isPlayer: false, 
        color: '#0066CC', 
        coins: INITIAL_AI_COINS * 1.5, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'FR10',
        era: '1936',
        type: 'major_power',
        government: 'democracy',
        leader: { name: 'Édouard Daladier', title: 'Prime Minister', image: 'france.png' }
    },
    
    // İtalyan Krallığı
    'KINGDOM_OF_ITALY': { 
        name: 'İtalyan Krallığı', 
        nuts2: ['ITC1', 'ITC2', 'ITC3', 'ITC4', 'ITD1', 'ITD2', 'ITD3', 'ITD4', 'ITD5', 'ITE1', 'ITE2', 'ITE3', 'ITE4', 'ITF1', 'ITF2', 'ITF3', 'ITF4', 'ITF5', 'ITF6', 'ITG1', 'ITG2'], 
        isPlayer: false, 
        color: '#008000', 
        coins: INITIAL_AI_COINS * 1.5, 
        units: 0,
        personality: 'EXPANSIONIST',
        capital: 'ITE4',
        era: '1936',
        type: 'major_power',
        government: 'fascism',
        leader: { name: 'Benito Mussolini', title: 'Duce', image: 'italy.png' }
    },
    
    // Yugoslavya Krallığı
    'YUGOSLAVIA': { 
        name: 'Yugoslavya Krallığı', 
        nuts2: ['HR01', 'HR02', 'HR03', 'SI01', 'SI02', 'MK00', 'BG31', 'BG32'],
        isPlayer: false, 
        color: '#6B8E23', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'HR01',
        era: '1936',
        type: 'minor_power',
        government: 'monarchy',
        leader: { name: 'Peter II', title: 'King', image: 'yugoslavia.png' }
    },
    
    // Çekoslovakya Cumhuriyeti
    'CZECHOSLOVAKIA': { 
        name: 'Çekoslovakya Cumhuriyeti', 
        nuts2: ['SK01', 'SK02', 'SK03', 'SK04'], 
        isPlayer: false, 
        color: '#4169E1', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'SK01',
        era: '1936',
        type: 'minor_power',
        government: 'democracy',
        leader: { name: 'Edvard Beneš', title: 'President', image: 'czech.png' }
    },
    
    // Polonya Cumhuriyeti
    'POLAND': { 
        name: 'Polonya Cumhuriyeti', 
        nuts2: ['HU10', 'HU21', 'HU22', 'HU23', 'HU31', 'HU32', 'HU33'], 
        isPlayer: false, 
        color: '#DC143C', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'HU10',
        era: '1936',
        type: 'minor_power',
        government: 'democracy',
        leader: { name: 'Ignacy Mościcki', title: 'President', image: 'poland.png' }
    },
    
    // Romanya Krallığı
    'ROMANIA': { 
        name: 'Romanya Krallığı', 
        nuts2: ['RO11', 'RO12', 'RO21', 'RO22', 'RO31', 'RO32', 'RO41', 'RO42', 'BG33', 'BG34', 'BG41', 'BG42'],
        isPlayer: false, 
        color: '#FFD700', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'BALANCED',
        capital: 'RO32',
        era: '1936',
        type: 'minor_power',
        government: 'monarchy',
        leader: { name: 'Carol II', title: 'King', image: 'romania.png' }
    },
    
    // Macaristan Krallığı
    'HUNGARY': { 
        name: 'Macaristan Krallığı', 
        nuts2: ['RO11', 'RO12', 'RO21', 'RO22'], 
        isPlayer: false, 
        color: '#228B22', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'BALANCED',
        capital: 'RO11',
        era: '1936',
        type: 'minor_power',
        government: 'monarchy',
        leader: { name: 'Miklós Horthy', title: 'Regent', image: 'hungary.png' }
    }
};

// DOM Elementleri
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const playerNameInput = document.getElementById('playerNameInput');
const startGameButton = document.getElementById('startGameButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const turnCounter = document.getElementById('turnCounter');
const playerCoinElement = document.getElementById('playerCoin');
const playerUnitsReadyElement = document.getElementById('playerUnitsReady');
const playerCountryNameElement = document.getElementById('playerCountryName');
const buyUnitButton = document.getElementById('buyUnitButton');
const nextTurnButton = document.getElementById('nextTurnButton');
const mapContainer = document.getElementById('mapContainer');
const gameMapSVG = document.getElementById('gameMapObject');
const unitCountsOverlay = document.getElementById('unitCountsOverlay');
const notificationsList = document.getElementById('notificationList');

const countrySelectionModal = document.getElementById('countrySelectionModal');
const countryListDiv = document.getElementById('countryList');
const selectCountryButton = document.getElementById('selectCountryButton');

const countryDetailModal = document.getElementById('countryDetailModal');
const countryDetailName = document.getElementById('countryDetailName');
const countryDetailType = document.getElementById('countryDetailType');
const countryFlag = document.getElementById('countryFlag');
const countryLeaderImage = document.getElementById('countryLeaderImage');
const countryLeaderName = document.getElementById('countryLeaderName');
const countryLeaderTitle = document.getElementById('countryLeaderTitle');
const countryDetailCoins = document.getElementById('countryDetailCoins');
const countryDetailUnits = document.getElementById('countryDetailUnits');
const countryDetailRegions = document.getElementById('countryDetailRegions');
const governmentTypeSelect = document.getElementById('governmentTypeSelect');
const changeGovernmentButton = document.getElementById('changeGovernmentButton');
const relationsList = document.getElementById('relationsList');
const closeCountryDetailButton = document.getElementById('closeCountryDetailButton');

const targetCountrySelect = document.getElementById('targetCountrySelect');
const declareWarButton = document.getElementById('declareWarButton');

// Event Listeners
startGameButton.addEventListener('click', startGame);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startGame();
});

selectCountryButton.addEventListener('click', () => {
    const selectedCountry = document.querySelector('.country-option.selected');
    if (selectedCountry) {
        playerCountryId = selectedCountry.dataset.countryId;
        playerCountryName = countriesData[playerCountryId].name;
        countriesData[playerCountryId].isPlayer = true;
        countrySelectionModal.style.display = 'none';
        gameScreen.style.display = 'grid';
        initializeGame();
    }
});

buyUnitButton.addEventListener('click', buyUnit);
nextTurnButton.addEventListener('click', nextTurn);
declareWarButton.addEventListener('click', declareWar);
changeGovernmentButton.addEventListener('click', changeGovernment);
closeCountryDetailButton.addEventListener('click', () => {
    countryDetailModal.style.display = 'none';
});

// Enhanced Functions
function addNotification(message) {
    const li = document.createElement('li');
    li.textContent = message;
    li.style.animation = 'fadeIn 0.5s ease-in';
    notificationsList.insertBefore(li, notificationsList.firstChild);
    
    if (notificationsList.children.length > 10) {
        notificationsList.removeChild(notificationsList.lastChild);
    }
}

function updateUI() {
    if (playerCountryId && countriesData[playerCountryId]) {
        const country = countriesData[playerCountryId];
        playerCoinElement.textContent = Math.floor(country.coins);
        playerUnitsReadyElement.textContent = country.units;
        playerCountryNameElement.textContent = country.name;
        turnCounter.textContent = currentTurn;
        
        // Update welcome message with leader name
        welcomeMessage.textContent = `🏛️ ${playerName} - ${country.name} Lideri`;
    }
}

function renderUnitCounts() {
    unitCountsOverlay.innerHTML = '';
    
    Object.keys(countriesData).forEach(countryId => {
        const country = countriesData[countryId];
        if (country.nuts2 && country.nuts2.length > 0) {
            country.nuts2.forEach(nutsId => {
                const region = svgDoc.querySelector(`[data-iso="${nutsId}"]`);
                if (region) {
                    const unitCount = Math.floor(Math.random() * 5) + 1; // Simulated unit count
                    const overlay = document.createElement('div');
                    overlay.className = 'unit-count-overlay';
                    overlay.textContent = unitCount;
                    overlay.style.position = 'absolute';
                    overlay.style.color = getContrastColor(country.color);
                    overlay.style.fontWeight = 'bold';
                    overlay.style.fontSize = '12px';
                    overlay.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
                    
                    const bbox = region.getBBox();
                    overlay.style.left = `${bbox.x + bbox.width/2}px`;
                    overlay.style.top = `${bbox.y + bbox.height/2}px`;
                    
                    unitCountsOverlay.appendChild(overlay);
                }
            });
        }
    });
}

function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1,2), 16);
    const g = parseInt(hexcolor.substr(3,2), 16);
    const b = parseInt(hexcolor.substr(5,2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

function initializeGame() {
    loadMapAndInitializeRegions();
    populateCountrySelectionModal();
    updateUI();
    addNotification(`🎮 ${playerName} ${playerCountryName} liderliğini üstlendi!`);
}

function populateCountrySelectionModal() {
    countryListDiv.innerHTML = '';
    
    Object.keys(countriesData).forEach(countryId => {
        const country = countriesData[countryId];
        const countryDiv = document.createElement('div');
        countryDiv.className = 'country-option';
        countryDiv.dataset.countryId = countryId;
        
        countryDiv.innerHTML = `
            <div class="country-name">${country.name}</div>
            <div class="country-info">
                ${country.type === 'major_power' ? '🌍 Büyük Güç' : '🏛️ Küçük Güç'} • 
                ${GOVERNMENT_TYPES[country.government].name}
            </div>
        `;
        
        countryDiv.addEventListener('click', () => {
            document.querySelectorAll('.country-option').forEach(opt => opt.classList.remove('selected'));
            countryDiv.classList.add('selected');
        });
        
        countryListDiv.appendChild(countryDiv);
    });
}

function startGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Lütfen liderinizin adını girin!');
        return;
    }
    
    startScreen.style.display = 'none';
    countrySelectionModal.style.display = 'flex';
}

function loadMapAndInitializeRegions() {
    gameMapSVG.addEventListener('load', function() {
        svgDoc = gameMapSVG.contentDocument;
        initializeRegions();
        renderUnitCounts();
        updateTargetCountrySelect();
    });
}

function initializeRegions() {
    Object.keys(countriesData).forEach(countryId => {
        const country = countriesData[countryId];
        if (country.nuts2) {
            country.nuts2.forEach(nutsId => {
                const region = svgDoc.querySelector(`[data-iso="${nutsId}"]`);
                if (region) {
                    region.style.fill = country.color;
                    region.style.cursor = 'pointer';
                    region.style.transition = 'fill 0.3s ease';
                    
                    region.addEventListener('click', () => onRegionClick(nutsId));
                    region.addEventListener('mouseenter', () => {
                        if (!currentAttackMode) {
                            region.style.fill = lightenColor(country.color, 20);
                        }
                    });
                    region.addEventListener('mouseleave', () => {
                        if (!currentAttackMode) {
                            region.style.fill = country.color;
                        }
                    });
                }
            });
        }
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function onRegionClick(nutsId) {
    const countryId = getCountryIdFromNutsId(nutsId);
    
    if (!countryId) return;
    
    // Show country detail modal
    showCountryDetailModal(countryId);
}

function showCountryDetailModal(countryId) {
    const country = countriesData[countryId];
    if (!country) return;
    
    // Update modal content
    countryDetailName.textContent = country.name;
    countryDetailType.textContent = GOVERNMENT_TYPES[country.government].name;
    countryFlag.textContent = COUNTRY_FLAGS[countryId] || '🏳️';
    
    // Leader info
    if (country.leader) {
        countryLeaderName.textContent = country.leader.name;
        countryLeaderTitle.textContent = country.leader.title;
        if (country.leader.image) {
            countryLeaderImage.src = country.leader.image;
            countryLeaderImage.style.display = 'block';
        } else {
            countryLeaderImage.style.display = 'none';
        }
    }
    
    // Stats
    countryDetailCoins.textContent = Math.floor(country.coins);
    countryDetailUnits.textContent = country.units;
    countryDetailRegions.textContent = country.nuts2 ? country.nuts2.length : 0;
    
    // Government type selector
    governmentTypeSelect.value = country.government;
    
    // Relations
    updateRelationsList(countryId);
    
    // Show modal
    countryDetailModal.style.display = 'flex';
}

function updateRelationsList(countryId) {
    relationsList.innerHTML = '';
    
    Object.keys(countriesData).forEach(otherCountryId => {
        if (otherCountryId !== countryId) {
            const relationItem = document.createElement('div');
            relationItem.className = 'relation-item';
            
            const status = getRelationStatus(countryId, otherCountryId);
            const statusClass = `relation-${status}`;
            const statusText = status === 'allied' ? 'Müttefik' : 
                             status === 'enemy' ? 'Düşman' : 'Tarafsız';
            
            relationItem.innerHTML = `
                <span class="relation-country">${countriesData[otherCountryId].name}</span>
                <span class="relation-status ${statusClass}">${statusText}</span>
            `;
            
            relationsList.appendChild(relationItem);
        }
    });
}

function getRelationStatus(country1, country2) {
    // Simple relation logic - can be enhanced
    if (warDeclarations[country1] === country2 || warDeclarations[country2] === country1) {
        return 'enemy';
    }
    
    // Random relations for now
    const rand = Math.random();
    if (rand < 0.2) return 'allied';
    if (rand < 0.4) return 'enemy';
    return 'neutral';
}

function changeGovernment() {
    const newGovernment = governmentTypeSelect.value;
    const countryId = getCurrentCountryFromModal();
    
    if (countryId && countriesData[countryId]) {
        const oldGovernment = countriesData[countryId].government;
        countriesData[countryId].government = newGovernment;
        
        addNotification(`🏛️ ${countriesData[countryId].name} yönetim biçimi ${GOVERNMENT_TYPES[oldGovernment].name}'den ${GOVERNMENT_TYPES[newGovernment].name}'ye değiştirildi!`);
        
        // Apply government bonuses
        applyGovernmentBonuses(countryId);
        
        updateUI();
    }
}

function getCurrentCountryFromModal() {
    // This is a simplified version - in a real implementation, you'd track which country is being viewed
    return playerCountryId;
}

function applyGovernmentBonuses(countryId) {
    const country = countriesData[countryId];
    const bonuses = GOVERNMENT_TYPES[country.government].bonus;
    
    // Apply income bonus
    country.coins *= bonuses.income;
    
    addNotification(`💰 ${country.name} gelir bonusu uygulandı!`);
}

function buyUnit() {
    if (!playerCountryId || !countriesData[playerCountryId]) return;
    
    const country = countriesData[playerCountryId];
    if (country.coins >= UNIT_COST) {
        country.coins -= UNIT_COST;
        country.units += 1;
        updateUI();
        addNotification(`⚔️ ${country.name} için yeni birlik üretildi!`);
    } else {
        addNotification(`❌ Yetersiz altın! Birlik üretmek için ${UNIT_COST} altın gerekli.`);
    }
}

function declareWar() {
    const targetCountry = targetCountrySelect.value;
    if (targetCountry === 'none' || !playerCountryId) return;
    
    if (warDeclarations[playerCountryId] === targetCountry) {
        addNotification(`⚠️ ${countriesData[targetCountry].name} ile zaten savaş halindesiniz!`);
        return;
    }
    
    warDeclarations[playerCountryId] = targetCountry;
    addNotification(`⚔️ ${countriesData[playerCountryId].name} ${countriesData[targetCountry].name}'ye savaş ilan etti!`);
    
    // Enhanced AI response
    if (Math.random() < 0.7) { // 70% chance AI declares war back
        warDeclarations[targetCountry] = playerCountryId;
        addNotification(`⚔️ ${countriesData[targetCountry].name} karşı savaş ilan etti!`);
    }
}

function nextTurn() {
    currentTurn++;
    
    // Player income
    if (playerCountryId && countriesData[playerCountryId]) {
        const country = countriesData[playerCountryId];
        const income = (country.nuts2 ? country.nuts2.length : 0) * INCOME_PER_REGION;
        const governmentBonus = GOVERNMENT_TYPES[country.government].bonus.income;
        const totalIncome = Math.floor(income * governmentBonus);
        
        country.coins += totalIncome;
        addNotification(`💰 ${country.name} ${totalIncome} altın gelir elde etti!`);
    }
    
    // Enhanced AI Logic
    runEnhancedAILogic();
    
    updateUI();
    addNotification(`⏭️ Tur ${currentTurn} başladı!`);
    
    // Check victory conditions
    checkVictoryConditions();
}

function runEnhancedAILogic() {
    Object.keys(countriesData).forEach(countryId => {
        if (countryId !== playerCountryId && countriesData[countryId]) {
            const country = countriesData[countryId];
            const personality = AI_PERSONALITIES[country.personality];
            
            // AI Income
            const income = (country.nuts2 ? country.nuts2.length : 0) * INCOME_PER_REGION;
            const governmentBonus = GOVERNMENT_TYPES[country.government].bonus.income;
            country.coins += Math.floor(income * governmentBonus);
            
            // Smart AI Decisions
            makeSmartAIDecisions(countryId, personality);
        }
    });
}

function makeSmartAIDecisions(countryId, personality) {
    const country = countriesData[countryId];
    
    // Economic decisions
    if (country.coins >= UNIT_COST * 2 && Math.random() < personality.expansionFocus) {
        country.coins -= UNIT_COST;
        country.units += 1;
        addNotification(`🤖 ${country.name} birlik üretti!`);
    }
    
    // Diplomatic decisions
    if (Math.random() < personality.warChance) {
        const neighbors = getNeighboringCountries(countryId);
        if (neighbors.length > 0) {
            const target = neighbors[Math.floor(Math.random() * neighbors.length)];
            if (!warDeclarations[countryId] && !warDeclarations[target]) {
                warDeclarations[countryId] = target;
                addNotification(`🤖 ${country.name} ${countriesData[target].name}'ye savaş ilan etti!`);
            }
        }
    }
    
    // Government changes (rare)
    if (Math.random() < 0.05) { // 5% chance
        const governments = Object.keys(GOVERNMENT_TYPES);
        const newGovernment = governments[Math.floor(Math.random() * governments.length)];
        country.government = newGovernment;
        addNotification(`🏛️ ${country.name} yönetim biçimi ${GOVERNMENT_TYPES[newGovernment].name}'ye değişti!`);
    }
}

function getNeighboringCountries(countryId) {
    // Simplified neighbor logic - in real implementation, check actual borders
    const allCountries = Object.keys(countriesData);
    return allCountries.filter(id => id !== countryId && id !== playerCountryId);
}

function getCountryIdFromNutsId(nutsId) {
    for (const [countryId, country] of Object.entries(countriesData)) {
        if (country.nuts2 && country.nuts2.includes(nutsId)) {
            return countryId;
        }
    }
    return null;
}

function updateTargetCountrySelect() {
    targetCountrySelect.innerHTML = '<option value="none">-- Devlet Seçiniz --</option>';
    
    Object.keys(countriesData).forEach(countryId => {
        if (countryId !== playerCountryId) {
            const option = document.createElement('option');
            option.value = countryId;
            option.textContent = countriesData[countryId].name;
            targetCountrySelect.appendChild(option);
        }
    });
}

function checkVictoryConditions() {
    if (!playerCountryId) return;
    
    const country = countriesData[playerCountryId];
    
    // Territory control victory
    const totalRegions = Object.values(countriesData).reduce((sum, c) => sum + (c.nuts2 ? c.nuts2.length : 0), 0);
    const playerRegions = country.nuts2 ? country.nuts2.length : 0;
    const territoryControl = playerRegions / totalRegions;
    
    if (territoryControl >= victoryConditions.territoryControl) {
        endGame('territory', playerCountryId);
        return;
    }
    
    // Economic victory
    if (country.coins >= victoryConditions.economicDominance) {
        endGame('economic', playerCountryId);
        return;
    }
    
    // Defeat check
    if (country.nuts2 && country.nuts2.length === 0) {
        endGame('defeat');
        return;
    }
}

function endGame(victoryType, winnerId = null) {
    let message = '';
    
    switch (victoryType) {
        case 'territory':
            message = `🏆 ${countriesData[winnerId].name} Avrupa'nın %60'ını kontrol ederek zafer kazandı!`;
            break;
        case 'economic':
            message = `💰 ${countriesData[winnerId].name} ekonomik üstünlük sağlayarak zafer kazandı!`;
            break;
        case 'defeat':
            message = `💀 ${playerName} tüm topraklarını kaybetti!`;
            break;
    }
    
    alert(message);
    location.reload();
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Pre-load any images
    Object.values(HISTORICAL_LEADERS).forEach(leader => {
        if (leader.image) {
            const img = new Image();
            img.src = leader.image;
        }
    });
});
