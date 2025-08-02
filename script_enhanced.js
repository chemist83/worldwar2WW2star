// ============================================================================
// Age of History Enhanced - Gelişmiş Strateji Oyunu
// ============================================================================

// Sabitler ve Global Değişkenler
const WAR_CHANCE_BASE = 0.15;
const UNIT_COST = 20;
const INCOME_PER_REGION = 10;
const INITIAL_PLAYER_COINS = 150;
const INITIAL_AI_COINS = 100;
const STARTING_UNITS_PER_REGION = 2;

// AI Personality Types - Age of History tarzı
const AI_PERSONALITIES = {
    AGGRESSIVE: { warChance: 0.3, expansionFocus: 0.8, defenseFocus: 0.2, buildChance: 0.7 },
    DEFENSIVE: { warChance: 0.1, expansionFocus: 0.3, defenseFocus: 0.7, buildChance: 0.9 },
    BALANCED: { warChance: 0.2, expansionFocus: 0.5, defenseFocus: 0.5, buildChance: 0.6 },
    EXPANSIONIST: { warChance: 0.25, expansionFocus: 0.9, defenseFocus: 0.1, buildChance: 0.8 }
};

// Government Types - Age of History tarzı
const GOVERNMENT_TYPES = {
    DEMOCRACY: { name: 'Demokrasi', incomeBonus: 1.2, stabilityBonus: 1.3, militaryPenalty: 0.9 },
    DICTATORSHIP: { name: 'Diktatörlük', incomeBonus: 0.8, stabilityBonus: 0.7, militaryBonus: 1.4 },
    MONARCHY: { name: 'Monarşi', incomeBonus: 1.1, stabilityBonus: 1.2, militaryBonus: 1.1 },
    COMMUNISM: { name: 'Komünizm', incomeBonus: 1.0, stabilityBonus: 1.1, militaryBonus: 1.3 },
    FASCISM: { name: 'Faşizm', incomeBonus: 0.9, stabilityBonus: 0.8, militaryBonus: 1.5 }
};

let playerName = '';
let playerCountryId = '';
let playerCountryName = '';
let currentTurn = 1;
let gameMapObject;
let svgDoc;

// Savaş ve diplomasi sistemi
let currentAttackMode = false;
let selectedAttackingRegionNutsId = null;
let targetCountryIdForWar = null;
let warDeclarations = {};

// Age of History tarzı game state
let gamePhase = 'setup';
let victoryConditions = {
    territoryControl: 0.6,
    economicDominance: 10000
};

// Country click menu state
let selectedCountryForMenu = null;
let countryMenuOpen = false;

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

const targetCountrySelect = document.getElementById('targetCountrySelect');
const declareWarButton = document.getElementById('declareWarButton');

// Ülke Verileri - RUSYA 4 PARÇAYA BÖLÜNDÜ
let countriesData = {
    // Batı Rusya (Western Russia)
    'WESTERN_RUSSIA': { 
        name: 'Batı Rusya', 
        nuts2: ['EE00', 'LV00', 'LT00', 'FI13', 'FI18', 'FI19', 'FI1A', 'FI20'],
        isPlayer: false, 
        color: '#CC0000', 
        coins: INITIAL_AI_COINS * 1.5,
        units: 0,
        personality: 'AGGRESSIVE',
        capital: 'LV00',
        era: '1936',
        type: 'major_power',
        government: 'COMMUNISM',
        leader: 'Joseph Stalin',
        flag: '🇷🇺',
        population: 45000000,
        stability: 0.8,
        technology: 0.7
    },
    
    // Orta Rusya (Central Russia)
    'CENTRAL_RUSSIA': { 
        name: 'Orta Rusya', 
        nuts2: ['BLR'],
        isPlayer: false, 
        color: '#AA0000', 
        coins: INITIAL_AI_COINS * 1.2,
        units: 0,
        personality: 'BALANCED',
        capital: 'BLR',
        era: '1936',
        type: 'major_power',
        government: 'COMMUNISM',
        leader: 'Nikolai Bukharin',
        flag: '🇷🇺',
        population: 35000000,
        stability: 0.7,
        technology: 0.6
    },
    
    // Sibirya (Siberia)
    'SIBERIA': { 
        name: 'Sibirya', 
        nuts2: ['KAZ'],
        isPlayer: false, 
        color: '#880000', 
        coins: INITIAL_AI_COINS * 1.0,
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'KAZ',
        era: '1936',
        type: 'major_power',
        government: 'COMMUNISM',
        leader: 'Sergo Ordzhonikidze',
        flag: '🇷🇺',
        population: 25000000,
        stability: 0.6,
        technology: 0.5
    },
    
    // Uzak Doğu Rusya (Far East Russia)
    'FAR_EAST_RUSSIA': { 
        name: 'Uzak Doğu Rusya', 
        nuts2: ['RUS_FAR_EAST'],
        isPlayer: false, 
        color: '#660000', 
        coins: INITIAL_AI_COINS * 0.8,
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'RUS_FAR_EAST',
        era: '1936',
        type: 'major_power',
        government: 'COMMUNISM',
        leader: 'Kliment Voroshilov',
        flag: '🇷🇺',
        population: 15000000,
        stability: 0.5,
        technology: 0.4
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
        government: 'FASCISM',
        leader: 'Adolf Hitler',
        flag: '🇩🇪',
        population: 80000000,
        stability: 0.9,
        technology: 0.9
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
        government: 'DEMOCRACY',
        leader: 'Neville Chamberlain',
        flag: '🇬🇧',
        population: 50000000,
        stability: 0.8,
        technology: 0.8
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
        government: 'DEMOCRACY',
        leader: 'Édouard Daladier',
        flag: '🇫🇷',
        population: 42000000,
        stability: 0.7,
        technology: 0.7
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
        government: 'FASCISM',
        leader: 'Benito Mussolini',
        flag: '🇮🇹',
        population: 45000000,
        stability: 0.8,
        technology: 0.6
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
        government: 'MONARCHY',
        leader: 'Peter II',
        flag: '🇷🇸',
        population: 15000000,
        stability: 0.6,
        technology: 0.4
    },
    
    // Çekoslovakya Cumhuriyeti
    'CZECHOSLOVAKIA': { 
        name: 'Çekoslovakya Cumhuriyeti', 
        nuts2: ['CZ01', 'CZ02', 'CZ03', 'CZ04', 'CZ05', 'CZ06', 'CZ07', 'CZ08', 'SK01', 'SK02', 'SK03', 'SK04'], 
        isPlayer: false, 
        color: '#4169E1', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'CZ01',
        era: '1936',
        type: 'minor_power',
        government: 'DEMOCRACY',
        leader: 'Edvard Beneš',
        flag: '🇨🇿',
        population: 15000000,
        stability: 0.7,
        technology: 0.6
    },
    
    // Polonya Cumhuriyeti
    'POLAND': { 
        name: 'Polonya Cumhuriyeti', 
        nuts2: ['PL11', 'PL12', 'PL21', 'PL22', 'PL31', 'PL32', 'PL33', 'PL34', 'PL41', 'PL42', 'PL43', 'PL51', 'PL52', 'PL61', 'PL62', 'PL63'], 
        isPlayer: false, 
        color: '#DC143C', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'DEFENSIVE',
        capital: 'PL12',
        era: '1936',
        type: 'minor_power',
        government: 'DEMOCRACY',
        leader: 'Ignacy Mościcki',
        flag: '🇵🇱',
        population: 35000000,
        stability: 0.6,
        technology: 0.5
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
        government: 'MONARCHY',
        leader: 'Carol II',
        flag: '🇷🇴',
        population: 20000000,
        stability: 0.5,
        technology: 0.4
    },
    
    // Macaristan Krallığı
    'HUNGARY': { 
        name: 'Macaristan Krallığı', 
        nuts2: ['HU10', 'HU21', 'HU22', 'HU23', 'HU31', 'HU32', 'HU33'], 
        isPlayer: false, 
        color: '#228B22', 
        coins: INITIAL_AI_COINS, 
        units: 0,
        personality: 'BALANCED',
        capital: 'HU10',
        era: '1936',
        type: 'minor_power',
        government: 'MONARCHY',
        leader: 'Miklós Horthy',
        flag: '🇭🇺',
        population: 10000000,
        stability: 0.6,
        technology: 0.5
    }
};

// NUTS Bölgeleri ve Komşulukları
const nutsNeighbors = {
    // Basit komşuluk sistemi - gerçek haritaya göre güncellenebilir
    'EE00': ['LV00', 'LT00'],
    'LV00': ['EE00', 'LT00', 'BLR'],
    'LT00': ['EE00', 'LV00', 'BLR', 'PL11'],
    'BLR': ['LV00', 'LT00', 'PL11', 'PL12'],
    'KAZ': ['RUS_FAR_EAST'],
    'RUS_FAR_EAST': ['KAZ'],
    // Diğer komşuluklar buraya eklenebilir
};

// Bölge birim sayıları
let regionUnits = {};

// ============================================================================
// ÜLKE TIKLAMA MENÜSÜ - Age of History Tarzı
// ============================================================================

function showCountryMenu(countryId) {
    const country = countriesData[countryId];
    if (!country) return;
    
    selectedCountryForMenu = countryId;
    countryMenuOpen = true;
    
    const menuHTML = `
        <div id="countryMenu" class="country-menu">
            <div class="country-menu-header">
                <h3>${country.flag} ${country.name}</h3>
                <button onclick="closeCountryMenu()" class="close-btn">✕</button>
            </div>
            
            <div class="country-menu-content">
                <div class="country-info-section">
                    <div class="leader-info">
                        <div class="leader-portrait">👑</div>
                        <div class="leader-details">
                            <h4>${country.leader}</h4>
                            <p>${GOVERNMENT_TYPES[country.government].name}</p>
                        </div>
                    </div>
                    
                    <div class="country-stats">
                        <div class="stat">
                            <span class="stat-label">Nüfus:</span>
                            <span class="stat-value">${(country.population / 1000000).toFixed(1)}M</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Stabilite:</span>
                            <span class="stat-value">${(country.stability * 100).toFixed(0)}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Teknoloji:</span>
                            <span class="stat-value">${(country.technology * 100).toFixed(0)}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Hazine:</span>
                            <span class="stat-value">${country.coins} Altın</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Birlikler:</span>
                            <span class="stat-value">${country.units}</span>
                        </div>
                    </div>
                </div>
                
                ${country.isPlayer ? `
                <div class="player-actions">
                    <h4>🎮 Oyuncu Aksiyonları</h4>
                    <button onclick="changeGovernment('${countryId}')" class="action-btn">
                        🏛️ Yönetim Biçimini Değiştir
                    </button>
                    <button onclick="buildInfrastructure('${countryId}')" class="action-btn">
                        🏗️ Altyapı İnşa Et (50 Altın)
                    </button>
                    <button onclick="researchTechnology('${countryId}')" class="action-btn">
                        🔬 Teknoloji Araştır (100 Altın)
                    </button>
                    <button onclick="improveStability('${countryId}')" class="action-btn">
                        🛡️ Stabiliteyi Artır (75 Altın)
                    </button>
                </div>
                ` : `
                <div class="ai-info">
                    <h4>🤖 AI Bilgileri</h4>
                    <p><strong>Kişilik:</strong> ${country.personality}</p>
                    <p><strong>Yönetim:</strong> ${GOVERNMENT_TYPES[country.government].name}</p>
                    <p><strong>Başkent:</strong> ${country.capital}</p>
                </div>
                `}
                
                <div class="diplomatic-actions">
                    <h4>🌍 Diplomatik İşlemler</h4>
                    ${!country.isPlayer ? `
                    <button onclick="declareWarOnCountry('${countryId}')" class="action-btn war-btn">
                        ⚔️ Savaş İlan Et
                    </button>
                    <button onclick="proposeAlliance('${countryId}')" class="action-btn">
                        🤝 İttifak Teklif Et
                    </button>
                    <button onclick="demandTerritory('${countryId}')" class="action-btn">
                        📜 Toprak Talebi
                    </button>
                    ` : `
                    <p>Kendi ülkenizle diplomatik işlem yapamazsınız.</p>
                    `}
                </div>
            </div>
        </div>
    `;
    
    const menuContainer = document.createElement('div');
    menuContainer.innerHTML = menuHTML;
    menuContainer.id = 'countryMenuContainer';
    document.body.appendChild(menuContainer);
    
    positionCountryMenu();
}

function closeCountryMenu() {
    const menuContainer = document.getElementById('countryMenuContainer');
    if (menuContainer) {
        menuContainer.remove();
    }
    selectedCountryForMenu = null;
    countryMenuOpen = false;
}

function positionCountryMenu() {
    const menu = document.getElementById('countryMenu');
    if (!menu) return;
    
    menu.style.position = 'fixed';
    menu.style.top = '20px';
    menu.style.right = '20px';
    menu.style.zIndex = '1000';
}

// ============================================================================
// YÖNETİM BİÇİMİ DEĞİŞTİRME - Age of History Tarzı
// ============================================================================

function changeGovernment(countryId) {
    const country = countriesData[countryId];
    if (!country || !country.isPlayer) return;
    
    const governmentModal = `
        <div id="governmentModal" class="modal">
            <div class="modal-content">
                <h2>🏛️ Yönetim Biçimini Değiştir</h2>
                <p>Hangi yönetim biçimine geçmek istiyorsunuz?</p>
                
                <div class="government-options">
                    <div class="gov-option" onclick="selectGovernment('${countryId}', 'DEMOCRACY')">
                        <h3>🗳️ Demokrasi</h3>
                        <p>Gelir: +20% | Stabilite: +30% | Askeri: -10%</p>
                    </div>
                    <div class="gov-option" onclick="selectGovernment('${countryId}', 'DICTATORSHIP')">
                        <h3>👑 Diktatörlük</h3>
                        <p>Gelir: -20% | Stabilite: -30% | Askeri: +40%</p>
                    </div>
                    <div class="gov-option" onclick="selectGovernment('${countryId}', 'MONARCHY')">
                        <h3>👑 Monarşi</h3>
                        <p>Gelir: +10% | Stabilite: +20% | Askeri: +10%</p>
                    </div>
                    <div class="gov-option" onclick="selectGovernment('${countryId}', 'COMMUNISM')">
                        <h3>☭ Komünizm</h3>
                        <p>Gelir: 0% | Stabilite: +10% | Askeri: +30%</p>
                    </div>
                    <div class="gov-option" onclick="selectGovernment('${countryId}', 'FASCISM')">
                        <h3>⚡ Faşizm</h3>
                        <p>Gelir: -10% | Stabilite: -20% | Askeri: +50%</p>
                    </div>
                </div>
                
                <button onclick="closeGovernmentModal()" class="close-btn">İptal</button>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = governmentModal;
    modalContainer.id = 'governmentModalContainer';
    document.body.appendChild(modalContainer);
}

function selectGovernment(countryId, newGovernment) {
    const country = countriesData[countryId];
    if (!country || !country.isPlayer) return;
    
    const oldGovernment = country.government;
    country.government = newGovernment;
    
    const govType = GOVERNMENT_TYPES[newGovernment];
    country.stability *= govType.stabilityBonus;
    country.stability = Math.min(country.stability, 1.0);
    
    addNotification(`🏛️ ${country.name} yönetim biçimini ${oldGovernment}'den ${newGovernment}'e değiştirdi!`);
    
    closeGovernmentModal();
    closeCountryMenu();
    updateUI();
}

function closeGovernmentModal() {
    const modalContainer = document.getElementById('governmentModalContainer');
    if (modalContainer) {
        modalContainer.remove();
    }
}

// ============================================================================
// OYUNCU AKSİYONLARI - Age of History Tarzı
// ============================================================================

function buildInfrastructure(countryId) {
    const country = countriesData[countryId];
    if (!country || !country.isPlayer || country.coins < 50) {
        addNotification('❌ Yetersiz altın!');
        return;
    }
    
    country.coins -= 50;
    country.stability += 0.1;
    country.stability = Math.min(country.stability, 1.0);
    
    addNotification('🏗️ Altyapı inşa edildi! Stabilite +10%');
    closeCountryMenu();
    updateUI();
}

function researchTechnology(countryId) {
    const country = countriesData[countryId];
    if (!country || !country.isPlayer || country.coins < 100) {
        addNotification('❌ Yetersiz altın!');
        return;
    }
    
    country.coins -= 100;
    country.technology += 0.1;
    country.technology = Math.min(country.technology, 1.0);
    
    addNotification('🔬 Teknoloji araştırıldı! Teknoloji +10%');
    closeCountryMenu();
    updateUI();
}

function improveStability(countryId) {
    const country = countriesData[countryId];
    if (!country || !country.isPlayer || country.coins < 75) {
        addNotification('❌ Yetersiz altın!');
        return;
    }
    
    country.coins -= 75;
    country.stability += 0.15;
    country.stability = Math.min(country.stability, 1.0);
    
    addNotification('🛡️ Stabilite artırıldı! Stabilite +15%');
    closeCountryMenu();
    updateUI();
}

function declareWarOnCountry(targetCountryId) {
    if (!targetCountryIdForWar) {
        targetCountryIdForWar = targetCountryId;
        addNotification(`⚔️ ${countriesData[targetCountryId].name} ile savaş ilan edildi!`);
        closeCountryMenu();
        updateTargetCountrySelect();
    }
}

function proposeAlliance(targetCountryId) {
    const targetCountry = countriesData[targetCountryId];
    addNotification(`🤝 ${targetCountry.name} ile ittifak teklif edildi!`);
    closeCountryMenu();
}

function demandTerritory(targetCountryId) {
    const targetCountry = countriesData[targetCountryId];
    addNotification(`📜 ${targetCountry.name}'den toprak talebi yapıldı!`);
    closeCountryMenu();
}

// ============================================================================
// GELİŞMİŞ AI SİSTEMİ - Age of History Tarzı
// ============================================================================

function performAdvancedAI() {
    const aiCountries = Object.keys(countriesData).filter(id => !countriesData[id].isPlayer);
    
    aiCountries.forEach(countryId => {
        const country = countriesData[countryId];
        const personality = AI_PERSONALITIES[country.personality];
        
        // Stratejik durumu değerlendir
        const situation = evaluateStrategicSituation(countryId);
        
        // Ekonomik kararlar
        makeEconomicDecisions(countryId, situation);
        
        // Askeri kararlar
        makeMilitaryDecisions(countryId, situation);
        
        // Diplomatik kararlar
        makeDiplomaticDecisions(countryId, situation);
        
        // Teknoloji ve altyapı kararları
        makeDevelopmentDecisions(countryId, situation);
    });
}

function makeDiplomaticDecisions(countryId, situation) {
    const country = countriesData[countryId];
    const personality = AI_PERSONALITIES[country.personality];
    
    if (Math.random() < personality.warChance && situation.militaryStrength > 1.5) {
        const neighbors = getNeighboringCountries(countryId);
        const weakNeighbors = neighbors.filter(n => {
            const neighborCountry = countriesData[n];
            return neighborCountry && !neighborCountry.isPlayer && 
                   getTotalUnitsForCountry(n) < getTotalUnitsForCountry(countryId) * 0.7;
        });
        
        if (weakNeighbors.length > 0) {
            const target = weakNeighbors[Math.floor(Math.random() * weakNeighbors.length)];
            executeAIWarDeclaration(countryId, target);
        }
    }
}

function makeDevelopmentDecisions(countryId, situation) {
    const country = countriesData[countryId];
    const personality = AI_PERSONALITIES[country.personality];
    
    if (country.coins >= 50 && Math.random() < personality.buildChance) {
        country.coins -= 50;
        country.stability += 0.1;
        country.stability = Math.min(country.stability, 1.0);
        addNotification(`🏗️ ${country.name} altyapı inşa etti!`);
    }
    
    if (country.coins >= 100 && Math.random() < 0.3) {
        country.coins -= 100;
        country.technology += 0.1;
        country.technology = Math.min(country.technology, 1.0);
        addNotification(`🔬 ${country.name} teknoloji araştırdı!`);
    }
}

// ============================================================================
// GELİŞMİŞ BÖLGE TIKLAMA SİSTEMİ
// ============================================================================

function onRegionClick(nutsId) {
    const countryId = getCountryIdFromNutsId(nutsId);
    
    if (!countryId) return;
    
    if (countryMenuOpen) {
        closeCountryMenu();
    }
    
    showCountryMenu(countryId);
    
    if (currentAttackMode && playerCountryId && countryId !== playerCountryId) {
        const playerCountry = countriesData[playerCountryId];
        const targetCountry = countriesData[countryId];
        
        if (playerCountry && targetCountry) {
            const attackingUnits = Math.min(playerCountry.units, 5);
            const defendingUnits = Math.min(targetCountry.units, 3);
            
            showWarModal(nutsId, nutsId, attackingUnits, defendingUnits);
        }
    }
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

function getCountryIdFromNutsId(nutsId) {
    for (const [countryId, country] of Object.entries(countriesData)) {
        if (country.nuts2.includes(nutsId)) {
            return countryId;
        }
    }
    return null;
}

function addNotification(message) {
    const notification = document.createElement('li');
    notification.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    notification.className = 'notification-item';
    
    notificationsList.appendChild(notification);
    notificationsList.scrollTop = notificationsList.scrollHeight;
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function updateUI() {
    if (playerCountryId && countriesData[playerCountryId]) {
        const playerCountry = countriesData[playerCountryId];
        
        welcomeMessage.textContent = `🏛️ ${playerName} - ${playerCountry.name}`;
        playerCountryNameElement.textContent = playerCountry.name;
        playerCoinElement.textContent = playerCountry.coins;
        playerUnitsReadyElement.textContent = playerCountry.units;
        
        const govType = GOVERNMENT_TYPES[playerCountry.government];
        addNotification(`🏛️ Yönetim: ${govType.name} | Stabilite: ${(playerCountry.stability * 100).toFixed(0)}% | Teknoloji: ${(playerCountry.technology * 100).toFixed(0)}%`);
    }
    
    turnCounter.textContent = currentTurn;
}

function evaluateStrategicSituation(countryId) {
    const country = countriesData[countryId];
    const totalUnits = getTotalUnitsForCountry(countryId);
    const neighbors = getNeighboringCountries(countryId);
    
    return {
        militaryStrength: totalUnits,
        neighborCount: neighbors.length,
        economicStrength: country.coins,
        stability: country.stability,
        technology: country.technology
    };
}

function getNeighboringCountries(countryId) {
    const country = countriesData[countryId];
    const neighbors = new Set();
    
    country.nuts2.forEach(regionId => {
        const regionNeighbors = nutsNeighbors[regionId] || [];
        regionNeighbors.forEach(neighborRegionId => {
            const neighborCountryId = getCountryIdFromNutsId(neighborRegionId);
            if (neighborCountryId && neighborCountryId !== countryId) {
                neighbors.add(neighborCountryId);
            }
        });
    });
    
    return Array.from(neighbors);
}

function getTotalUnitsForCountry(countryId) {
    const country = countriesData[countryId];
    return country.units;
}

function executeAIWarDeclaration(attackerCountryId, defenderCountryId) {
    const attacker = countriesData[attackerCountryId];
    const defender = countriesData[defenderCountryId];
    
    addNotification(`⚔️ ${attacker.name} ${defender.name} ile savaş ilan etti!`);
    warDeclarations[attackerCountryId] = defenderCountryId;
}

// ============================================================================
// OYUN BAŞLATMA
// ============================================================================

function initializeGame() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'grid';
    populateCountrySelectionModal();
    countrySelectionModal.style.display = 'flex';
}

function populateCountrySelectionModal() {
    countryListDiv.innerHTML = '';
    
    Object.entries(countriesData).forEach(([countryId, country]) => {
        const countryOption = document.createElement('div');
        countryOption.className = 'country-option';
        countryOption.onclick = () => selectCountry(countryId);
        
        countryOption.innerHTML = `
            <div class="country-name">${country.flag} ${country.name}</div>
            <div class="country-info">
                Lider: ${country.leader}<br>
                Yönetim: ${GOVERNMENT_TYPES[country.government].name}<br>
                Nüfus: ${(country.population / 1000000).toFixed(1)}M
            </div>
        `;
        
        countryListDiv.appendChild(countryOption);
    });
}

function selectCountry(countryId) {
    const country = countriesData[countryId];
    country.isPlayer = true;
    playerCountryId = countryId;
    playerCountryName = country.name;
    
    countrySelectionModal.style.display = 'none';
    gameScreen.style.display = 'grid';
    
    addNotification(`👑 ${playerName} ${country.name} liderliğini üstlendi!`);
    updateUI();
}

// Event Listeners
startGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        initializeGame();
    } else {
        alert('Lütfen bir isim girin!');
    }
});

selectCountryButton.addEventListener('click', () => {
    if (playerCountryId) {
        countrySelectionModal.style.display = 'none';
        gameScreen.style.display = 'grid';
        updateUI();
    }
});

// İlk yüklemede UI'ı gizle
document.addEventListener('DOMContentLoaded', () => {
    gameScreen.style.display = 'none';
    countrySelectionModal.style.display = 'none';
});