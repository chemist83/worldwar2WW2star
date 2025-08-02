// ============================================================================
// Sabitler ve Global Değişkenler
// ============================================================================
const WAR_CHANCE_BASE = 0.20; // AI'nın savaş ilan etme temel şansı
const UNIT_COST = 20;
const INCOME_PER_REGION = 10;
const INITIAL_PLAYER_COINS = 100;
const INITIAL_AI_COINS = 80;
const STARTING_UNITS_PER_REGION = 1; // Başlangıçta her bölgede 1 birim var (player ve AI)

let playerName = '';
let playerCountryId = '';
let playerCountryName = '';
let currentTurn = 1;
let gameMapObject;
let svgDoc; // SVG dökümanına erişim için
let currentActiveCountryPath = null; // Tıklanan aktif bölge (saldırı başlangıcı için)

// Yeni eklenenler
let currentAttackMode = false; // Saldırı modunda olup olmadığımızı belirler
let selectedAttackingRegionNutsId = null; // Hangi bölgeden saldırı başlatıldı
let targetCountryIdForWar = null; // Savaş ilan edilen ülke (tıklanan düşman bölgesi bu ülkeye ait olmalı)


// ============================================================================
// DOM Elementleri
// ============================================================================
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

const warModal = document.getElementById('warModal'); // Bu modalı kaldırdım, doğrudan çözüme gideceğiz.
const warModalTitle = document.getElementById('warModalTitle');
const attackingRegionInfo = document.getElementById('attackingRegionInfo');
const defendingRegionInfo = document.getElementById('defendingRegionInfo');
const conductAttackButton = document.getElementById('conductAttackButton');
const closeWarModalButton = document.getElementById('closeWarModalButton'); // Bu butonu da kaldırdım

// ============================================================================
// Oyun Verileri (CHATGPT VE SİZİN VERDİĞİNİZ LİSTELERE GÖRE GÜNCELLENDİ!)
// ============================================================================
let countriesData = {
    // Türkiye NUTS-2
    'TR': { name: 'Türkiye', nuts2: ['TR10', 'TR21', 'TR22', 'TR31', 'TR32', 'TR33', 'TR41', 'TR42', 'TR51', 'TR52', 'TR61', 'TR62', 'TR63', 'TR71', 'TR72', 'TR81', 'TR82', 'TR83', 'TR90', 'TRA1', 'TRA2', 'TRB1', 'TRB2', 'TRC1', 'TRC2', 'TRC3'], isPlayer: false, color: '#FF0000', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/tr_attack_icon.png' },
    // Birleşik Krallık NUTS-2
    'UK': { name: 'Birleşik Krallık', nuts2: ['UKI', 'UKF', 'UKD', 'UKG', 'UKH', 'UKK', 'UKM', 'UKL', 'UKJ', 'UKN'], isPlayer: false, color: '#0000FF', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/uk_attack_icon.png' },
    // Almanya NUTS-2
    'DE': { name: 'Almanya', nuts2: ['DE11', 'DE12', 'DE13', 'DE14', 'DE21', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27', 'DE30', 'DE40', 'DE50', 'DE60', 'DE71', 'DE72', 'DE73', 'DE80', 'DE91', 'DE92', 'DE93', 'DE94', 'DEA1', 'DEA2', 'DEA3', 'DEA4', 'DEA5', 'DEB1', 'DEB2', 'DEB3', 'DEC0', 'DED2', 'DED4', 'DED5', 'DED6', 'DEG0'], isPlayer: false, color: '#FFFF00', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/de_attack_icon.png' },
    // Fransa NUTS-2 (Sizin verdiğiniz listeye göre güncellendi!)
    'FR': { name: 'Fransa', nuts2: ['FR10', 'FR21', 'FR22', 'FR23', 'FR24', 'FR25', 'FR26', 'FR30', 'FR41', 'FR42', 'FR43', 'FR51', 'FR52', 'FR53', 'FR61', 'FR62', 'FR63', 'FR71', 'FR72', 'FR81', 'FR82', 'FR83', 'FRA1', 'FRA2', 'FRA3', 'FRA4', 'FRA5'], isPlayer: false, color: '#FF4500', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/fr_attack_icon.png' },
    // İtalya NUTS-2
    'IT': { name: 'İtalya', nuts2: ['ITC1', 'ITC2', 'ITC3', 'ITC4', 'ITC5', 'ITD1', 'ITD2', 'ITD3', 'ITD4', 'ITE1', 'ITE2', 'ITE3', 'ITE4', 'ITF1', 'ITF2', 'ITF3', 'ITF4', 'ITF5', 'ITG1', 'ITG2'], isPlayer: false, color: '#00FF00', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/it_attack_icon.png' },
    // İspanya NUTS-2
    'ES': { name: 'İspanya', nuts2: ['ES11', 'ES12', 'ES13', 'ES21', 'ES22', 'ES23', 'ES24', 'ES30', 'ES41', 'ES42', 'ES43', 'ES51', 'ES52', 'ES53', 'ES61', 'ES62', 'ES63', 'ES64', 'ES70'], isPlayer: false, color: '#FFA500', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/es_attack_icon.png' },
    // Polonya NUTS-2
    'PL': { name: 'Polonya', nuts2: ['PL21', 'PL22', 'PL41', 'PL42', 'PL43', 'PL51', 'PL52', 'PL61', 'PL62', 'PL63', 'PL71', 'PL72', 'PL81', 'PL82', 'PL84', 'PL91', 'PL92'], isPlayer: false, color: '#800080', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/pl_attack_icon.png' },
    // Romanya NUTS-2
    'RO': { name: 'Romanya', nuts2: ['RO11', 'RO12', 'RO21', 'RO22', 'RO31', 'RO32', 'RO41', 'RO42'], isPlayer: false, color: '#ADD8E6', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ro_attack_icon.png' },
    // Macaristan NUTS-2
    'HU': { name: 'Macaristan', nuts2: ['HU10', 'HU21', 'HU22', 'HU23', 'HU31', 'HU32', 'HU33'], isPlayer: false, color: '#FFC0CB', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/hu_attack_icon.png' },
    // Avusturya NUTS-2
    'AT': { name: 'Avusturya', nuts2: ['AT11', 'AT12', 'AT13', 'AT21', 'AT22', 'AT31', 'AT32', 'AT33', 'AT34'], isPlayer: false, color: '#F0E68C', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/at_attack_icon.png' },
    // Belçika NUTS-2
    'BE': { name: 'Belçika', nuts2: ['BE10', 'BE21', 'BE22', 'BE23', 'BE24', 'BE25', 'BE31', 'BE32', 'BE33', 'BE34', 'BE35'], isPlayer: false, color: '#A52A2A', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/be_attack_icon.png' },
    // Hollanda NUTS-2
    'NL': { name: 'Hollanda', nuts2: ['NL11', 'NL12', 'NL13', 'NL21', 'NL22', 'NL23', 'NL31', 'NL32', 'NL33', 'NL34'], isPlayer: false, color: '#DAA520', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/nl_attack_icon.png' },
    // İsveç NUTS-2
    'SE': { name: 'İsveç', nuts2: ['SE11', 'SE12', 'SE21', 'SE22', 'SE23', 'SE31', 'SE32', 'SE33'], isPlayer: false, color: '#87CEEB', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/se_attack_icon.png' },
    // Norveç NUTS-2
    'NO': { name: 'Norveç', nuts2: ['NO01', 'NO02', 'NO03', 'NO04', 'NO05', 'NO06', 'NO07', 'NO08'], isPlayer: false, color: '#B0C4DE', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/no_attack_icon.png' },
    // Finlandiya NUTS-2
    'FI': { name: 'Finlandiya', nuts2: ['FI19', 'FI1B', 'FI1C', 'FI20'], isPlayer: false, color: '#AFEEEE', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/fi_attack_icon.png' },
    // Danimarka NUTS-2
    'DK': { name: 'Danimarka', nuts2: ['DK01', 'DK02', 'DK03', 'DK04', 'DK05'], isPlayer: false, color: '#CD5C5C', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/dk_attack_icon.png' },
    // İsviçre NUTS-2
    'CH': { name: 'İsviçre', nuts2: ['CH01', 'CH02', 'CH03', 'CH04', 'CH05', 'CH06', 'CH07'], isPlayer: false, color: '#DC143C', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ch_attack_icon.png' },
    // Yunanistan NUTS-2
    'EL': { name: 'Yunanistan', nuts2: ['EL30', 'EL41', 'EL42', 'EL43', 'EL51', 'EL52', 'EL53', 'EL54'], isPlayer: false, color: '#ADFF2F', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/gr_attack_icon.png' }, // GR yerine EL
    // Portekiz NUTS-2
    'PT': { name: 'Portekiz', nuts2: ['PT11', 'PT15', 'PT16', 'PT17', 'PT18', 'PT20', 'PT30'], isPlayer: false, color: '#8B4513', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/pt_attack_icon.png' },
    // İrlanda NUTS-2
    'IE': { name: 'İrlanda', nuts2: ['IE04', 'IE05', 'IE06'], isPlayer: false, color: '#228B22', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ie_attack_icon.png' },
    // Çekya NUTS-2
    'CZ': { name: 'Çekya', nuts2: ['CZ01', 'CZ02', 'CZ03', 'CZ04', 'CZ05', 'CZ06', 'CZ07', 'CZ08'], isPlayer: false, color: '#4682B4', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/cz_attack_icon.png' },
    // Slovakya NUTS-2
    'SK': { name: 'Slovakya', nuts2: ['SK01', 'SK02', 'SK03', 'SK04'], isPlayer: false, color: '#BA55D3', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/sk_attack_icon.png' },
    // Bulgaristan NUTS-2
    'BG': { name: 'Bulgaristan', nuts2: ['BG31', 'BG32', 'BG33', 'BG34', 'BG41', 'BG42'], isPlayer: false, color: '#FA8072', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/bg_attack_icon.png' },
    // Hırvatistan NUTS-2
    'HR': { name: 'Hırvatistan', nuts2: ['HR03', 'HR04'], isPlayer: false, color: '#9ACD32', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/hr_attack_icon.png' },
    // Slovenya NUTS-2
    'SI': { name: 'Slovenya', nuts2: ['SI03', 'SI04'], isPlayer: false, color: '#66CDAA', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/si_attack_icon.png' },
    // Litvanya NUTS-2
    'LT': { name: 'Litvanya', nuts2: ['LT01', 'LT02'], isPlayer: false, color: '#FFD700', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/lt_attack_icon.png' },
    // Letonya NUTS-2
    'LV': { name: 'Letonya', nuts2: ['LV00'], isPlayer: false, color: '#DEB887', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/lv_attack_icon.png' },
    // Estonya NUTS-2
    'EE': { name: 'Estonya', nuts2: ['EE00'], isPlayer: false, color: '#FFFAF0', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ee_attack_icon.png' },

    // TEK TOPRAKLI ÜLKELER (veya daha az parçalı)
    'LU': { name: 'Lüksemburg', nuts2: ['LU00'], isPlayer: false, color: '#800080', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/lu_attack_icon.png' },
    'CY': { name: 'Kıbrıs', nuts2: ['CY00'], isPlayer: false, color: '#19cf0c', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/cy_attack_icon.png' },
    'IS': { name: 'İzlanda', nuts2: ['IS00'], isPlayer: false, color: '#A9A9A9', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/is_attack_icon.png' },
    'MT': { name: 'Malta', nuts2: ['MT00'], isPlayer: false, color: '#D3D3D3', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/mt_attack_icon.png' },
    'MD': { name: 'Moldova', nuts2: ['MD00'], isPlayer: false, color: '#98FB98', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/md_attack_icon.png' },
    'BA': { name: 'Bosna-Hersek', nuts2: ['BA01', 'BA02'], isPlayer: false, color: '#4B0082', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ba_attack_icon.png' },
    'ME': { name: 'Karadağ', nuts2: ['ME00'], isPlayer: false, color: '#CD853F', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/me_attack_icon.png' },
    'MK': { name: 'Kuzey Makedonya', nuts2: ['MK00'], isPlayer: false, color: '#FF6347', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/mk_attack_icon.png' },
    'RS': { name: 'Sırbistan', nuts2: ['RS11', 'RS12', 'RS21', 'RS22'], isPlayer: false, color: '#483D8B', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/rs_attack_icon.png' },
    'BY': { name: 'Belarus', nuts2: ['BY00'], isPlayer: false, color: '#BDB76B', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/by_attack_icon.png' },
    'UA': { name: 'Ukrayna', nuts2: ['UA30', 'UA40', 'UA50'], isPlayer: false, color: '#DAA520', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ua_attack_icon.png' },
    'RU': { name: 'Rusya', nuts2: ['RU00'], isPlayer: false, color: '#006400', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ru_attack_icon.png' }, // Varsayımsal tek bir RU00 NUTS ID'si ile temsil edildi
};

// NUTS Bölgeleri ve Komşulukları (BU KISIM KENDİ SVG HARİTANIZA GÖRE DÜZENLENMELİ VE EKSİKLER TAMAMLANMALI!)
// Lütfen buradaki komşulukları SVG'nizdeki sınırlar doğrultusunda tekrar kontrol edin.
const nutsNeighbors = {
    // Türkiye NUTS2 komşulukları (örnek, kendi SVG'nize göre doldurun)
    'TR10': ['TR21', 'TR41', 'BG34', 'EL43'], // Bulgaristan ve Yunanistan ile komşu
    'TR21': ['TR10', 'TR22', 'TR31'],
    'TR22': ['TR21', 'TR31', 'TR41'],
    'TR31': ['TR21', 'TR22', 'TR32', 'TR41', 'TR42'],
    'TR32': ['TR31', 'TR33', 'TR51'],
    'TR33': ['TR32', 'TR51', 'TR52', 'TR61'],
    'TR41': ['TR10', 'TR22', 'TR31', 'TR42', 'TR90'],
    'TR42': ['TR31', 'TR41', 'TR51', 'TR52', 'TR61', 'TR62', 'TR90'],
    'TR51': ['TR32', 'TR33', 'TR42', 'TR52', 'TR61', 'TR71'],
    'TR52': ['TR33', 'TR42', 'TR51', 'TR61', 'TR62', 'TR63'],
    'TR61': ['TR33', 'TR42', 'TR51', 'TR52', 'TR71', 'TR81'],
    'TR62': ['TR42', 'TR52', 'TR61', 'TR63', 'TR81', 'TR82'],
    'TR63': ['TR52', 'TR62', 'TR71', 'TR82', 'TR83', 'TRC1', 'CY00'], // CY00: Kıbrıs ile denizden komşu
    'TR71': ['TR51', 'TR61', 'TR63', 'TR81', 'TR90'],
    'TR72': ['TR71', 'BG34'], // BG34 ile komşu
    'TR81': ['TR61', 'TR62', 'TR71', 'TR82', 'TR90', 'TRA1'],
    'TR82': ['TR62', 'TR63', 'TR81', 'TR83', 'TRA1', 'TRA2'],
    'TR83': ['TR63', 'TR82', 'TRB1', 'TRC1', 'TRA2'],
    'TR90': ['TR41', 'TR42', 'TR71', 'TR81', 'TRB2'],
    'TRA1': ['TR81', 'TR82', 'TRA2', 'TRB1', 'TRB2', 'TRC1'],
    'TRA2': ['TR82', 'TR83', 'TRA1', 'TRB1', 'TRC1'],
    'TRB1': ['TR83', 'TRA1', 'TRA2', 'TRB2', 'TRC1', 'TRC2'],
    'TRB2': ['TR90', 'TRA1', 'TRB1', 'TRC2', 'TRC3'],
    'TRC1': ['TR63', 'TR83', 'TRA1', 'TRA2', 'TRB1', 'TRC2'],
    'TRC2': ['TRB1', 'TRB2', 'TRC1', 'TRC3'],
    'TRC3': ['TRB2', 'TRC2'],

    // Avusturya Komşulukları
    'AT11': ['AT12', 'AT13', 'CZ01', 'CZ02', 'DE21', 'DE22', 'DE23', 'DE24', 'SK01'],
    'AT12': ['AT11', 'AT21', 'DE21'],
    'AT13': ['AT11', 'AT21', 'AT31'],
    'AT21': ['AT12', 'AT13', 'AT22', 'AT31', 'ITD4', 'SI03'],
    'AT22': ['AT21', 'AT31', 'HU10', 'SK01'],
    'AT31': ['AT13', 'AT21', 'AT22', 'AT32', 'AT33', 'AT34', 'CH01', 'DE27', 'ITD4', 'SI03'],
    'AT32': ['AT31', 'AT33'],
    'AT33': ['AT31', 'AT32', 'DE27'],
    'AT34': ['AT31', 'SI03'],

    // Belçika Komşulukları
    'BE10': ['BE21', 'BE22', 'BE23', 'NL11', 'NL21', 'FR21', 'FR30'],
    'BE21': ['BE10', 'BE22', 'BE31', 'NL13', 'LU00', 'FR22', 'FR23'],
    'BE22': ['BE10', 'BE21', 'BE23', 'BE24', 'BE31', 'NL13'],
    'BE23': ['BE10', 'BE22', 'BE24', 'BE31', 'NL13'],
    'BE24': ['BE22', 'BE23', 'BE32', 'FR30'],
    'BE25': ['BE34', 'FR30'],
    'BE31': ['BE21', 'BE22', 'BE23', 'BE32', 'BE33', 'FR22', 'FR23', 'DE71', 'LU00'],
    'BE32': ['BE24', 'BE31', 'BE33', 'FR30'],
    'BE33': ['BE31', 'BE32', 'BE34', 'DE71'],
    'BE34': ['BE25', 'BE33', 'DE71'],
    'BE35': ['BE24', 'FR30'],

    // Bulgaristan Komşulukları
    'BG31': ['BG32', 'RO42', 'RS12'],
    'BG32': ['BG31', 'BG33', 'RO42'],
    'BG33': ['BG32', 'BG34', 'EL41', 'MK00'],
    'BG34': ['BG33', 'EL41', 'TR72', 'TR10'], // TR10 ile komşu
    'BG41': ['BG42', 'RS21'],
    'BG42': ['BG41', 'RO42', 'RS12', 'MK00'],

    // İsviçre Komşulukları
    'CH01': ['CH02', 'CH03', 'DE40', 'FR71', 'ITG2', 'AT31'],
    'CH02': ['CH01', 'CH04', 'FR71', 'ITG2'],
    'CH03': ['CH01', 'CH05', 'DE40'],
    'CH04': ['CH02', 'CH06', 'ITG2'],
    'CH05': ['CH03', 'CH07', 'DE40'],
    'CH06': ['CH04', 'CH07', 'ITG2'],
    'CH07': ['CH05', 'CH06', 'ITG2'],

    // Kıbrıs Komşulukları
    'CY00': ['TR63'],

    // Çekya Komşulukları
    'CZ01': ['CZ02', 'DE40', 'AT11', 'DE91'],
    'CZ02': ['CZ01', 'CZ03', 'AT11', 'DE40'],
    'CZ03': ['CZ02', 'CZ04', 'PL82', 'PL84', 'DE40'],
    'CZ04': ['CZ03', 'CZ05', 'PL84', 'SK04'],
    'CZ05': ['CZ04', 'CZ06', 'SK04'],
    'CZ06': ['CZ05', 'CZ07', 'DE91'],
    'CZ07': ['CZ06', 'CZ08', 'DE91'],
    'CZ08': ['CZ07', 'AT11', 'DE91'],

    // Almanya Komşulukları (Çok fazla, birkaçını örnek olarak bırakıyorum, kendiniz tamamlamalısınız)
    'DE11': ['DE12', 'DE13', 'NL11', 'NL12', 'DK01'],
    'DE12': ['DE11', 'DE13', 'DE21', 'NL12', 'DK01', 'DK02'],
    'DE13': ['DE11', 'DE12', 'DE14', 'DE21', 'DK02'],
    'DE14': ['DE13', 'DE21', 'PL92'],
    'DE21': ['DE12', 'DE13', 'DE14', 'DE22', 'DE23', 'DE24', 'AT11', 'CZ01', 'PL92'],
    'DE22': ['DE21', 'DE23', 'AT11', 'CZ01'],
    'DE23': ['DE21', 'DE22', 'DE24', 'AT11', 'CZ01'],
    'DE24': ['DE21', 'DE23', 'AT11', 'CZ01'],
    'DE25': ['DE26', 'DE27', 'DE50', 'NL21', 'BE31'],
    'DE26': ['DE25', 'DE27', 'DE50', 'NL21', 'BE31'],
    'DE27': ['DE25', 'DE26', 'DE50', 'DE71', 'CH01', 'AT31', 'PL91'],
    'DE30': ['DE40', 'DE50', 'DE60', 'CZ01', 'CZ02', 'PL84', 'PL91'],
    'DE40': ['DE30', 'CZ01', 'CZ02', 'CZ03', 'PL84', 'CH01'],
    'DE50': ['DE25', 'DE26', 'DE27', 'DE30', 'DE60', 'FR41', 'FR42', 'FR43', 'LU00', 'BE31'],
    'DE60': ['DE30', 'DE50', 'FR41', 'FR42', 'LU00'],
    'DE71': ['DE27', 'DE33', 'BE31', 'LU00', 'FR43', 'FR51', 'FR52', 'FR53'],
    'DE72': ['DE71', 'DE73', 'FR43'],
    'DE73': ['DE72', 'CH01'],
    'DE80': ['AT11', 'AT12', 'AT13', 'AT21', 'AT31'], // Genel Bavyera bölgesi komşulukları
    'DE91': ['DE92', 'CZ06', 'CZ07', 'CZ08', 'PL81'],
    'DE92': ['DE91', 'DE93', 'PL81', 'PL82'],
    'DE93': ['DE92', 'DE94', 'PL82'],
    'DE94': ['DE93', 'CZ03', 'PL84'],
    'DEA1': ['DEA2', 'DEA3', 'DEB1', 'NL31', 'NL32'],
    'DEA2': ['DEA1', 'DEA3', 'DEB1'],
    'DEA3': ['DEA1', 'DEA2', 'DEB1', 'NL31'],
    'DEA4': ['DEA5', 'DEB2', 'LU00', 'FR21'],
    'DEA5': ['DEA4', 'DEB2', 'FR21', 'BE31'],
    'DEB1': ['DEB2', 'DEB3', 'LU00', 'FR21'],
    'DEB2': ['DEB1', 'DEB3', 'LU00', 'FR21'],
    'DEB3': ['DEB1', 'DEB2', 'FR21', 'FR30'],
    'DEC0': ['DE40', 'PL91', 'PL92', 'CZ01'],
    'DED2': ['DED4', 'DED5', 'DED6'], // Bu NUTS'lar arası komşuluklar iç
    'DED4': ['DED2', 'DED5', 'DED6'],
    'DED5': ['DED2', 'DED4', 'DED6'],
    'DED6': ['DED2', 'DED4', 'DED5'],
    'DEG0': ['DE71', 'DE72', 'DE73', 'FR43', 'CH01', 'ITG2'], // Baden-Württemberg

    // Danimarka Komşulukları
    'DK01': ['DK02', 'DE11', 'DE12'],
    'DK02': ['DK01', 'DK03', 'DE12', 'DE13'],
    'DK03': ['DK02', 'DK04'],
    'DK04': ['DK03', 'DK05'],
    'DK05': ['DK04', 'SE21', 'SE23'],

    // Estonya Komşulukları
    'EE00': ['LV00', 'RU00'],

    // İspanya Komşulukları
    'ES11': ['ES12', 'ES21', 'PT11', 'PT15'],
    'ES12': ['ES11', 'ES13', 'ES21', 'PT15', 'PT16'],
    'ES13': ['ES12', 'ES22', 'PT16'],
    'ES21': ['ES11', 'ES12', 'ES22', 'ES23', 'FR61'], // FR61 ile komşu
    'ES22': ['ES13', 'ES21', 'ES23', 'ES24', 'FR61', 'FR62', 'FR63'],
    'ES23': ['ES21', 'ES22', 'ES24', 'FR62', 'FR63'],
    'ES24': ['ES22', 'ES23', 'ES30', 'FR62', 'FR63'],
    'ES30': ['ES24', 'ES41', 'ES42', 'ES43', 'FR81', 'FR82'],
    'ES41': ['ES30', 'ES42', 'ES51'],
    'ES42': ['ES30', 'ES41', 'ES43', 'ES51', 'ES52', 'ES53'],
    'ES43': ['ES30', 'ES42', 'ES53'],
    'ES51': ['ES41', 'ES42', 'ES52', 'ES61'],
    'ES52': ['ES42', 'ES51', 'ES53', 'ES61', 'ES62', 'ES63'],
    'ES53': ['ES42', 'ES43', 'ES52', 'ES63', 'ES64'],
    'ES61': ['ES51', 'ES52', 'ES62', 'PT17'],
    'ES62': ['ES52', 'ES61', 'ES63', 'PT17'],
    'ES63': ['ES52', 'ES53', 'ES62', 'ES64', 'PT17', 'PT18'],
    'ES64': ['ES53', 'ES63', 'PT18'],
    'ES70': [], // Adalar (Kanarya Adaları), kara komşusu yok

    // Finlandiya Komşulukları
    'FI19': ['FI1B', 'FI1C', 'NO08', 'SE33', 'RU00'],
    'FI1B': ['FI19', 'FI1C'],
    'FI1C': ['FI19', 'FI1B', 'FI20', 'RU00'],
    'FI20': ['FI1C', 'RU00'],

    // Fransa Komşulukları (Sizin verdiğiniz listeye göre güncellendi!)
    'FR10': ['FR21', 'FR22', 'FR23', 'BE10', 'BE21'], // Paris bölgesi
    'FR21': ['FR10', 'FR22', 'FR30', 'FR41', 'BE10', 'DEB3', 'DEA4', 'DEA5', 'DEB1', 'DEB2'], // Champagne-Ardenne
    'FR22': ['FR10', 'FR21', 'FR23', 'FR24', 'BE21', 'BE22', 'BE23', 'BE31'], // Picardie
    'FR23': ['FR10', 'FR21', 'FR24', 'FR25', 'BE21', 'BE22', 'BE23', 'BE31'], // Haute-Normandie - FR23 ile FR21 arasında bir komşuluk olup olmadığını kontrol edin
    'FR24': ['FR22', 'FR23', 'FR25', 'FR26', 'FR43', 'FR51'], // Centre (FR)
    'FR25': ['FR23', 'FR24', 'FR26', 'FR51', 'FR52'], // Basse-Normandie
    'FR26': ['FR24', 'FR25', 'FR43', 'FR51', 'FR52', 'FR53', 'FR61'], // Bourgogne
    'FR30': ['FR21', 'FR41', 'BE10', 'BE24', 'BE25', 'BE32', 'BE35', 'DEB3'], // Nord-Pas-de-Calais
    'FR41': ['FR21', 'FR30', 'FR42', 'FR43', 'DE50', 'DE60', 'LU00'], // Lorraine
    'FR42': ['FR41', 'FR43', 'DE50', 'DE60', 'CH01'], // Alsace
    'FR43': ['FR24', 'FR26', 'FR41', 'FR42', 'FR61', 'FR62', 'CH01', 'DE50', 'DE60', 'DEG0'], // Franche-Comté
    'FR51': ['FR24', 'FR25', 'FR26', 'FR52', 'FR53', 'FR61', 'FR62'], // Pays de la Loire
    'FR52': ['FR25', 'FR26', 'FR51', 'FR53', 'FR61'], // Bretagne
    'FR53': ['FR26', 'FR51', 'FR52', 'FR61', 'FR62'], // Poitou-Charentes
    'FR61': ['FR26', 'FR51', 'FR53', 'FR62', 'FR63', 'FR71', 'ES21', 'ES22'], // Aquitaine
    'FR62': ['FR26', 'FR43', 'FR61', 'FR63', 'FR71', 'FR72', 'ES22', 'ES23', 'ES24', 'ES30'], // Midi-Pyrénées
    'FR63': ['FR61', 'FR62', 'FR72', 'ES22', 'ES23', 'ES24'], // Limousin
    'FR71': ['FR61', 'FR62', 'FR72', 'FR81', 'CH01', 'CH02', 'CH04', 'ITG1', 'ITG2'], // Rhône-Alpes
    'FR72': ['FR62', 'FR63', 'FR71', 'FR81', 'FR82'], // Auvergne
    'FR81': ['FR62', 'FR71', 'FR72', 'FR82', 'FR83', 'ES30'], // Languedoc-Roussillon
    'FR82': ['FR72', 'FR81', 'FR83', 'ITF3', 'ITF4', 'ES30'], // Provence-Alpes-Côte d'Azur
    'FR83': ['FR81', 'FR82', 'ITF5'], // Korsika (Denizden İtalya ile komşu)
    'FRA1': [], // Guadeloupe (Denizaşırı, kara komşusu yok)
    'FRA2': [], // Martinique (Denizaşırı, kara komşusu yok)
    'FRA3': [], // Guyane (Denizaşırı, kara komşusu yok)
    'FRA4': [], // La Réunion (Denizaşırı, kara komşusu yok)
    'FRA5': [], // Mayotte (Denizaşırı, kara komşusu yok)

    // Yunanistan Komşulukları (EL kodları kullanıldı)
    'EL30': ['EL41', 'EL42', 'MK00', 'AL00'],
    'EL41': ['EL30', 'EL42', 'EL43', 'BG33', 'BG34', 'MK00'],
    'EL42': ['EL30', 'EL41', 'EL51'],
    'EL43': ['EL41', 'EL51', 'EL52', 'TR10'], // TR10 ile komşu
    'EL51': ['EL42', 'EL43', 'EL52', 'EL53'],
    'EL52': ['EL43', 'EL51', 'EL53', 'EL54'],
    'EL53': ['EL51', 'EL52', 'EL54'],
    'EL54': ['EL52', 'EL53'],

    // Hırvatistan Komşulukları
    'HR03': ['HR04', 'SI03', 'SI04', 'HU31', 'BA01', 'RS11'],
    'HR04': ['HR03', 'HU31', 'BA01', 'BA02', 'ME00', 'RS11'],

    // Macaristan Komşulukları
    'HU10': ['HU21', 'HU22', 'AT22', 'SK01'],
    'HU21': ['HU10', 'HU22', 'HU23', 'SK02', 'RO11'],
    'HU22': ['HU10', 'HU21', 'HU23', 'AT22', 'RO11', 'RS11'],
    'HU23': ['HU21', 'HU22', 'SK02', 'RO12'],
    'HU31': ['HU32', 'HR03', 'HR04', 'RS11', 'RS12'],
    'HU32': ['HU31', 'HU33', 'RS22', 'RO12'],
    'HU33': ['HU32', 'UA30', 'RO12'],

    // İzlanda Komşulukları
    'IS00': [],

    // İrlanda Komşulukları
    'IE04': ['IE05', 'UKN0'], // UKN0 ile komşu (Kuzey İrlanda) - Bu NUTS ID'sinin SVG'nizde olduğundan emin olun
    'IE05': ['IE04', 'IE06'],
    'IE06': ['IE05'],

    // İtalya Komşulukları
    'ITC1': ['ITC2', 'ITD1', 'FR71', 'CH01', 'AT31'],
    'ITC2': ['ITC1', 'ITC3', 'ITD1', 'ITD2'],
    'ITC3': ['ITC2', 'ITC4', 'ITD2', 'ITD3'],
    'ITC4': ['ITC3', 'ITC5', 'ITD3', 'ITD4', 'SI03'],
    'ITC5': ['ITC4', 'ITD4', 'SI03'],
    'ITD1': ['ITC1', 'ITC2', 'ITD2', 'ITF1', 'FR82'],
    'ITD2': ['ITC2', 'ITC3', 'ITD1', 'ITD3', 'ITF1', 'ITF2'],
    'ITD3': ['ITC3', 'ITC4', 'ITD2', 'ITD4', 'ITF2', 'ITF3'],
    'ITD4': ['ITC4', 'ITC5', 'ITD3', 'AT21', 'AT31', 'SI03', 'SI04'],
    'ITE1': ['ITE2', 'ITE3', 'ITF1', 'ITF2', 'ITG1'],
    'ITE2': ['ITE1', 'ITE3', 'ITF1', 'ITF2', 'ITF3', 'ITG1'],
    'ITE3': ['ITE1', 'ITE2', 'ITE4', 'ITF3', 'ITF4'],
    'ITE4': ['ITE3', 'ITF4', 'ITF5'],
    'ITF1': ['ITD1', 'ITD2', 'ITE1', 'ITE2', 'ITF2'],
    'ITF2': ['ITD2', 'ITD3', 'ITE1', 'ITE2', 'ITE3', 'ITF1', 'ITF3'],
    'ITF3': ['ITD3', 'ITE2', 'ITE3', 'ITE4', 'ITF2', 'ITF4', 'FR82', 'SI04'],
    'ITF4': ['ITE3', 'ITE4', 'ITF3', 'ITF5', 'FR82'],
    'ITF5': ['ITE4', 'ITF4', 'FR83'], // Korsika (deniz komşusu)
    'ITG1': ['ITG2', 'ITE1', 'ITE2', 'CH01', 'CH02', 'CH04', 'CH06', 'CH07'],
    'ITG2': ['ITG1', 'CH01', 'CH02', 'CH04', 'CH06', 'CH07', 'AT31', 'SI03', 'SI04'],

    // Letonya Komşulukları
    'LV00': ['EE00', 'LT01', 'BY00', 'RU00'],

    // Litvanya Komşulukları
    'LT01': ['LT02', 'LV00', 'BY00', 'PL92', 'RU00'],
    'LT02': ['LT01', 'PL92', 'RU00'], // Kaliningrad bölgesi ile RU00 komşu varsayıldı

    // Lüksemburg Komşulukları
    'LU00': ['BE21', 'BE31', 'FR41', 'FR21', 'DEB1', 'DEB2', 'DE60'],

    // Karadağ Komşulukları
    'ME00': ['BA01', 'BA02', 'RS22', 'AL00'], // AL00 Eğer haritada varsa

    // Malta Komşulukları
    'MT00': [],

    // Kuzey Makedonya Komşulukları
    'MK00': ['AL00', 'EL41', 'BG33', 'BG42', 'RS22'], // AL00 Eğer haritada varsa

    // Moldova Komşulukları
    'MD00': ['RO41', 'UA30', 'UA40'],

    // Hollanda Komşulukları
    'NL11': ['NL12', 'BE10', 'DE11'],
    'NL12': ['NL11', 'NL13', 'DE11', 'DE12'],
    'NL13': ['NL12', 'NL21', 'NL22', 'DE12', 'DE13', 'BE21', 'BE22', 'BE23'],
    'NL21': ['NL13', 'NL22', 'BE10', 'DE25'],
    'NL22': ['NL13', 'NL21', 'NL23', 'DE25'],
    'NL23': ['NL22', 'DE25', 'DE26'],
    'NL31': ['NL32', 'NL33', 'DEA1', 'DEA2', 'DEA3'],
    'NL32': ['NL31', 'NL33', 'DEA1', 'DEA2', 'DEA3'],
    'NL33': ['NL31', 'NL32', 'NL34', 'DEA1'],
    'NL34': ['NL33', 'DEA1'],

    // Norveç Komşulukları
    'NO01': ['NO02', 'SE11', 'SE12'],
    'NO02': ['NO01', 'NO03', 'SE11', 'SE12', 'SE21'],
    'NO03': ['NO02', 'NO04', 'SE21', 'SE22'],
    'NO04': ['NO03', 'NO05', 'SE22', 'SE23'],
    'NO05': ['NO04', 'NO06', 'SE23', 'SE31'],
    'NO06': ['NO05', 'NO07', 'SE31', 'SE32'],
    'NO07': ['NO06', 'NO08', 'SE32', 'SE33'],
    'NO08': ['NO07', 'SE33', 'FI19'],

    // Polonya Komşulukları
    'PL21': ['PL22', 'DE14', 'DE27', 'CZ03', 'PL41'],
    'PL22': ['PL21', 'PL41', 'PL42', 'DE27'],
    'PL41': ['PL21', 'PL22', 'PL42', 'PL43', 'PL51', 'BY00', 'UA30'],
    'PL42': ['PL41', 'PL43', 'PL52', 'PL61', 'PL62', 'UA30'],
    'PL43': ['PL41', 'PL42', 'PL52', 'PL61', 'UA30'],
    'PL51': ['PL41', 'PL52', 'PL61', 'PL71', 'PL81', 'CZ03'],
    'PL52': ['PL42', 'PL43', 'PL51', 'PL61', 'PL62', 'PL72', 'PL81', 'CZ03'],
    'PL61': ['PL42', 'PL43', 'PL51', 'PL52', 'PL62', 'PL71', 'UA30'],
    'PL62': ['PL42', 'PL52', 'PL61', 'PL63', 'PL72', 'UA30'],
    'PL63': ['PL62', 'UA30', 'UA40', 'BY00'],
    'PL71': ['PL51', 'PL61', 'PL72', 'PL81', 'PL82', 'CZ03'],
    'PL72': ['PL52', 'PL62', 'PL71', 'PL82', 'PL84', 'CZ04'],
    'PL81': ['PL51', 'PL52', 'PL71', 'PL72', 'PL82', 'CZ06', 'CZ07'],
    'PL82': ['PL52', 'PL71', 'PL72', 'PL81', 'PL84', 'CZ03', 'CZ04'],
    'PL84': ['PL72', 'PL82', 'CZ03', 'CZ04', 'SK04'],
    'PL91': ['PL92', 'DE91', 'DE92', 'DE93', 'CZ01'],
    'PL92': ['PL91', 'DE14', 'DE21', 'DE92', 'DE93', 'LT01', 'LT02', 'BY00', 'RU00'],

    // Portekiz Komşulukları
    'PT11': ['PT15', 'ES11', 'ES12'],
    'PT15': ['PT11', 'PT16', 'ES11', 'ES12'],
    'PT16': ['PT15', 'PT17', 'ES12', 'ES13', 'ES21'],
    'PT17': ['PT16', 'PT18', 'PT20', 'ES61', 'ES62', 'ES63'],
    'PT18': ['PT17', 'PT20', 'ES63', 'ES64'],
    'PT20': ['PT17', 'PT18', 'ES61'], // Madeira - denizaşırı
    'PT30': [], // Azorlar - denizaşırı

    // Romanya Komşulukları
    'RO11': ['RO12', 'HU21', 'HU22', 'UA30', 'MD00'],
    'RO12': ['RO11', 'HU23', 'HU32', 'HU33', 'MD00', 'UA30', 'UA40'],
    'RO21': ['RO22', 'RO31', 'BG31', 'RS12'],
    'RO22': ['RO21', 'RO31', 'RO32', 'BG31'],
    'RO31': ['RO21', 'RO22', 'RO32', 'RO41', 'RO42', 'BG31'],
    'RO32': ['RO22', 'RO31', 'RO41', 'RO42', 'BG31', 'BG32'],
    'RO41': ['RO31', 'RO32', 'RO42', 'MD00', 'UA40', 'UA50'],
    'RO42': ['RO31', 'RO32', 'RO41', 'BG31', 'BG32', 'MD00', 'UA50'],

    // Sırbistan Komşulukları
    'RS11': ['RS12', 'RS21', 'HR03', 'HR04', 'HU22', 'HU31', 'BA01', 'BA02', 'ME00', 'MK00'],
    'RS12': ['RS11', 'BG31', 'BG42', 'RO21', 'HU31'],
    'RS21': ['RS11', 'RS22', 'BG41', 'MK00'],
    'RS22': ['RS11', 'RS21', 'HU32', 'BA02', 'ME00', 'MK00'],

    // Slovakya Komşulukları
    'SK01': ['SK02', 'HU10', 'AT22', 'CZ05', 'PL84'],
    'SK02': ['SK01', 'SK03', 'HU21', 'HU22', 'HU23', 'PL84'],
    'SK03': ['SK02', 'SK04', 'PL84', 'UA30'],
    'SK04': ['SK03', 'CZ04', 'CZ05', 'PL84', 'UA30', 'HU33'],

    // Slovenya Komşulukları
    'SI03': ['SI04', 'HR03', 'AT21', 'AT31', 'ITC4', 'ITC5', 'ITG2'],
    'SI04': ['SI03', 'HR03', 'ITD4', 'ITF3'],

    // İsveç Komşulukları
    'SE11': ['SE12', 'NO01', 'NO02'],
    'SE12': ['SE11', 'SE21', 'NO01', 'NO02'],
    'SE21': ['SE12', 'SE22', 'NO02', 'NO03', 'DK05'],
    'SE22': ['SE21', 'SE23', 'NO03', 'NO04'],
    'SE23': ['SE22', 'SE31', 'NO04', 'NO05', 'DK05'],
    'SE31': ['SE23', 'SE32', 'NO05', 'NO06'],
    'SE32': ['SE31', 'SE33', 'NO06', 'NO07'],
    'SE33': ['SE32', 'NO07', 'NO08', 'FI19'],

    // Ukrayna Komşulukları
    'UA30': ['UA40', 'MD00', 'RO11', 'HU33', 'SK03', 'SK04', 'PL41', 'PL42', 'PL43', 'PL61', 'PL62', 'PL63', 'BY00', 'RU00'],
    'UA40': ['UA30', 'UA50', 'MD00', 'RO11', 'RO12'],
    'UA50': ['UA40', 'RO41', 'RO42', 'RU00'],

    // Belarus (BY) ve Rusya (RU) gibi bölgeler
    'BY00': ['LT01', 'LV00', 'PL41', 'PL63', 'PL92', 'UA30', 'RU00'],
    'RU00': ['EE00', 'LV00', 'LT01', 'LT02', 'FI19', 'FI1C', 'FI20', 'NO08', 'BY00', 'UA30', 'UA50'],

    // Bosna-Hersek Komşulukları
    'BA01': ['BA02', 'HR03', 'HR04', 'RS11'],
    'BA02': ['BA01', 'HR04', 'ME00', 'RS11', 'RS22'],
};

// ============================================================================
// Yardımcı Fonksiyonlar
// ============================================================================

function addNotification(message) {
    const listItem = document.createElement('li');
    listItem.textContent = message;
    notificationsList.prepend(listItem); // En yeni üste gelsin
    if (notificationsList.children.length > 10) { // Çok fazla birikmesin
        notificationsList.removeChild(notificationsList.lastChild);
    }
}

function updateUI() {
    turnCounter.textContent = currentTurn;
    playerCoinElement.textContent = countriesData[playerCountryId].coins;
    playerUnitsReadyElement.textContent = countriesData[playerCountryId].unitsReady || 0;
    playerCountryNameElement.textContent = playerCountryName;

    updateTargetCountrySelect();
    renderUnitCounts(); // Her UI güncellemesinde birim sayılarını yeniden çiz
}

function renderUnitCounts() {
    unitCountsOverlay.innerHTML = ''; // Mevcut sayıları temizle

    // Harita SVG'sini kapsayan container'ın boyutlarını al
    const mapContainerRect = mapContainer.getBoundingClientRect();

    // SVG'nin kendisinin `viewBox` değerlerini al
    // SVG'nin `viewBox`'ı, iç koordinat sistemini tanımlar.
    // SVG'nin CSS boyutları (`mapContainerRect`) ise bu koordinat sisteminin ekranda nasıl ölçekleneceğini belirler.
    const svgViewBox = svgDoc.rootElement.viewBox.baseVal;
    const svgWidthInViewBox = svgViewBox.width;
    const svgHeightInViewBox = svgViewBox.height;

    for (const countryId in countriesData) {
        if (countriesData.hasOwnProperty(countryId)) {
            const country = countriesData[countryId];
            if (country.nuts2) {
                country.nuts2.forEach(nutsId => {
                    const regionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`);
                    if (regionPath) {
                        const region = country.regions[nutsId];
                        // Sadece birimi olan bölgelerin sayısını göster
                        if (region && region.units > 0) {
                            try {
                                const bbox = regionPath.getBBox(); // SVG elementinin bounding box'ı (SVG koordinat sisteminde)

                                // Bölgenin merkezini hesapla (SVG koordinat sisteminde)
                                const centerX = bbox.x + bbox.width / 2;
                                const centerY = bbox.y + bbox.height / 2;

                                // SVG koordinat sisteminden, HTML / CSS (pixel) koordinat sistemine dönüştürme
                                // Bu dönüşüm, SVG'nin viewBox'ına ve harita container'ının gerçek boyutlarına göre ölçeklenir.
                                const overlayX = (centerX / svgWidthInViewBox) * mapContainerRect.width;
                                const overlayY = (centerY / svgHeightInViewBox) * mapContainerRect.height;

                                const unitCountDiv = document.createElement('div');
                                unitCountDiv.className = 'unit-count';
                                unitCountDiv.textContent = region.units;
                                unitCountDiv.style.left = `${overlayX}px`;
                                unitCountDiv.style.top = `${overlayY}px`;
                                unitCountDiv.style.transform = 'translate(-50%, -50%)'; // Metni merkeze hizala

                                unitCountsOverlay.appendChild(unitCountDiv);
                            } catch (e) {
                                console.error(`Birim sayısı render edilirken hata oluştu (${nutsId}):`, e);
                            }
                        }
                    } else {
                        console.warn(`Haritada bulunamayan NUTS ID: ${nutsId} (Birim Sayısı render edilirken) - Lütfen SVG ve script.js'teki ID'leri eşleştirin.`);
                    }
                });
            }
        }
    }
}


function getCountryIdFromNutsId(nutsId) {
    for (const countryId in countriesData) {
        if (countriesData[countryId].nuts2 && countriesData[countryId].nuts2.includes(nutsId)) {
            return countryId;
        }
    }
    return null;
}

// ============================================================================
// Oyun Akışı Fonksiyonları
// ============================================================================

function initializeGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Lütfen adınızı girin!");
        return;
    }
    startScreen.style.display = 'none';
    countrySelectionModal.style.display = 'flex';
    populateCountrySelectionModal();
}

function populateCountrySelectionModal() {
    countryListDiv.innerHTML = '';
    for (const countryId in countriesData) {
        const country = countriesData[countryId];
        // Sadece nuts2 bölgeleri olan ülkeleri listele
        if (country.nuts2 && country.nuts2.length > 0) {
            const countryOption = document.createElement('div');
            countryOption.classList.add('country-option');
            countryOption.textContent = country.name;
            countryOption.dataset.countryId = countryId;
            countryOption.style.backgroundColor = country.color;
            countryOption.style.color = getContrastColor(country.color); // Metin rengini ayarla

            countryOption.addEventListener('click', () => {
                document.querySelectorAll('.country-option').forEach(opt => opt.classList.remove('selected'));
                countryOption.classList.add('selected');
                playerCountryId = countryId;
                playerCountryName = country.name;
            });
            countryListDiv.appendChild(countryOption);
        }
    }
}

function getContrastColor(hexcolor) {
    if (!hexcolor || hexcolor.length < 7) return '#000000'; // Geçersiz renk
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const y = (r * 299 + g * 587 + b * 114) / 1000;
    return (y >= 128) ? '#000000' : '#FFFFFF';
}

function startGame() {
    if (!playerCountryId) {
        alert("Lütfen bir ülke seçin!");
        return;
    }

    countrySelectionModal.style.display = 'none';
    gameScreen.style.display = 'grid'; // Grid display'e geç

    welcomeMessage.textContent = `${playerName}, ${playerCountryName} ülkesine hoş geldiniz!`;
    countriesData[playerCountryId].isPlayer = true;
    countriesData[playerCountryId].coins = INITIAL_PLAYER_COINS; // Oyuncuya başlangıç coini ver

    loadMapAndInitializeRegions(); // Haritayı yükle ve bölgeleri hazırla
}

function loadMapAndInitializeRegions() {
    // gameMapSVG'nin yüklendiğinden emin olun
    if (gameMapSVG.contentDocument) {
        svgDoc = gameMapSVG.contentDocument;
        console.log("SVG Yüklendi! SVG Document:", svgDoc);

        initializeRegions();
    } else {
        gameMapSVG.addEventListener('load', () => {
            svgDoc = gameMapSVG.contentDocument;
            console.log("SVG Yüklendi (Event Listener)! SVG Document:", svgDoc);
            initializeRegions();
        });
        // Eğer SVG zaten yüklüyse ve event listener tetiklenmediyse
        if (gameMapSVG.readyState === "complete" || gameMapSVG.readyState === "interactive") {
            setTimeout(() => {
                if (!svgDoc) { // Eğer hala svgDoc ayarlanmamışsa
                    svgDoc = gameMapSVG.contentDocument;
                    if (svgDoc) {
                        console.log("SVG Yüklendi (Fallback Timeout)! SVG Document:", svgDoc);
                        initializeRegions();
                    } else {
                        console.error("SVG dökümanına erişilemiyor. Lütfen gameMap.svg dosyasının doğru yolu ve içeriği olduğundan emin olun.");
                    }
                }
            }, 100); // Küçük bir gecikme ekle
        }
    }
}

function initializeRegions() {
    // Tüm NUTS ID'lerini konsola yazdır (SVG'nizdeki ID'leri görmek için)
    console.log("SVG'den bulunan tüm NUTS ID'leri:");
    svgDoc.querySelectorAll('path[data-nuts-id]').forEach(path => {
        console.log(path.getAttribute('data-nuts-id'));
    });

    // Her ülkeye başlangıç birimleri ata ve bölgeleri haritada renklendir
    for (const countryId in countriesData) {
        const country = countriesData[countryId];
        country.regions = {}; // Her ülkenin sahip olduğu bölgeleri tutacak obje

        if (country.nuts2 && country.nuts2.length > 0) {
            country.nuts2.forEach(nutsId => {
                const regionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`);
                if (regionPath) {
                    regionPath.style.fill = country.color;
                    country.regions[nutsId] = { units: STARTING_UNITS_PER_REGION }; // Her bölgeye başlangıç birimi
                    
                    // Bölgeye tıklama olayını ekle
                    regionPath.addEventListener('click', () => onRegionClick(nutsId));
                } else {
                    console.warn(`Haritada bulunamayan NUTS ID: ${nutsId} (Ülke: ${country.name}) - Lütfen SVG ve script.js'teki ID'leri eşleştirin.`);
                }
            });
        } else {
            console.warn(`Ülke ${country.name} için tanımlı NUTS2 bölgesi bulunamadı veya boş. Bu ülke oyuna dahil edilmeyecek.`);
        }
    }

    updateUI(); // Başlangıç UI güncellemesi (birim sayıları da burada render edilecek)
    addNotification("Oyun başladı! Birim satın alıp ülkenizi güçlendirin.");
}

function onRegionClick(nutsId) {
    const clickedRegionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`);
    const regionCountryId = getCountryIdFromNutsId(nutsId);

    if (!clickedRegionPath || !regionCountryId) {
        addNotification(`Hata: Tıklanan bölge (${nutsId}) haritada bulunamadı veya bir ülkeye ait değil.`);
        return;
    }

    // Birim yerleştirme aşaması
    if (countriesData[playerCountryId].unitsReady > 0) {
        if (regionCountryId === playerCountryId) {
            if (!countriesData[playerCountryId].regions[nutsId]) {
                countriesData[playerCountryId].regions[nutsId] = { units: 0 };
            }
            countriesData[playerCountryId].regions[nutsId].units++;
            countriesData[playerCountryId].unitsReady--;
            addNotification(`${nutsId} bölgesine 1 birim yerleştirildi. Kalan hazır birim: ${countriesData[playerCountryId].unitsReady}`);
            updateUI();
        } else {
            addNotification("Birimleri sadece kendi bölgelerinize yerleştirebilirsiniz.");
        }
        return;
    }

    // Saldırı modu
    if (currentAttackMode && targetCountryIdForWar) {
        // Eğer tıklanan bölge, kendi bölgemiz ise (saldırı başlangıcı için)
        if (regionCountryId === playerCountryId) {
            if (countriesData[playerCountryId].regions[nutsId] && countriesData[playerCountryId].regions[nutsId].units > 0) {
                // Önceki parlamaları kaldır
                clearHighlights();

                // Yeni saldıran bölgeyi ayarla
                selectedAttackingRegionNutsId = nutsId;
                
                // Komşu düşman bölgeleri parlat
                highlightEnemyNeighbors(nutsId, targetCountryIdForWar);
                addNotification(`${nutsId} bölgesinden saldırı başlatmak için hazır. Hedef ülkeye ait parlayan bir komşu bölgeye tıklayın.`);
            } else {
                addNotification("Saldırmak için seçtiğiniz bölgede birimleriniz olmalı.");
            }
        } else if (regionCountryId === targetCountryIdForWar && selectedAttackingRegionNutsId) {
            // Eğer tıklanan bölge hedef ülkeye ait ve seçili saldırı bölgesine komşu ise
            const neighborsOfAttacker = nutsNeighbors[selectedAttackingRegionNutsId] || [];
            if (!neighborsOfAttacker.includes(nutsId)) {
                addNotification("Seçtiğiniz düşman bölgesi, saldırı başlattığınız bölgeye komşu değil.");
                return;
            }

            const defendingRegionNutsId = nutsId;
            const attackingCountry = countriesData[playerCountryId];
            const defendingCountry = countriesData[targetCountryIdForWar];

            const attackingUnits = attackingCountry.regions[selectedAttackingRegionNutsId].units;
            const defendingUnits = defendingCountry.regions[defendingRegionNutsId] ? defendingCountry.regions[defendingRegionNutsId].units : 0;

            if (attackingUnits === 0) {
                addNotification("Saldırmak için seçtiğiniz bölgede birim kalmadı!");
                resetAttackMode();
                return;
            }
            
            // Savaş Modalı göstermeye gerek yok, doğrudan savaş sonucunu göster
            resolveCombat(
                playerCountryId, selectedAttackingRegionNutsId, attackingUnits,
                targetCountryIdForWar, defendingRegionNutsId, defendingUnits
            );
            
            resetAttackMode(); // Savaş bitti, saldırı modunu kapat
            addNotification("Saldırı modu kapatıldı.");

        } else {
            addNotification("Lütfen birim yerleştirmek için kendi bölgelerinize, saldırı için ise parlayan düşman bölgelerine tıklayın.");
        }
    } else {
        // Normal modda bölgeye tıklama
        if (regionCountryId === playerCountryId) {
            const regionUnits = countriesData[playerCountryId].regions[nutsId] ? countriesData[playerCountryId].regions[nutsId].units : 0;
            addNotification(`Kendi bölgeniz: ${nutsId}. Birim sayısı: ${regionUnits}.`);
        } else { // Eğer tıklanan bölge kendi ülkemize ait değilse
            const regionUnits = countriesData[regionCountryId].regions[nutsId] ? countriesData[regionCountryId].regions[nutsId].units : 0;
            addNotification(`Düşman bölgesi: ${nutsId} (${countriesData[regionCountryId].name}). Birim sayısı: ${regionUnits}.`);
        }
    }
}

function resetAttackMode() {
    currentAttackMode = false;
    selectedAttackingRegionNutsId = null;
    targetCountryIdForWar = null;
    clearHighlights(); // Parlamaları kaldır
}

function clearHighlights() {
    svgDoc.querySelectorAll('.highlight-target').forEach(path => {
        path.classList.remove('highlight-target');
        path.style.stroke = ''; // Sınır rengini sıfırla
        path.style.strokeWidth = ''; // Sınır kalınlığını sıfırla
    });
    // Saldıran bölgenin de vurgusunu kaldır (eğer varsa)
    if (currentActiveCountryPath) {
        currentActiveCountryPath.classList.remove('active-attack-origin');
        currentActiveCountryPath.style.stroke = '';
        currentActiveCountryPath.style.strokeWidth = '';
    }
}

function highlightEnemyNeighbors(playerNutsId, enemyCountryId) {
    const neighbors = nutsNeighbors[playerNutsId];
    if (neighbors) {
        neighbors.forEach(neighborNutsId => {
            const neighborCountryId = getCountryIdFromNutsId(neighborNutsId);
            // Sadece komşu olan ve savaş ilan edilen ülkeye ait olan bölgeleri parlat
            if (neighborCountryId === enemyCountryId) {
                const neighborPath = svgDoc.querySelector(`path[data-nuts-id="${neighborNutsId}"]`);
                if (neighborPath) {
                    neighborPath.classList.add('highlight-target'); // CSS ile kenarlık verilecek
                }
            }
        });
    }
    // Saldıran bölgeyi de özel olarak vurgula
    const attackingRegionPath = svgDoc.querySelector(`path[data-nuts-id="${playerNutsId}"]`);
    if (attackingRegionPath) {
        attackingRegionPath.classList.add('active-attack-origin'); // CSS ile farklı kenarlık verilecek
    }
}


function buyUnit() {
    const player = countriesData[playerCountryId];
    if (player.coins >= UNIT_COST) {
        player.coins -= UNIT_COST;
        player.unitsReady = (player.unitsReady || 0) + 1;
        addNotification(`1 birim satın alındı. Kalan coin: ${player.coins}.`);
        addNotification("Lütfen birim yerleştirmek istediğiniz bir bölgeye tıklayın. (Sadece kendi bölgeleriniz)");
    } else {
        addNotification("Yeterli coininiz yok!");
    }
    updateUI();
}

function declareWar() {
    targetCountryIdForWar = targetCountrySelect.value;
    if (!targetCountryIdForWar || targetCountryIdForWar === 'none') {
        addNotification("Lütfen savaş ilan etmek için bir ülke seçin.");
        return;
    }

    if (targetCountryIdForWar === playerCountryId) {
        addNotification("Kendinize savaş ilan edemezsiniz!");
        return;
    }

    const targetCountry = countriesData[targetCountryIdForWar];
    if (!targetCountry || targetCountry.nuts2.length === 0) {
        addNotification(`${targetCountry.name} oyun dışı veya toprağı yok.`);
        return;
    }

    addNotification(`${targetCountry.name} ülkesine savaş ilan edildi!`);
    addNotification(`Saldırı başlatmak için, kendi birimli bölgelerinizden birine tıklayın. Sonra düşman bölgesini seçin.`);
    currentAttackMode = true; // Saldırı modunu aktif et
    selectedAttackingRegionNutsId = null; // Saldıracak bölgeyi sıfırla
    clearHighlights(); // Önceki vurguları temizle
    
    updateUI();
}


function resolveCombat(
    attackingCountryId, attackingRegionNutsId, attackingUnits,
    defendingCountryId, defendingRegionNutsId, defendingUnits
) {
    addNotification(`Savaş: ${countriesData[attackingCountryId].name}'nin ${attackingRegionNutsId} (${attackingUnits} birim) vs ${countriesData[defendingCountryId].name}'nin ${defendingRegionNutsId} (${defendingUnits} birim)`);

    const attackingCountry = countriesData[attackingCountryId];
    const defendingCountry = countriesData[defendingCountryId];

    if (!attackingCountry || !defendingCountry || !attackingCountry.regions[attackingRegionNutsId]) {
        addNotification("Savaş için gerekli saldırı bölgesi bulunamadı. Hata!");
        return;
    }
    // Savunan bölge yoksa bile objesini oluştur, units 0 olsun
    if (!defendingCountry.regions[defendingRegionNutsId]) {
        defendingCountry.regions[defendingRegionNutsId] = { units: 0 };
    }

    let attackerLosses = 0;
    let defenderLosses = 0;

    // Basit savaş mantığı: saldıranın birimi fazlaysa veya düşmanın birimi yoksa fetheder
    if (attackingUnits > defendingUnits || defendingUnits === 0) {
        // Saldıran kazandı
        addNotification(`${attackingCountry.name} savaşı kazandı ve ${defendingRegionNutsId} bölgesini fethetti!`);
        attackerLosses = Math.floor(defendingUnits * 0.5); // Kazanan %50 düşman birimi kadar kaybeder
        
        attackingCountry.regions[attackingRegionNutsId].units -= attackerLosses;
        if (attackingCountry.regions[attackingRegionNutsId].units < 0) {
            attackingCountry.regions[attackingRegionNutsId].units = 0;
        }

        // Fethettiği bölgeyi kendi ülkesine dahil et
        const conqueredRegionPath = svgDoc.querySelector(`path[data-nuts-id="${defendingRegionNutsId}"]`);
        if (conqueredRegionPath) {
            // Önceki sahibinden bölgeyi çıkar
            // Ancak önce bölgeye yeni birim ataması yapalım, sonra sahibini değiştirelim.
            // Çünkü bölge el değiştirdiğinde unit transferi yapılır.
            
            // Fethedilen bölgeye saldırı yapan bölgeden birim aktar
            const unitsToMove = Math.max(1, Math.floor(attackingUnits * 0.5)); // En az 1 birim aktar
            
            // Savunan bölgenin birimlerini sıfırla
            defendingCountry.regions[defendingRegionNutsId].units = 0;

            // Savunan ülkeden bölgeyi kaldır
            defendingCountry.nuts2 = defendingCountry.nuts2.filter(id => id !== defendingRegionNutsId);
            delete defendingCountry.regions[defendingRegionNutsId];

            // Saldıran ülkeye bölgeyi ekle
            attackingCountry.nuts2.push(defendingRegionNutsId);
            attackingCountry.regions[defendingRegionNutsId] = { units: unitsToMove };

            // Saldıran bölgeden aktarılan birimleri düş
            attackingCountry.regions[attackingRegionNutsId].units -= unitsToMove;
            if (attackingCountry.regions[attackingRegionNutsId].units < 0) {
                attackingCountry.regions[attackingRegionNutsId].units = 0;
            }

            // Bölgenin rengini yeni sahibine göre güncelle
            conqueredRegionPath.style.fill = attackingCountry.color;
        }

    } else {
        // Savunan kazandı (saldıranın birimi az veya eşitse)
        addNotification(`${defendingCountry.name} savunmayı başardı. ${attackingCountry.name} geri çekildi.`);
        attackerLosses = Math.floor(attackingUnits * 0.8); // Saldıranın %80'i kaybeder
        defenderLosses = Math.floor(attackingUnits * 0.2); // Savunan %20 saldırı birimi kadar kaybeder

        attackingCountry.regions[attackingRegionNutsId].units -= attackerLosses;
        if (attackingCountry.regions[attackingRegionNutsId].units < 0) {
            attackingCountry.regions[attackingRegionNutsId].units = 0;
        }
        defendingCountry.regions[defendingRegionNutsId].units -= defenderLosses;
        if (defendingCountry.regions[defendingRegionNutsId].units < 0) {
            defendingCountry.regions[defendingRegionNutsId].units = 0;
        }
    }

    checkCountryElimination(defendingCountryId); // Savunan ülkenin elendiğini kontrol et
    checkCountryElimination(attackingCountryId); // Saldıran ülkenin elendiğini kontrol et (eğer tüm bölgelerini kaybetti ise)
    updateUI();
}


function checkCountryElimination(countryId) {
    const country = countriesData[countryId];
    if (country && country.nuts2.length === 0) {
        addNotification(`${country.name} tüm topraklarını kaybetti ve oyundan elendi!`);
        
        // Elenen ülkenin harita üzerindeki tüm bölgelerinin rengini gri yap
        // (Eğer başka bir ülke tarafından fethedilmediyse ve haritada hala görünüyorsa)
        if (svgDoc) {
            svgDoc.querySelectorAll(`path[data-nuts-id]`).forEach(path => {
                // Eğer bu path hala elenen ülkenin bir bölgesi olarak kayıtlıysa (ki nuts2'den çıkarılmalıydı)
                // veya fetih sırasında renk değiştirilemediyse, burası son temizlik.
                const pathNutsId = path.getAttribute('data-nuts-id');
                // Eğer bu nutsId'nin sahibi hala elenen ülke olarak görünüyorsa
                if (getCountryIdFromNutsId(pathNutsId) === countryId) {
                     path.style.fill = '#888888'; // Griye çevir
                }
            });
        }
        delete countriesData[countryId]; // Ülkeyi ülkeler listesinden sil
        
        // Eğer elenen ülke oyuncunun ülkesi ise oyun biter.
        if (countryId === playerCountryId) {
            alert("Oyun Bitti! Tüm topraklarınızı kaybettiniz.");
            location.reload(); // Oyunu yeniden başlat
        }
        // Hedef ülke seçicisini güncelle
        updateTargetCountrySelect();
    }
}

function updateTargetCountrySelect() {
    targetCountrySelect.innerHTML = '<option value="none">Ülke Seçin</option>';
    const availableCountries = Object.keys(countriesData).filter(id => 
        countriesData.hasOwnProperty(id) && 
        id !== playerCountryId && 
        countriesData[id].nuts2 && // nuts2 dizisi var mı
        countriesData[id].nuts2.length > 0 // en az bir bölgesi var mı
    );

    if (availableCountries.length === 0) {
        const option = document.createElement('option');
        option.value = 'none';
        option.textContent = 'Savaşacak ülke kalmadı!';
        targetCountrySelect.appendChild(option);
        declareWarButton.disabled = true;
    } else {
        declareWarButton.disabled = false;
        availableCountries.forEach(countryId => {
            const option = document.createElement('option');
            option.value = countryId;
            option.textContent = countriesData[countryId].name;
            targetCountrySelect.appendChild(option);
        });
    }
}


function nextTurn() {
    currentTurn++;
    addNotification(`--- Tur ${currentTurn} başladı! ---`);

    // Oyuncu gelirini hesapla
    const player = countriesData[playerCountryId];
    // Player nesnesinin hala var olup olmadığını kontrol edin (elenmiş olabilir)
    if (player) {
        const playerIncome = player.nuts2.length * INCOME_PER_REGION;
        player.coins += playerIncome;
        addNotification(`Ülkeniz ${playerIncome} coin gelir elde etti. Toplam coin: ${player.coins}.`);
    } else {
        addNotification("Ülkeniz elendiği için gelir elde edemedi.");
    }

    // AI'ların hareketleri
    runAILogic();

    // Birim yerleştirme modunu kapat ve highlight'ları temizle
    if (countriesData[playerCountryId]) { // Oyuncu ülkesi hala varsa
        countriesData[playerCountryId].unitsReady = 0; // Hazır birimleri sıfırla
    }
    
    resetAttackMode(); // Her tur sonunda saldırı modunu sıfırla

    updateUI();
}

function runAILogic() {
    // AI listesini sadece mevcut ve toprakları olan ülkelerden oluştur
    const aiCountryIds = Object.keys(countriesData).filter(id => 
        !countriesData[id].isPlayer && 
        countriesData[id] && 
        countriesData[id].nuts2 && 
        countriesData[id].nuts2.length > 0
    );

    // AI'ları rastgele sırada hareket ettir
    shuffleArray(aiCountryIds).forEach(aiId => {
        const aiCountry = countriesData[aiId];
        if (!aiCountry || aiCountry.nuts2.length === 0) return; // Ülke elenmiş olabilir veya toprağı yok

        // AI gelir elde etsin
        const aiIncome = aiCountry.nuts2.length * INCOME_PER_REGION;
        aiCountry.coins += aiIncome;
        addNotification(`${aiCountry.name} ${aiIncome} coin gelir elde etti.`);

        // AI birim satın alsın (basit strateji)
        while (aiCountry.coins >= UNIT_COST) {
            aiCountry.coins -= UNIT_COST;
            aiCountry.unitsReady = (aiCountry.unitsReady || 0) + 1;
            addNotification(`${aiCountry.name} 1 birim satın aldı.`);
        }

        // AI birimlerini yerleştirsin (rasgele kendi bölgelerine)
        if (aiCountry.unitsReady > 0 && aiCountry.nuts2.length > 0) {
            // Birim yerleştirecek uygun bölgeleri filtrele (eğer regions objesinde yoksa oluştur)
            let ownedRegionsWithUnits = aiCountry.nuts2.filter(nutsId => aiCountry.regions[nutsId]);
            if (ownedRegionsWithUnits.length === 0) { // Eğer hiçbir bölge units içermiyorsa, tüm bölgeleri kullan
                ownedRegionsWithUnits = aiCountry.nuts2; // Tüm bölgeleri hedef olarak al
            }
            
            const targetRegionForPlacement = ownedRegionsWithUnits[Math.floor(Math.random() * ownedRegionsWithUnits.length)];

            if (targetRegionForPlacement) {
                if (!aiCountry.regions[targetRegionForPlacement]) { // Bölge objesi yoksa oluştur
                    aiCountry.regions[targetRegionForPlacement] = { units: 0 };
                }
                aiCountry.regions[targetRegionForPlacement].units += aiCountry.unitsReady;
                addNotification(`${aiCountry.name} ${aiCountry.unitsReady} birimi ${targetRegionForPlacement} bölgesine yerleştirdi.`);
                aiCountry.unitsReady = 0;
            }
        }

        // AI savaş ilan etsin (basit rastgele strateji)
        if (Math.random() < WAR_CHANCE_BASE) {
            const potentialTargets = Object.keys(countriesData).filter(id => id !== aiId && countriesData[id] && countriesData[id].nuts2 && countriesData[id].nuts2.length > 0);
            
            if (potentialTargets.length > 0) {
                const targetCountryId = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                const targetCountry = countriesData[targetCountryId];

                // AI'nın saldırabileceği bölgeleri bul
                const aiAvailableRegions = aiCountry.nuts2.filter(nutsId => aiCountry.regions[nutsId] && aiCountry.regions[nutsId].units > 0);

                let attackInitiated = false;
                // AI'nın birim olan her bölgesini kontrol et
                shuffleArray(aiAvailableRegions).forEach(attackingRegionNutsId => {
                    if (attackInitiated) return; // Zaten saldırı başlatıldıysa çık

                    const possibleDefendingRegions = (nutsNeighbors[attackingRegionNutsId] || []).filter(neighborNutsId => {
                        return getCountryIdFromNutsId(neighborNutsId) === targetCountryId && 
                               (targetCountry.regions[neighborNutsId] && targetCountry.regions[neighborNutsId].units >= 0); 
                    });

                    if (possibleDefendingRegions.length > 0) {
                        const defendingRegionNutsId = possibleDefendingRegions[Math.floor(Math.random() * possibleDefendingRegions.length)];

                        const attackingUnits = aiCountry.regions[attackingRegionNutsId].units;
                        const defendingUnits = targetCountry.regions[defendingRegionNutsId] ? targetCountry.regions[defendingRegionNutsId].units : 0;

                        // AI saldırıyı başlatmak için en az 1 birimi olmalı ve hedef bölgede birim olmalı
                        // Veya AI'nın birimi hedeften fazla olmalı (basit AI kuralı)
                        if (attackingUnits > 0 && 
                            (defendingUnits === 0 || attackingUnits > defendingUnits)) {
                            
                            addNotification(`${aiCountry.name} ülkesi, ${targetCountry.name} ülkesine savaş ilan etti!`);
                            resolveCombat(
                                aiId, attackingRegionNutsId, attackingUnits,
                                targetCountryId, defendingRegionNutsId, defendingUnits
                            );
                            attackInitiated = true; // Bu tur bu AI için saldırı yapıldı
                        }
                    }
                });
            }
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ============================================================================
// Olay Dinleyicileri
// ============================================================================
startGameButton.addEventListener('click', initializeGame);
selectCountryButton.addEventListener('click', startGame);
buyUnitButton.addEventListener('click', buyUnit);
nextTurnButton.addEventListener('click', nextTurn);
declareWarButton.addEventListener('click', declareWar);

// İlk yüklemede UI'ı gizle
document.addEventListener('DOMContentLoaded', () => {
    gameScreen.style.display = 'none';
    countrySelectionModal.style.display = 'none';
    // warModal'ı artık kullanmıyoruz, gizlemeye gerek yok.
});
