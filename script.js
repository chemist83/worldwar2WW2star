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

const warModal = document.getElementById('warModal');
const warModalTitle = document.getElementById('warModalTitle');
const attackingRegionInfo = document.getElementById('attackingRegionInfo');
const defendingRegionInfo = document.getElementById('defendingRegionInfo');
const conductAttackButton = document.getElementById('conductAttackButton');
const closeWarModalButton = document.getElementById('closeWarModalButton');

// ============================================================================
// Oyun Verileri (BU KISIM KESİNLİKLE KENDİ SVG HARİTANIZA GÖRE DÜZENLENMELİ!)
// ============================================================================
let countriesData = {
    'TR': { name: 'Türkiye', nuts2: ['TR10', 'TR21', 'TR22', 'TR31', 'TR32', 'TR33', 'TR41', 'TR42', 'TR51', 'TR52', 'TR61', 'TR62', 'TR63', 'TR71', 'TR81', 'TR82', 'TR83', 'TR90', 'TRA1', 'TRA2', 'TRB1', 'TRB2', 'TRC1', 'TRC2', 'TRC3'], isPlayer: false, color: '#FF0000', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/tr_attack_icon.png' },
    'UK': { name: 'Birleşik Krallık', nuts2: ['UKI', 'UKF', 'UKD', 'UKG', 'UKH', 'UKK', 'UKM', 'UKL', 'UKJ', 'UKN'], isPlayer: false, color: '#0000FF', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/uk_attack_icon.png' },
    'DE': { name: 'Almanya', nuts2: ['DE1', 'DE2', 'DE3', 'DE4', 'DE5', 'DE6', 'DE7', 'DE8', 'DE9', 'DEA', 'DEB', 'DEC', 'DED', 'DEE', 'DEF', 'DEG'], isPlayer: false, color: '#FFFF00', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/de_attack_icon.png' },
    'FR': { name: 'Fransa', nuts2: ['FR1', 'FRB', 'FRC', 'FRD', 'FRE', 'FRF', 'FRG', 'FRH', 'FRI', 'FRJ', 'FRK', 'FRL', 'FRM', 'FRN'], isPlayer: false, color: '#FF4500', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/fr_attack_icon.png' },
    'IT': { name: 'İtalya', nuts2: ['ITC', 'ITF', 'ITG', 'ITH', 'ITI', 'ITJ'], isPlayer: false, color: '#00FF00', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/it_attack_icon.png' },
    'ES': { name: 'İspanya', nuts2: ['ES1', 'ES2', 'ES3', 'ES4', 'ES5', 'ES6', 'ES7'], isPlayer: false, color: '#FFA500', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/es_attack_icon.png' },
    'PL': { name: 'Polonya', nuts2: ['PL1', 'PL2', 'PL3', 'PL4', 'PL5', 'PL6'], isPlayer: false, color: '#800080', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/pl_attack_icon.png' },
    'RO': { name: 'Romanya', nuts2: ['RO1', 'RO2', 'RO3', 'RO4'], isPlayer: false, color: '#ADD8E6', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ro_attack_icon.png' },
    'HU': { name: 'Macaristan', nuts2: ['HU1', 'HU2', 'HU3'], isPlayer: false, color: '#FFC0CB', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/hu_attack_icon.png' },
    'AT': { name: 'Avusturya', nuts2: ['AT1', 'AT2', 'AT3'], isPlayer: false, color: '#F0E68C', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/at_attack_icon.png' },
    'BE': { name: 'Belçika', nuts2: ['BE1', 'BE2', 'BE3'], isPlayer: false, color: '#A52A2A', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/be_attack_icon.png' },
    'NL': { name: 'Hollanda', nuts2: ['NL1', 'NL2', 'NL3', 'NL4'], isPlayer: false, color: '#DAA520', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/nl_attack_icon.png' },
    'SE': { name: 'İsveç', nuts2: ['SE1', 'SE2', 'SE3'], isPlayer: false, color: '#87CEEB', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/se_attack_icon.png' },
    'NO': { name: 'Norveç', nuts2: ['NO0'], isPlayer: false, color: '#B0C4DE', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/no_attack_icon.png' },
    'FI': { name: 'Finlandiya', nuts2: ['FI1', 'FI2'], isPlayer: false, color: '#AFEEEE', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/fi_attack_icon.png' },
    'DK': { name: 'Danimarka', nuts2: ['DK0'], isPlayer: false, color: '#CD5C5C', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/dk_attack_icon.png' },
    'CH': { name: 'İsviçre', nuts2: ['CH0'], isPlayer: false, color: '#DC143C', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ch_attack_icon.png' },
    'GR': { name: 'Yunanistan', nuts2: ['EL3', 'EL4'], isPlayer: false, color: '#ADFF2F', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/gr_attack_icon.png' },
    'PT': { name: 'Portekiz', nuts2: ['PT1', 'PT2', 'PT3'], isPlayer: false, color: '#8B4513', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/pt_attack_icon.png' },
    'IE': { name: 'İrlanda', nuts2: ['IE0'], isPlayer: false, color: '#228B22', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ie_attack_icon.png' },
    'CZ': { name: 'Çekya', nuts2: ['CZ0'], isPlayer: false, color: '#4682B4', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/cz_attack_icon.png' },
    'SK': { name: 'Slovakya', nuts2: ['SK0'], isPlayer: false, color: '#BA55D3', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/sk_attack_icon.png' },
    'BG': { name: 'Bulgaristan', nuts2: ['BG3', 'BG4'], isPlayer: false, color: '#FA8072', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/bg_attack_icon.png' },
    'HR': { name: 'Hırvatistan', nuts2: ['HR0'], isPlayer: false, color: '#9ACD32', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/hr_attack_icon.png' },
    'SI': { name: 'Slovenya', nuts2: ['SI0'], isPlayer: false, color: '#66CDAA', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/si_attack_icon.png' },
    'LT': { name: 'Litvanya', nuts2: ['LT0'], isPlayer: false, color: '#FFD700', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/lt_attack_icon.png' },
    'LV': { name: 'Letonya', nuts2: ['LV0'], isPlayer: false, color: '#DEB887', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/lv_attack_icon.png' },
    'EE': { name: 'Estonya', nuts2: ['EE0'], isPlayer: false, color: '#FFFAF0', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ee_attack_icon.png' },

    // TEK TOPRAKLI ÜLKELER - Eğer SVG'nizde bu ID'ler yoksa veya farklıysa DÜZENLEYİN!
    'LU': { name: 'Lüksemburg', nuts2: ['LU00'], isPlayer: false, color: '#800080', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/lu_attack_icon.png' },
    'CY': { name: 'Kıbrıs', nuts2: ['CY00'], isPlayer: false, color: '#19cf0c', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/cy_attack_icon.png' },
    'IS': { name: 'İzlanda', nuts2: ['IS00'], isPlayer: false, color: '#A9A9A9', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/is_attack_icon.png' },
    'MT': { name: 'Malta', nuts2: ['MT00'], isPlayer: false, color: '#D3D3D3', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/mt_attack_icon.png' },
    'MD': { name: 'Moldova', nuts2: ['MD00'], isPlayer: false, color: '#98FB98', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/md_attack_icon.png' },
    'AL': { name: 'Arnavutluk', nuts2: ['AL00'], isPlayer: false, color: '#B22222', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/al_attack_icon.png' },
    'BA': { name: 'Bosna-Hersek', nuts2: ['BA00'], isPlayer: false, color: '#4B0082', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ba_attack_icon.png' }, // Yugoslavya'dan ayrı
    'ME': { name: 'Karadağ', nuts2: ['ME00'], isPlayer: false, color: '#CD853F', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/me_attack_icon.png' }, // Yugoslavya'dan ayrı
    'MK': { name: 'Kuzey Makedonya', nuts2: ['MK00'], isPlayer: false, color: '#FF6347', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/mk_attack_icon.png' }, // Yugoslavya'dan ayrı
    'XK': { name: 'Kosova', nuts2: ['XK00'], isPlayer: false, color: '#DDA0DD', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/xk_attack_icon.png' }, // Yugoslavya'dan ayrı
    'GE': { name: 'Gürcistan', nuts2: ['GE00'], isPlayer: false, color: '#808000', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ge_attack_icon.png' },
    'AZ': { name: 'Azerbaycan', nuts2: ['AZ00'], isPlayer: false, color: '#5F9EA0', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/az_attack_icon.png' },
    'AM': { name: 'Ermenistan', nuts2: ['AM00'], isPlayer: false, color: '#9370DB', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/am_attack_icon.png' },
    'BY': { name: 'Belarus', nuts2: ['BY00'], isPlayer: false, color: '#BDB76B', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/by_attack_icon.png' },
    'UA': { name: 'Ukrayna', nuts2: ['UA30', 'UA40', 'UA50'], isPlayer: false, color: '#DAA520', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ua_attack_icon.png' }, // Örnek NUTS2'ler
    'KZ': { name: 'Kazakistan', nuts2: ['KZ00'], isPlayer: false, color: '#6495ED', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/kz_attack_icon.png' }, // Geniş bir ülke, NUTS ID'si haritanızda neyse onu kullanın
    'RU': { name: 'Rusya (Batı)', nuts2: ['RU00'], isPlayer: false, color: '#8B0000', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ru_attack_icon.png' }, // Genel bir 'RU00' kullandım, eğer haritanızda spesifik NUTS ID'ler varsa listeleyin
    'RS': { name: 'Sırbistan', nuts2: ['RS00'], isPlayer: false, color: '#483D8B', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/rs_attack_icon.png' },

    // Ekstra Afrika/Orta Doğu ülkeleri için örnekler - SVG'nizde varlarsa ID'lerini DÜZENLEYİN
    'MA': { name: 'Fas', nuts2: ['MA00'], isPlayer: false, color: '#008000', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ma_attack_icon.png' },
    'DZ': { name: 'Cezayir', nuts2: ['DZ00'], isPlayer: false, color: '#006400', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/dz_attack_icon.png' },
    'TN': { name: 'Tunus', nuts2: ['TN00'], isPlayer: false, color: '#2E8B57', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/tn_attack_icon.png' },
    'LY': { name: 'Libya', nuts2: ['LY00'], isPlayer: false, color: '#6B8E23', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ly_attack_icon.png' },
    'EG': { name: 'Mısır', nuts2: ['EG00'], isPlayer: false, color: '#556B2F', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/eg_attack_icon.png' },
    'SY': { name: 'Suriye', nuts2: ['SY00'], isPlayer: false, color: '#8FBC8F', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/sy_attack_icon.png' },
    'LB': { name: 'Lübnan', nuts2: ['LB00'], isPlayer: false, color: '#3CB371', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/lb_attack_icon.png' },
    'IQ': { name: 'Irak', nuts2: ['IQ00'], isPlayer: false, color: '#66CDAA', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/iq_attack_icon.png' },
    'IR': { name: 'İran', nuts2: ['IR00'], isPlayer: false, color: '#20B2AA', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ir_attack_icon.png' },
    'SA': { name: 'Suudi Arabistan', nuts2: ['SA00'], isPlayer: false, color: '#48D1CC', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/sa_attack_icon.png' },
    'YE': { name: 'Yemen', nuts2: ['YE00'], isPlayer: false, color: '#40E0D0', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ye_attack_icon.png' },
    'OM': { name: 'Umman', nuts2: ['OM00'], isPlayer: false, color: '#00CED1', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/om_attack_icon.png' },
    'AE': { name: 'Birleşik Arap Emirlikleri', nuts2: ['AE00'], isPlayer: false, color: '#00BFFF', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/ae_attack_icon.png' },
    'QA': { name: 'Katar', nuts2: ['QA00'], isPlayer: false, color: '#87CEFA', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/qa_attack_icon.png' },
    'KW': { name: 'Kuveyt', nuts2: ['KW00'], isPlayer: false, color: '#778899', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/kw_attack_icon.png' },
    'BH': { name: 'Bahreyn', nuts2: ['BH00'], isPlayer: false, color: '#B0C4DE', coins: INITIAL_AI_COINS, units: 0, attackIconPath: 'icons/bh_attack_icon.png' }
};

// NUTS Bölgeleri ve Komşulukları (BU KISIM KESİNLİKLE KENDİ SVG HARİTANIZA GÖRE DÜZENLENMELİ!)
// Eğer SVG'nizde bu NUTS ID'ler yoksa veya komşulukları farklıysa DÜZENLEYİN!
const nutsNeighbors = {
    // Türkiye NUTS2 komşulukları (örnek, kendi SVG'nize göre doldurun)
    'TR10': ['TR21', 'TR41'],
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
    'TR63': ['TR52', 'TR62', 'TR71', 'TR82', 'TR83', 'TRC1', 'CY00'], // CY00: Kıbrıs'ın komşusu (denizden)
    'TR71': ['TR51', 'TR61', 'TR63', 'TR81', 'TR90'],
    'TR81': ['TR61', 'TR62', 'TR71', 'TR82', 'TR90', 'TRA1'],
    'TR82': ['TR62', 'TR63', 'TR81', 'TR83', 'TRA1', 'TRA2'],
    'TR83': ['TR63', 'TR82', 'TRB1', 'TRC1', 'TRA2'],
    'TR90': ['TR41', 'TR42', 'TR71', 'TR81', 'TRB2', 'GE00', 'AM00', 'AZ00'], // Gürcistan, Ermenistan, Azerbaycan komşuları
    'TRA1': ['TR81', 'TR82', 'TRA2', 'TRB1', 'TRB2', 'TRC1'],
    'TRA2': ['TR82', 'TR83', 'TRA1', 'TRB1', 'TRC1'],
    'TRB1': ['TR83', 'TRA1', 'TRA2', 'TRB2', 'TRC1', 'TRC2'],
    'TRB2': ['TR90', 'TRA1', 'TRB1', 'TRC2', 'TRC3'],
    'TRC1': ['TR63', 'TR83', 'TRA1', 'TRA2', 'TRB1', 'TRC2'],
    'TRC2': ['TRB1', 'TRB2', 'TRC1', 'TRC3'],
    'TRC3': ['TRB2', 'TRC2', 'IQ00', 'SY00'], // Irak ve Suriye komşuları

    // Avrupa NUTS0/NUTS1/NUTS2 komşulukları (örnekler, kendi haritanıza göre doldurun)
    'UKH': ['UKG', 'UKJ', 'UKF'],
    'FRC1': ['FRC2', 'FRD1', 'BE31', 'LU00'], // Lüksemburg komşusu
    'DE11': ['DE12', 'DE21', 'CZ00'], // Çekya komşusu
    'AT11': ['AT12', 'CZ00', 'HU10', 'SK00'], // Çekya, Macaristan, Slovakya komşuları

    // Tek topraklı ülkelerin komşulukları (ÖNEMLİ: Kendi SVG ID'lerinize göre düzeltin!)
    'LU00': ['FRC1', 'DE12', 'BE21'], // Lüksemburg
    'CY00': ['TR63'], // Kıbrıs (Türkiye ile denizden komşu varsayıldı)
    'IS00': [], // İzlanda'nın kara komşusu yok
    'MT00': [], // Malta'nın kara komşusu yok
    'MD00': ['RO41', 'UA30'], // Moldova (Romanya ve Ukrayna ile komşu)
    'AL00': ['GR11', 'MK00', 'XK00', 'ME00'], // Arnavutluk
    'BA00': ['HR03', 'RS00', 'ME00'], // Bosna-Hersek
    'ME00': ['AL00', 'BA00', 'RS00', 'HR03'], // Karadağ
    'MK00': ['AL00', 'RS00', 'GR11', 'BG42', 'XK00'], // Kuzey Makedonya
    'XK00': ['AL00', 'MK00', 'RS00'], // Kosova
    'GE00': ['TR90', 'AZ00', 'RU00'], // Gürcistan
    'AZ00': ['GE00', 'AM00', 'TR90', 'IR00'], // Azerbaycan
    'AM00': ['GE00', 'AZ00', 'TR90', 'IR00'], // Ermenistan
    'BY00': ['PL10', 'LT00', 'LV00', 'UA30', 'RU00'], // Belarus
    'UA30': ['UA40', 'BY00', 'RU00', 'MD00', 'RO41', 'HU33', 'SK00', 'PL10'], // Ukrayna'nın genel bir bölgesi (örnek)
    'KZ00': ['RU00', 'AZ00', 'UZ00'], // Kazakistan (örnek)
    'RU00': ['BY00', 'UA30', 'EE00', 'LV00', 'FI10', 'NO00', 'KZ00', 'GE00'], // Rusya (örnek, geniş bir ID)
    'RS00': ['BA00', 'HR03', 'HU33', 'RO41', 'BG42', 'MK00', 'ME00', 'XK00'], // Sırbistan

    // Afrika/Orta Doğu komşulukları (örnekler, kendi haritanıza göre doldurun)
    'MA00': ['DZ00'],
    'DZ00': ['MA00', 'TN00', 'LY00', 'ML00', 'NE00', 'MR00'],
    'TN00': ['DZ00', 'LY00'],
    'LY00': ['DZ00', 'TN00', 'EG00', 'SD00', 'NE00', 'TD00'],
    'EG00': ['LY00', 'SD00', 'IL00', 'SY00'],
    'SY00': ['TRC3', 'LB00', 'IQ00', 'JO00', 'EG00'],
    'LB00': ['SY00', 'IL00'],
    'IQ00': ['TRC3', 'SY00', 'IR00', 'SA00', 'JO00', 'KW00'],
    'IR00': ['TR90', 'AZ00', 'AM00', 'IQ00', 'AF00', 'PK00', 'OM00', 'AE00'],
    'SA00': ['IQ00', 'JO00', 'YE00', 'OM00', 'AE00', 'QA00', 'KW00', 'BH00'],
    'YE00': ['SA00', 'OM00'],
    'OM00': ['YE00', 'SA00', 'AE00', 'IR00'],
    'AE00': ['OM00', 'SA00', 'QA00'],
    'QA00': ['SA00', 'AE00'],
    'KW00': ['IQ00', 'SA00'],
    'BH00': ['SA00']
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
    // displayAttackIcons(); // Artık otomatik ikon göstermeyeceğiz
}

function renderUnitCounts() {
    unitCountsOverlay.innerHTML = ''; // Mevcut sayıları temizle

    const svgRect = gameMapSVG.getBoundingClientRect();

    for (const countryId in countriesData) {
        if (countriesData.hasOwnProperty(countryId)) {
            const country = countriesData[countryId];
            if (country.nuts2) {
                country.nuts2.forEach(nutsId => {
                    const regionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`);
                    if (regionPath) {
                        const region = country.regions[nutsId];
                        if (region && region.units > 0) {
                            const bbox = regionPath.getBBox();
                            const centerX = bbox.x + bbox.width / 2;
                            const centerY = bbox.y + bbox.height / 2;

                            // SVG koordinatlarını HTML koordinatlarına dönüştür
                            const svgPoint = svgDoc.createSVGPoint();
                            svgPoint.x = centerX;
                            svgPoint.y = centerY;

                            const CTM = regionPath.getCTM();
                            const transformedPoint = svgPoint.matrixTransform(CTM);

                            const overlayX = transformedPoint.x / svgDoc.width.baseVal.value * svgRect.width;
                            const overlayY = transformedPoint.y / svgDoc.height.baseVal.value * svgRect.height;

                            const unitCountDiv = document.createElement('div');
                            unitCountDiv.className = 'unit-count';
                            unitCountDiv.textContent = region.units;
                            unitCountDiv.style.left = `${overlayX}px`;
                            unitCountDiv.style.top = `${overlayY}px`;
                            unitCountDiv.style.transform = 'translate(-50%, -50%)'; // Merkeze hizala

                            unitCountsOverlay.appendChild(unitCountDiv);
                        }
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
    gameMapSVG.addEventListener('load', () => {
        svgDoc = gameMapSVG.contentDocument;
        console.log("SVG Yüklendi! SVG Document:", svgDoc); // Debug için

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
                        console.warn(`Haritada bulunamayan NUTS ID: ${nutsId} (Ülke: ${country.name})`);
                    }
                });
            } else {
                console.warn(`Ülke ${country.name} için tanımlı NUTS2 bölgesi bulunamadı veya boş.`);
            }
        }

        updateUI(); // Başlangıç UI güncellemesi
        addNotification("Oyun başladı! Birim satın alıp ülkenizi güçlendirin.");
    });
}

function onRegionClick(nutsId) {
    const clickedRegionPath = svgDoc.querySelector(`path[data-nuts-id="${nutsId}"]`);
    const regionCountryId = getCountryIdFromNutsId(nutsId);

    // Birim yerleştirme aşaması
    if (countriesData[playerCountryId].unitsReady > 0) {
        if (regionCountryId === playerCountryId) {
            countriesData[playerCountryId].regions[nutsId].units++;
            countriesData[playerCountryId].unitsReady--;
            addNotification(`${nutsId} bölgesine 1 birim yerleştirildi. Kalan hazır birim: ${countriesData[playerCountryId].unitsReady}`);
            updateUI();
        } else {
            addNotification("Birimleri sadece kendi bölgelerinize yerleştirebilirsiniz.");
        }
        return; // Birim yerleştirme işlemi yapıldıysa diğer işlemlere geçme
    }

    // Saldırı modu (eğer birim yerleştirme yapılmıyorsa)
    if (currentAttackMode && targetCountryIdForWar) {
        // Eğer tıklanan bölge, seçili saldıran bölge ise (kendi bölgemiz)
        if (regionCountryId === playerCountryId && countriesData[playerCountryId].regions[nutsId].units > 0) {
            // Önceki parlamaları kaldır
            clearHighlights();

            // Yeni saldıran bölgeyi ayarla
            selectedAttackingRegionNutsId = nutsId;
            currentActiveCountryPath = clickedRegionPath; // Aktif yolu güncelle

            // Komşu düşman bölgeleri parlat
            highlightEnemyNeighbors(nutsId, targetCountryIdForWar);
            addNotification(`${nutsId} bölgesinden saldırı başlatmak için hazır. Hedef ülkeye ait parlayan bir komşu bölgeye tıklayın.`);
        } else if (regionCountryId === targetCountryIdForWar && selectedAttackingRegionNutsId) {
            // Eğer tıklanan bölge hedef ülkeye ait ve parlayan bir düşman bölgesi ise (yani saldırı hedefi)
            const defendingRegionNutsId = nutsId;
            const attackingCountry = countriesData[playerCountryId];
            const defendingCountry = countriesData[targetCountryIdForWar];

            const attackingUnits = attackingCountry.regions[selectedAttackingRegionNutsId].units;
            const defendingUnits = defendingCountry.regions[defendingRegionNutsId].units;

            // Savaş Modalı göstermeye gerek yok, doğrudan savaş sonucunu göster
            resolveCombat(
                playerCountryId, selectedAttackingRegionNutsId, attackingUnits,
                targetCountryIdForWar, defendingRegionNutsId, defendingUnits
            );
            
            // Savaş bitti, saldırı modunu kapat
            currentAttackMode = false;
            selectedAttackingRegionNutsId = null;
            targetCountryIdForWar = null;
            clearHighlights(); // Parlamaları kaldır
            addNotification("Saldırı modu kapatıldı.");

        } else {
            addNotification("Lütfen birim yerleştirmek için kendi bölgelerinize, saldırı için ise parlayan düşman bölgelerine tıklayın.");
        }
    } else {
        // Normal modda bölgeye tıklama
        if (regionCountryId === playerCountryId) {
            addNotification(`Kendi bölgeniz: ${nutsId}. Birim sayısı: ${countriesData[playerCountryId].regions[nutsId].units}`);
        } else if (regionCountryId) {
            addNotification(`Düşman bölgesi: ${nutsId} (${countriesData[regionCountryId].name}). Birim sayısı: ${countriesData[regionCountryId].regions[nutsId].units}`);
        } else {
            addNotification(`Boş bölge: ${nutsId}`);
        }
    }
}

function clearHighlights() {
    svgDoc.querySelectorAll('.highlight-target').forEach(path => {
        path.classList.remove('highlight-target');
        path.style.stroke = ''; // Sınır rengini sıfırla
        path.style.strokeWidth = ''; // Sınır kalınlığını sıfırla
    });
}

function highlightEnemyNeighbors(playerNutsId, enemyCountryId) {
    const neighbors = nutsNeighbors[playerNutsId];
    if (neighbors) {
        neighbors.forEach(neighborNutsId => {
            const neighborCountryId = getCountryIdFromNutsId(neighborNutsId);
            if (neighborCountryId === enemyCountryId) {
                const neighborPath = svgDoc.querySelector(`path[data-nuts-id="${neighborNutsId}"]`);
                if (neighborPath) {
                    neighborPath.classList.add('highlight-target');
                }
            }
        });
    }
}


function buyUnit() {
    const player = countriesData[playerCountryId];
    if (player.coins >= UNIT_COST) {
        player.coins -= UNIT_COST;
        player.unitsReady = (player.unitsReady || 0) + 1;
        addNotification(`1 birim satın alındı. Kalan coin: ${player.coins}`);
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

    // Savaş ilan ettiğimiz ülkenin sınır bölgelerini geçici olarak vurgulayabiliriz
    // Bu kod şimdilik pasif, parlatma artık oyuncu tıklamasıyla olacak.
    // changeNuts2ColorForConflict(targetCountryIdForWar);
    
    updateUI();
}


function resolveCombat(
    attackingCountryId, attackingRegionNutsId, attackingUnits,
    defendingCountryId, defendingRegionNutsId, defendingUnits
) {
    addNotification(`Savaş: ${attackingCountryId}'nin ${attackingRegionNutsId} (${attackingUnits} birim) vs ${defendingCountryId}'nin ${defendingRegionNutsId} (${defendingUnits} birim)`);

    const attackingCountry = countriesData[attackingCountryId];
    const defendingCountry = countriesData[defendingCountryId];

    if (!attackingCountry || !defendingCountry || !attackingCountry.regions[attackingRegionNutsId] || !defendingCountry.regions[defendingRegionNutsId]) {
        addNotification("Savaş için gerekli bölgeler bulunamadı. Hata!");
        return;
    }

    let attackerLosses = 0;
    let defenderLosses = 0;

    if (attackingUnits > defendingUnits) {
        // Saldıran kazandı
        addNotification(`${attackingCountry.name} savaşı kazandı ve ${defendingRegionNutsId} bölgesini fethetti!`);
        attackerLosses = Math.floor(defendingUnits * 0.5); // Kazanan %50 düşman birimi kadar kaybeder
        defenderLosses = defendingUnits; // Kaybeden tüm birimlerini kaybeder

        attackingCountry.regions[attackingRegionNutsId].units -= attackerLosses;
        if (attackingCountry.regions[attackingRegionNutsId].units < 0) {
            attackingCountry.regions[attackingRegionNutsId].units = 0;
        }

        // Fethettiği bölgeyi kendi ülkesine dahil et
        const conqueredRegionPath = svgDoc.querySelector(`path[data-nuts-id="${defendingRegionNutsId}"]`);
        if (conqueredRegionPath) {
            conqueredRegionPath.style.fill = attackingCountry.color;

            // Önceki sahibinden bölgeyi çıkar
            const oldDefendingCountry = countriesData[defendingCountryId];
            if (oldDefendingCountry) {
                oldDefendingCountry.nuts2 = oldDefendingCountry.nuts2.filter(id => id !== defendingRegionNutsId);
                delete oldDefendingCountry.regions[defendingRegionNutsId];
            }

            // Yeni sahibine bölgeyi ekle
            attackingCountry.nuts2.push(defendingRegionNutsId);
            const unitsToMove = Math.max(1, Math.floor(attackingUnits * 0.5) - attackerLosses); // En az 1 birim aktar
            attackingCountry.regions[defendingRegionNutsId] = { units: unitsToMove };

            // Saldıran bölgeden birimleri azalt (aktarılanlar düşüldükten sonra kalan)
            attackingCountry.regions[attackingRegionNutsId].units -= unitsToMove;
            if (attackingCountry.regions[attackingRegionNutsId].units < 0) {
                attackingCountry.regions[attackingRegionNutsId].units = 0; // Negatif birim olmasın
            }
        }

    } else {
        // Savunan kazandı veya berabere (saldıran kaybeder)
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
    for (const countryId in countriesData) {
        if (countriesData.hasOwnProperty(countryId) && countryId !== playerCountryId && countriesData[countryId].nuts2.length > 0) {
            const option = document.createElement('option');
            option.value = countryId;
            option.textContent = countriesData[countryId].name;
            targetCountrySelect.appendChild(option);
        }
    }
}


function nextTurn() {
    currentTurn++;
    addNotification(`--- Tur ${currentTurn} başladı! ---`);

    // Oyuncu gelirini hesapla
    const player = countriesData[playerCountryId];
    const playerIncome = player.nuts2.length * INCOME_PER_REGION;
    player.coins += playerIncome;
    addNotification(`Ülkeniz ${playerIncome} coin gelir elde etti. Toplam coin: ${player.coins}`);

    // AI'ların hareketleri
    runAILogic();

    // Birim yerleştirme modunu kapat ve highlight'ları temizle
    countriesData[playerCountryId].unitsReady = 0; // Hazır birimleri sıfırla
    currentAttackMode = false;
    selectedAttackingRegionNutsId = null;
    targetCountryIdForWar = null;
    clearHighlights(); // Parlamaları kaldır
    addNotification("Saldırı modu kapatıldı.");

    updateUI();
}

function runAILogic() {
    const aiCountryIds = Object.keys(countriesData).filter(id => !countriesData[id].isPlayer && countriesData[id].nuts2.length > 0);

    // AI'ları rastgele sırada hareket ettir
    shuffleArray(aiCountryIds).forEach(aiId => {
        const aiCountry = countriesData[aiId];
        if (!aiCountry) return; // Ülke elenmiş olabilir

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
            const ownedRegionsWithUnits = aiCountry.nuts2.filter(nutsId => aiCountry.regions[nutsId] && aiCountry.regions[nutsId].units > 0);
            const targetRegionForPlacement = ownedRegionsWithUnits[Math.floor(Math.random() * ownedRegionsWithUnits.length)] || aiCountry.nuts2[Math.floor(Math.random() * aiCountry.nuts2.length)];

            if (targetRegionForPlacement) {
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
                        return getCountryIdFromNutsId(neighborNutsId) === targetCountryId && targetCountry.regions[neighborNutsId];
                    });

                    if (possibleDefendingRegions.length > 0) {
                        const defendingRegionNutsId = possibleDefendingRegions[Math.floor(Math.random() * possibleDefendingRegions.length)];

                        // Birim kontrolü: AI saldırıyı başlatmak için en az 1 birimi olmalı ve hedef bölgede birim olmalı
                        // Veya AI'nın birimi hedeften fazla olmalı (basit AI kuralı)
                        if (aiCountry.regions[attackingRegionNutsId].units > 0 && 
                            (targetCountry.regions[defendingRegionNutsId].units === 0 || aiCountry.regions[attackingRegionNutsId].units > targetCountry.regions[defendingRegionNutsId].units)) {
                            
                            addNotification(`${aiCountry.name} ülkesi, ${targetCountry.name} ülkesine savaş ilan etti!`);
                            resolveCombat(
                                aiId, attackingRegionNutsId, aiCountry.regions[attackingRegionNutsId].units,
                                targetCountryId, defendingRegionNutsId, targetCountry.regions[defendingRegionNutsId].units
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
closeWarModalButton.addEventListener('click', () => warModal.style.display = 'none');


// İlk yüklemede UI'ı gizle
document.addEventListener('DOMContentLoaded', () => {
    gameScreen.style.display = 'none';
    countrySelectionModal.style.display = 'none';
    warModal.style.display = 'none';
});

