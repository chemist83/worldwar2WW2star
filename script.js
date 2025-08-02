document.addEventListener('DOMContentLoaded', () => {
    // HTML elementlerine referanslar
    const startScreen = document.getElementById('start-screen');
    const playerNameInput = document.getElementById('playerNameInput');
    const startGameButton = document.getElementById('startGameButton');

    const countrySelectionScreen = document.getElementById('country-selection-screen');
    const countrySelect = document.getElementById('countrySelect');
    const selectCountryButton = document.getElementById('selectCountryButton');

    const gameScreen = document.getElementById('game-screen');
    const gameMapObject = document.getElementById('gameMap'); // SVG object etiketi
    const playerCountryNameSpan = document.getElementById('playerCountryName');
    const currentTurnSpan = document.getElementById('currentTurn');
    const nextTurnButton = document.getElementById('nextTurnButton');
    const notificationList = document.getElementById('notificationList');

    const targetCountrySelect = document.getElementById('targetCountrySelect');
    const declareWarButton = document.getElementById('declareWarButton');

    const playerCoinsSpan = document.getElementById('playerCoins');
    const playerUnitsSpan = document.getElementById('playerUnits');
    const buyUnitButton = document.getElementById('buyUnitButton');
    const unitPriceSpan = document.getElementById('unitPrice');

    // Savaş menüsü için yeni elementler
    const warModal = document.getElementById('warModal');
    const closeWarModalButton = document.getElementById('closeWarModal');
    const attackingRegionNameSpan = document.getElementById('attackingRegionName');
    const defendingRegionNameSpan = document.getElementById('defendingRegionName');
    const attackingUnitsSpan = document.getElementById('attackingUnits');
    const defendingUnitsSpan = document.getElementById('defendingUnits');
    const attackButton = document.getElementById('attackButton');

    // Oyun değişkenleri
    let playerName = '';
    let playerCountry = ''; // Örn: "UK"
    let currentTurn = 1;
    const UNIT_COST = 20; // Birim başına maliyet
    const INCOME_PER_REGION = 10; // Bölge başına gelir

    let selectedRegionForUnitPlacement = null; // Birim yerleştirmek için seçilen bölgeyi tutacak (NUTS ID)
    let nuts2RegionElements = {}; // data-nuts-id'ye göre SVG path elemanlarını tutacak
    let nuts2UnitTextElements = {}; // data-nuts-id'ye göre SVG text elemanlarını (birim sayıları) tutacak
    let territoryUnits = {}; // Her NUTS2 bölgesindeki birim sayısını tutacak yapı. Örn: { 'FRC1': 5, 'DE71': 3 }

    // Saldırı mekaniği için değişkenler
    let currentAttackingNutsId = null; // Oyuncunun saldıracağı NUTS ID
    let currentDefendingNutsId = null; // Oyuncunun saldıracağı düşman NUTS ID

    // ----------- ÜLKE VERİLERİ (countriesData) -----------
    // ÖNEMLİ: 'nuts2' dizilerine kendi map.svg dosyanızdaki data-nuts-id değerlerini YAZMALISINIZ!
    // Her ülkeye özel saldırı ikonu yolu eklendi (attackIconPath)
    // Sovyet bloğu ülkeleri aynı renge ayarlandı.
    let countriesData = {
        // Batı Avrupa
        'UK': {
            name: 'Birleşik Krallık',
            nuts2: ['UKI', 'UKD', 'UKJ', 'UKM', 'UKN', 'UKL', 'UKF', 'UKC', 'UKE', 'UKG', 'UKH', 'UKZZ'], // UKZZ bazen genel adadır
            isPlayer: false,
            color: '#19cf0c', // Yeşil
            coins: 100,
            units: 0,
            attackIconPath: 'icons/uk_attack_icon.png' // İkon yolu
        },
        'FR': {
            name: 'Fransa',
            nuts2: ['FR10', 'FRB0', 'FRC1', 'FRC2', 'FRC3', 'FRD1', 'FRD2', 'FRD3', 'FRE1', 'FRE2', 'FRE3', 'FRF1', 'FRF2', 'FRF3', 'FRG0', 'FRH0', 'FRI0', 'FRJ0', 'FRL0', 'FRM0', 'FRN0', 'FRP0'],
            isPlayer: false,
            color: '#947119', // Kahverengimsi
            coins: 100,
            units: 0,
            attackIconPath: 'icons/fr_attack_icon.png'
        },
        'DE': {
            name: 'Almanya',
            nuts2: ['DE11', 'DE12', 'DE13', 'DE14', 'DE21', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27', 'DE30', 'DE40', 'DE50', 'DE60', 'DE71', 'DE72', 'DE80', 'DE91', 'DE92', 'DE93', 'DE94', 'DEA1', 'DEA2', 'DEA3', 'DEA4', 'DEA5', 'DEB1', 'DEB2', 'DEB3', 'DEB4', 'DEC0', 'DED1', 'DED2', 'DED3', 'DED4', 'DEE0', 'DEF0', 'DEG0'],
            isPlayer: false,
            color: '#e0d253', // Açık Sarımsı
            coins: 100,
            units: 0,
            attackIconPath: 'icons/de_attack_icon.png' // Sizin verdiğiniz Almanya ikonu
        },
        'PT': {
            name: 'Portekiz',
            nuts2: ['PT11', 'PT15', 'PT16', 'PT17', 'PT18', 'PT20', 'PT30'],
            isPlayer: false,
            color: '#dc2ee6', // Morumsu Pembe
            coins: 100,
            units: 0,
            attackIconPath: 'icons/pt_attack_icon.png'
        },
        'ES': {
            name: 'İspanya',
            nuts2: ['ES11', 'ES12', 'ES13', 'ES21', 'ES22', 'ES23', 'ES24', 'ES30', 'ES41', 'ES42', 'ES43', 'ES51', 'ES52', 'ES53', 'ES61', 'ES62', 'ES63', 'ES70', 'ESZZ'],
            isPlayer: false,
            color: '#62d9d5', // Turkuaz
            coins: 100,
            units: 0,
            attackIconPath: 'icons/es_attack_icon.png'
        },
        'IT': {
            name: 'İtalya',
            nuts2: ['ITC1', 'ITC2', 'ITC3', 'ITC4', 'ITD1', 'ITD2', 'ITD3', 'ITD4', 'ITD5', 'ITE1', 'ITE2', 'ITE3', 'ITE4', 'ITF1', 'ITF2', 'ITF3', 'ITF4', 'ITF5', 'ITF6', 'ITG1', 'ITG2', 'ITH1', 'ITH2', 'ITH3', 'ITH4', 'ITH5', 'ITI1', 'ITI2', 'ITI3', 'ITI4', 'ITJ1', 'ITJ2', 'ITJ3', 'ITJ4'],
            isPlayer: false,
            color: '#9c9b6a', // Grimsi Yeşil
            coins: 100,
            units: 0,
            attackIconPath: 'icons/it_attack_icon.png'
        },
        'NL': { // Hollanda
            name: 'Hollanda',
            nuts2: ['NL11', 'NL12', 'NL13', 'NL21', 'NL22', 'NL23', 'NL31', 'NL32', 'NL33', 'NL34', 'NL41', 'NL42'],
            isPlayer: false,
            color: '#FFD700', // Altın Sarısı
            coins: 80,
            units: 0,
            attackIconPath: 'icons/nl_attack_icon.png'
        },
        'BE': { // Belçika
            name: 'Belçika',
            nuts2: ['BE10', 'BE21', 'BE22', 'BE23', 'BE24', 'BE25', 'BE31', 'BE32', 'BE33', 'BE34', 'BE35'],
            isPlayer: false,
            color: '#FFA500', // Turuncu
            coins: 80,
            units: 0,
            attackIconPath: 'icons/be_attack_icon.png'
        },
        'LU': { // Lüksemburg (Tek Topraklı)
            name: 'Lüksemburg',
            nuts2: ['LU00'],
            isPlayer: false,
            color: '#800080', // Mor
            coins: 30,
            units: 0,
            attackIconPath: 'icons/lu_attack_icon.png'
        },
        'AT': { // Avusturya
            name: 'Avusturya',
            nuts2: ['AT11', 'AT12', 'AT13', 'AT21', 'AT22', 'AT31', 'AT32', 'AT33', 'AT34'],
            isPlayer: false,
            color: '#FF4500', // Koyu Turuncu
            coins: 90,
            units: 0,
            attackIconPath: 'icons/at_attack_icon.png'
        },
        'CH': { // İsviçre
            name: 'İsviçre',
            nuts2: ['CH01', 'CH02', 'CH03', 'CH04', 'CH05', 'CH06', 'CH07'],
            isPlayer: false,
            color: '#DC143C', // Koyu Kırmızı
            coins: 90,
            units: 0,
            attackIconPath: 'icons/ch_attack_icon.png'
        },

        // İskandinavya ve Baltıklar
        'NO': { // Norveç
            name: 'Norveç',
            nuts2: ['NO01', 'NO02', 'NO03', 'NO04', 'NO05', 'NO06', 'NO07'],
            isPlayer: false,
            color: '#008080', // Teal
            coins: 80,
            units: 0,
            attackIconPath: 'icons/no_attack_icon.png'
        },
        'SE': { // İsveç
            name: 'İsveç',
            nuts2: ['SE11', 'SE12', 'SE21', 'SE22', 'SE23', 'SE31', 'SE32', 'SE33'],
            isPlayer: false,
            color: '#ADD8E6', // Açık Mavi
            coins: 80,
            units: 0,
            attackIconPath: 'icons/se_attack_icon.png'
        },
        'FI': { // Finlandiya
            name: 'Finlandiya',
            nuts2: ['FI19', 'FI1A', 'FI1B', 'FI1C', 'FI1D', 'FI20'],
            isPlayer: false,
            color: '#87CEEB', // Gök Mavisi
            coins: 70,
            units: 0,
            attackIconPath: 'icons/fi_attack_icon.png'
        },
        'DK': { // Danimarka
            name: 'Danimarka',
            nuts2: ['DK01', 'DK02', 'DK03', 'DK04', 'DK05'],
            isPlayer: false,
            color: '#FF6347', // Domates Kırmızısı
            coins: 60,
            units: 0,
            attackIconPath: 'icons/dk_attack_icon.png'
        },
        'IS': { // İzlanda
            name: 'İzlanda',
            nuts2: ['IS00'],
            isPlayer: false,
            color: '#6A5ACD', // Slate Blue
            coins: 40,
            units: 0,
            attackIconPath: 'icons/is_attack_icon.png'
        },
        'IE': { // İrlanda
            name: 'İrlanda',
            nuts2: ['IE04', 'IE05', 'IE06'],
            isPlayer: false,
            color: '#32CD32', // Lime Green
            coins: 70,
            units: 0,
            attackIconPath: 'icons/ie_attack_icon.png'
        },
        'EE': { // Estonya (Sovyet bloğu rengi)
            name: 'Estonya',
            nuts2: ['EE00'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 50,
            units: 0,
            attackIconPath: 'icons/ee_attack_icon.png'
        },
        'LV': { // Letonya (Sovyet bloğu rengi)
            name: 'Letonya',
            nuts2: ['LV00'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 50,
            units: 0,
            attackIconPath: 'icons/lv_attack_icon.png'
        },
        'LT': { // Litvanya (Sovyet bloğu rengi)
            name: 'Litvanya',
            nuts2: ['LT00'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 50,
            units: 0,
            attackIconPath: 'icons/lt_attack_icon.png'
        },

        // Doğu Avrupa ve Balkanlar
        'PL': { // Polonya
            name: 'Polonya',
            nuts2: ['PL21', 'PL22', 'PL41', 'PL42', 'PL43', 'PL51', 'PL52', 'PL61', 'PL62', 'PL63'],
            isPlayer: false,
            color: '#FF0000', // Kırmızı
            coins: 90,
            units: 0,
            attackIconPath: 'icons/pl_attack_icon.png'
        },
        'CZ': { // Çekya
            name: 'Çekya',
            nuts2: ['CZ01', 'CZ02', 'CZ03', 'CZ04', 'CZ05', 'CZ06', 'CZ07', 'CZ08'],
            isPlayer: false,
            color: '#B0C4DE', // Açık Çelik Mavisi
            coins: 70,
            units: 0,
            attackIconPath: 'icons/cz_attack_icon.png'
        },
        'SK': { // Slovakya
            name: 'Slovakya',
            nuts2: ['SK01', 'SK02', 'SK03', 'SK04'],
            isPlayer: false,
            color: '#4682B4', // Çelik Mavisi
            coins: 60,
            units: 0,
            attackIconPath: 'icons/sk_attack_icon.png'
        },
        'HU': { // Macaristan
            name: 'Macaristan',
            nuts2: ['HU10', 'HU21', 'HU22', 'HU31', 'HU32', 'HU33'],
            isPlayer: false,
            color: '#3CB371', // Medium Sea Green
            coins: 70,
            units: 0,
            attackIconPath: 'icons/hu_attack_icon.png'
        },
        // SI, HR, BA, RS, ME, MK kaldırıldı, Yugoslavya'ya dahil edildi.
        'GR': { // Yunanistan
            name: 'Yunanistan',
            nuts2: ['GR11', 'GR12', 'GR13', 'GR14', 'GR21', 'GR22', 'GR23', 'GR24', 'GR25', 'GR30', 'GR41', 'GR42', 'GR43'],
            isPlayer: false,
            color: '#00BFFF', // Derin Gök Mavisi
            coins: 80,
            units: 0,
            attackIconPath: 'icons/gr_attack_icon.png'
        },
        'TR': { // Türkiye
            name: 'Türkiye',
            nuts2: ['TR10', 'TR21', 'TR22', 'TR31', 'TR32', 'TR33', 'TR41', 'TR42', 'TR51', 'TR52', 'TR61', 'TR62', 'TR63', 'TR71', 'TR72', 'TR81', 'TR82', 'TR83', 'TR90', 'TRA1', 'TRA2', 'TRB1', 'TRB2', 'TRC1', 'TRC2', 'TRC3'],
            isPlayer: false,
            color: '#FF0000', // Kırmızı
            coins: 100,
            units: 0,
            attackIconPath: 'icons/tr_attack_icon.png'
        },
        'CY': { // Kıbrıs
            name: 'Kıbrıs',
            nuts2: ['CY00'],
            isPlayer: false,
            color: '#19cf0c', // UK ile aynı renk (daha önce böyleydi)
            coins: 20,
            units: 0,
            attackIconPath: 'icons/cy_attack_icon.png'
        },
        'RO': { // Romanya
            name: 'Romanya',
            nuts2: ['RO11', 'RO12', 'RO21', 'RO22', 'RO31', 'RO32', 'RO41', 'RO42'],
            isPlayer: false,
            color: '#FFFF00', // Sarı
            coins: 80,
            units: 0,
            attackIconPath: 'icons/ro_attack_icon.png'
        },
        'BG': { // Bulgaristan
            name: 'Bulgaristan',
            nuts2: ['BG31', 'BG32', 'BG33', 'BG34', 'BG41', 'BG42'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı
            coins: 70,
            units: 0,
            attackIconPath: 'icons/bg_attack_icon.png'
        },

        // Kuzey Afrika ve Ortadoğu
        'MA': { // Fas
            name: 'Fas',
            nuts2: ['MA'],
            isPlayer: false,
            color: '#8B0000',
            coins: 50,
            units: 0,
            attackIconPath: 'icons/ma_attack_icon.png'
        },
        'DZ': { // Cezayir
            name: 'Cezayir',
            nuts2: ['DZ'],
            isPlayer: false,
            color: '#006400',
            coins: 50,
            units: 0,
            attackIconPath: 'icons/dz_attack_icon.png'
        },
        'TN': { // Tunus
            name: 'Tunus',
            nuts2: ['TN'],
            isPlayer: false,
            color: '#BDB76B',
            coins: 40,
            units: 0,
            attackIconPath: 'icons/tn_attack_icon.png'
        },
        'LY': { // Libya
            name: 'Libya',
            nuts2: ['LY'],
            isPlayer: false,
            color: '#9c9b6a',
            coins: 50,
            units: 0,
            attackIconPath: 'icons/ly_attack_icon.png'
        },
        'EG': { // Mısır
            name: 'Mısır',
            nuts2: ['EG'],
            isPlayer: false,
            color: '#DAA520',
            coins: 60,
            units: 0,
            attackIconPath: 'icons/eg_attack_icon.png'
        },
        'SY': { // Suriye
            name: 'Suriye',
            nuts2: ['SY'],
            isPlayer: false,
            color: '#4682b4',
            coins: 50,
            units: 0,
            attackIconPath: 'icons/sy_attack_icon.png'
        },
        'LB': { // Lübnan
            name: 'Lübnan',
            nuts2: ['LB'],
            isPlayer: false,
            color: '#947119',
            coins: 20,
            units: 0,
            attackIconPath: 'icons/lb_attack_icon.png'
        },
        'IQ': { // Irak
            name: 'Irak',
            nuts2: ['IQ'],
            isPlayer: false,
            color: '#d2691e',
            coins: 50,
            units: 0,
            attackIconPath: 'icons/iq_attack_icon.png'
        },
        'IR': { // İran
            name: 'İran',
            nuts2: ['IR'],
            isPlayer: false,
            color: '#008000',
            coins: 70,
            units: 0,
            attackIconPath: 'icons/ir_attack_icon.png'
        },
        'SA': { // Suudi Arabistan
            name: 'Suudi Arabistan',
            nuts2: ['SA'],
            isPlayer: false,
            color: '#228B22',
            coins: 80,
            units: 0,
            attackIconPath: 'icons/sa_attack_icon.png'
        },
        'YE': { // Yemen
            name: 'Yemen',
            nuts2: ['YE'],
            isPlayer: false,
            color: '#7CFC00',
            coins: 30,
            units: 0,
            attackIconPath: 'icons/ye_attack_icon.png'
        },
        'OM': { // Umman
            name: 'Umman',
            nuts2: ['OM'],
            isPlayer: false,
            color: '#00CED1',
            coins: 40,
            units: 0,
            attackIconPath: 'icons/om_attack_icon.png'
        },
        'AE': { // Birleşik Arap Emirlikleri
            name: 'Birleşik Arap Emirlikleri',
            nuts2: ['AE'],
            isPlayer: false,
            color: '#8B4513',
            coins: 50,
            units: 0,
            attackIconPath: 'icons/ae_attack_icon.png'
        },
        'QA': { // Katar
            name: 'Katar',
            nuts2: ['QA'],
            isPlayer: false,
            color: '#FFDAB9',
            coins: 30,
            units: 0,
            attackIconPath: 'icons/qa_attack_icon.png'
        },
        'KW': { // Kuveyt
            name: 'Kuveyt',
            nuts2: ['KW'],
            isPlayer: false,
            color: '#FFFAF0',
            coins: 30,
            units: 0,
            attackIconPath: 'icons/kw_attack_icon.png'
        },
        'BH': { // Bahreyn
            name: 'Bahreyn',
            nuts2: ['BH'],
            isPlayer: false,
            color: '#F0E68C',
            coins: 30,
            units: 0,
            attackIconPath: 'icons/bh_attack_icon.png'
        },

        // Doğu Avrupa - Sovyet Bloğu (Aynı Renk)
        // Rusya için 'RU' kodu kullanıldı, NUTS2 listesi genişletildi.
        'RU': {
            name: 'Rusya',
            nuts2: ['RU-MOS', 'RU-SPE', 'RU-KGD', 'RU-LEN', 'RU-MUR', 'RU-ARK', 'RU-VLG', 'RU-NGR', 'RU-PSK', 'RU-TVE', 'RU-SMO', 'RU-BRY', 'RU-KLU', 'RU-ORL', 'RU-LIP', 'RU-TUL', 'RU-RYA', 'RU-VLA', 'RU-IVA', 'RU-KOS', 'RU-YAR', 'RU-TVL', 'RU-KDA', 'RU-ROS', 'RU-VGG', 'RU-AST', 'RU-DA', 'RU-CHE', 'RU-KAB', 'RU-KC', 'RU-AD', 'RU-ME', 'RU-KOS', 'RU-STV', 'RU-VOR', 'RU-TAM', 'RU-BEL', 'RU-KRS', 'RU-RYA', 'RU-NIZ', 'RU-PNZ', 'RU-SAM', 'RU-SAR', 'RU-ULY', 'RU-ORE', 'RU-PER', 'RU-KIR', 'RU-UD', 'RU-MOR', 'RU-CHU', 'RU-TA', 'RU-BA'], // Avrupa Rusya'sının tahmini bazı federal bölgeleri/oblastları
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 120,
            units: 0,
            attackIconPath: 'icons/ru_attack_icon.png'
        },
        'UA': { // Ukrayna (Sovyet bloğu rengi)
            name: 'Ukrayna',
            nuts2: ['UA11', 'UA12', 'UA13', 'UA14', 'UA15', 'UA16', 'UA17', 'UA18', 'UA19', 'UA20', 'UA21', 'UA22', 'UA23', 'UA24', 'UA25', 'UA26', 'UA27'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 90,
            units: 0,
            attackIconPath: 'icons/ua_attack_icon.png'
        },
        'BY': { // Belarus (Sovyet bloğu rengi)
            name: 'Belarus',
            nuts2: ['BY10', 'BY20', 'BY30', 'BY40', 'BY50', 'BY60', 'BY70'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 70,
            units: 0,
            attackIconPath: 'icons/by_attack_icon.png'
        },
        'MD': { // Moldova
            name: 'Moldova',
            nuts2: ['MD00'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 30,
            units: 0,
            attackIconPath: 'icons/md_attack_icon.png'
        },
        'GE': { // Gürcistan (Sovyet bloğu rengi)
            name: 'Gürcistan',
            nuts2: ['GE'], // Tahmini ID
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 40,
            units: 0,
            attackIconPath: 'icons/ge_attack_icon.png'
        },
        'AZ': { // Azerbaycan (Sovyet bloğu rengi)
            name: 'Azerbaycan',
            nuts2: ['AZ'], // Tahmini ID
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 40,
            units: 0,
            attackIconPath: 'icons/az_attack_icon.png'
        },
        'AM': { // Ermenistan (Sovyet bloğu rengi)
            name: 'Ermenistan',
            nuts2: ['AM'], // Tahmini ID
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 30,
            units: 0,
            attackIconPath: 'icons/am_attack_icon.png'
        },
        'KZ': { // Kazakistan (Sovyet bloğu rengi)
            name: 'Kazakistan',
            nuts2: ['KZ'], // Tahmini ID
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı (Sovyet rengi)
            coins: 80,
            units: 0,
            attackIconPath: 'icons/kz_attack_icon.png'
        },
        // YENİ: Yugoslavya eklendi
        'YU': {
            name: 'Yugoslavya',
            nuts2: [
                'SI03', 'SI04', // Slovenya
                'HR03', 'HR04', // Hırvatistan
                'BA', // Bosna-Hersek (Eğer haritanızda bu ID varsa kullanın)
                'RS', // Sırbistan (Eğer haritanızda bu ID varsa kullanın)
                'ME00', // Karadağ
                'MK00', // Kuzey Makedonya
                'XK' // Kosova (Eğer haritanızda varsa ve Yugoslavya'ya dahil edilecekse)
                // Kendi SVG haritanızdaki NUTS ID'lerini buraya eklediğinizden emin olun.
                // Eğer haritanızdaki ID'ler farklıysa, onları buraya doğru şekilde yazın.
            ],
            isPlayer: false,
            color: '#6A0DAD', // Koyu Mor (Yugoslavya için)
            coins: 150, // Birleşik bir devlet olarak daha fazla coin
            units: 0,
            attackIconPath: 'icons/yu_attack_icon.png' // Yugoslavya'ya özel ikon
        }
    };
    // --------------------------------------------------------------------------------------

    // NUTS2 Komşuluk Verisi
    // ÖNEMLİ: Burayı kendi haritanızdaki NUTS2 bölgelerinin komşuluklarına göre DOLDURMALISINIZ.
    // Özellikle Yugoslavya'nın iç ve dış komşuluklarını güncelleyin.
    const nutsNeighbors = {
        'TR63': ['TR62', 'SY', 'IQ'],
        'SY': ['TR63', 'IQ', 'LB', 'JO', 'SA'],
        'IQ': ['TR63', 'SY', 'IR', 'SA', 'KW', 'JO'],
        'EE00': ['LV00', 'RU-LEN'],
        'LV00': ['EE00', 'LT00', 'RU-PSK', 'BY10'],
        'LT00': ['LV00', 'PL21', 'BY20', 'RU-KGD'],
        'GR11': ['GR12', 'GR13', 'YU', 'MK00'], // Yunanistan'dan Yugoslavya'ya komşuluk
        'ITG2': ['ITG1', 'SI03', 'AT31'], // İtalya'dan SI03'e (artık YU'nun bir parçası)
        'FRC1': ['FRC2', 'DE60', 'LU00'],
        'AT34': ['AT12', 'AT13', 'AT31', 'SI03', 'HR03', 'HU10'], // Avusturya'dan Yugoslavya (SI, HR)
        'HU33': ['HU10', 'HU21', 'RO11', 'RO31', 'SK04', 'RS'], // Macaristan'dan Sırbistan'a (artık YU'nun bir parçası)
        'BG42': ['BG31', 'GR24', 'TR10', 'RO42', 'MK00', 'RS'], // Bulgaristan'dan Yugoslavya (MK, RS)
        'AL01': ['AL02', 'MK00', 'GR11', 'ME00', 'RS'], // Arnavutluk'tan Yugoslavya (MK, ME, RS)

        // Yugoslavya'nın iç komşulukları (eski ülkelerin birleşimi)
        // Önemli: Haritanızdaki gerçek komşuluklara göre burayı doğru doldurun!
        'SI03': ['SI04', 'HR03', 'AT34', 'ITG2'],
        'SI04': ['SI03', 'HR03', 'HR04', 'AT34'],
        'HR03': ['HR04', 'SI03', 'SI04', 'BA', 'RS', 'HU33'], // Örnek
        'HR04': ['HR03', 'BA', 'RS', 'ME00'],
        'BA': ['HR03', 'HR04', 'RS', 'ME00', 'MK00'], // Bosna-Hersek ve komşuları
        'RS': ['BA', 'HR03', 'HR04', 'ME00', 'MK00', 'HU33', 'RO42', 'BG42', 'AL01'], // Sırbistan ve komşuları
        'ME00': ['RS', 'BA', 'HR04', 'AL01'], // Karadağ ve komşuları
        'MK00': ['RS', 'BA', 'GR11', 'AL01', 'BG42', 'XK'], // Kuzey Makedonya ve komşuları
        'XK': ['MK00', 'RS', 'AL01'], // Kosova ve komşuları (eğer haritanızda ayrı bir ID ise)

        // ... buraya diğer tüm NUTS2 bölgelerinin komşularını eklemeniz gerekmektedir.
        // Komşuluk ilişkileri çift yönlü olmalıdır (A-B komşuysa, B-A da komşudur)
    };


    // --- Oyunu Başlat Ekranı ---
    startGameButton.addEventListener('click', () => {
        playerName = playerNameInput.value.trim();
        if (playerName) {
            startScreen.classList.remove('active');
            countrySelectionScreen.classList.add('active');
            populateCountrySelection();
        } else {
            addNotification('Lütfen bir kullanıcı adı girin!', 'error');
        }
    });

    // --- Ülke Seçim Ekranı ---
    function populateCountrySelection() {
        countrySelect.innerHTML = ''; // Önceki seçenekleri temizle
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Ülke Seçin';
        countrySelect.appendChild(defaultOption);

        for (const countryId in countriesData) {
            const option = document.createElement('option');
            option.value = countryId;
            option.textContent = countriesData[countryId].name;
            countrySelect.appendChild(option);
        }
    }

    selectCountryButton.addEventListener('click', () => {
        playerCountry = countrySelect.value;
        if (playerCountry) {
            countriesData[playerCountry].isPlayer = true;
            countriesData[playerCountry].coins = 160; // Oyuncuya 160 başlangıç coini ver
            playerCountryNameSpan.textContent = countriesData[playerCountry].name;
            countrySelectionScreen.classList.remove('active');
            gameScreen.classList.add('active');

            // Harita yüklendiğinde çalışacak fonksiyonu tetikle
            // Eğer SVG zaten yüklendiyse, load olayını manuel olarak tetikle
            if (gameMapObject.contentDocument && gameMapObject.contentDocument.documentElement && gameMapObject.contentDocument.documentElement.nodeName === 'svg') {
                gameMapObject.dispatchEvent(new Event('load'));
            } else {
                // Eğer henüz yüklenmediyse, load event listener'ı devreye girecektir.
            }

            populateTargetCountrySelection(); // Savaş ilan edilecek ülkeleri doldur
            updatePlayerStatsDisplay(); // Oyuncu istatistiklerini güncelle
            addNotification(`Oyuna hoş geldiniz, ${playerName}! ${countriesData[playerCountry].name} olarak başlıyorsunuz. Başlangıçta 160 coin'iniz var.`, 'info');
        } else {
            addNotification('Lütfen bir ülke seçin!', 'warning');
        }
    });

    // --- Oyun Haritası ve Mantığı ---

    // SVG yüklendiğinde çalışacak fonksiyon
    gameMapObject.addEventListener('load', () => {
        const svgDoc = gameMapObject.contentDocument; // SVG'ye erişim
        console.log("SVG Yüklendi! SVG Document:", svgDoc);

        // data-nuts-id özniteliğine sahip TÜM path'leri seç ve sakla
        const allNuts2Paths = svgDoc.querySelectorAll('path[data-nuts-id]');
        allNuts2Paths.forEach(path => {
            const nutsId = path.getAttribute('data-nuts-id');
            nuts2RegionElements[nutsId] = path; // Path elementini objemizde sakla

            // Her NUTS2 bölgesi için birim sayısı text elementi oluştur
            const textElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
            textElement.setAttribute("data-nuts-id", nutsId); // İlişkili olduğu NUTS ID'si
            textElement.setAttribute("text-anchor", "middle"); // Ortadan hizala
            textElement.setAttribute("alignment-baseline", "middle"); // Dikeyde ortala
            textElement.setAttribute("font-size", "10px");
            textElement.setAttribute("fill", "black"); // Metin rengi, harita renkleri üzerinde görünmesi için
            textElement.setAttribute("font-weight", "bold");
            textElement.style.pointerEvents = "none"; // Metin elementine tıklanmayı engelle, path'e tıklansın

            // Path'in merkezini bulup text'i oraya yerleştirme
            try {
                const bbox = path.getBBox(); // Path'in bounding box'ını al
                const centerX = bbox.x + bbox.width / 2;
                const centerY = bbox.y + bbox.height / 2;
                textElement.setAttribute("x", centerX);
                textElement.setAttribute("y", centerY);
            } catch (e) {
                console.warn(`Error getting bounding box for NUTS ID ${nutsId}:`, e);
                // Eğer getBBox hata verirse varsayılan bir konum belirle veya atla
                textElement.setAttribute("x", 0);
                textElement.setAttribute("y", 0);
            }


            // Tüm text elementlerini SVG'nin kök elementine veya uygun bir gruba ekle
            let textsGroup = svgDoc.getElementById('texts');
            if (!textsGroup) {
                textsGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
                textsGroup.setAttribute("id", "texts");
                svgDoc.documentElement.appendChild(textsGroup);
            }
            textsGroup.appendChild(textElement);
            nuts2UnitTextElements[nutsId] = textElement; // Referansını sakla

            // Birim sayısını başlangıçta sıfırla (eğer başka bir yerden yüklemiyorsak)
            territoryUnits[nutsId] = 0;

            // Her NUTS2 bölgesine tıklama olayı ekle (genel bilgi ve birim yerleştirme için)
            path.addEventListener('click', (event) => {
                const clickedNutsId = event.target.getAttribute('data-nuts-id');
                const ownerCountryId = getOwnerCountryId(clickedNutsId);

                if (ownerCountryId) {
                    addNotification(`Tıklanan bölge: ${clickedNutsId} (${countriesData[ownerCountryId].name})`, 'info');
                    // Birim yerleştirme modundaysak ve bölge oyuncununsa
                    if (selectedRegionForUnitPlacement && ownerCountryId === playerCountry) {
                        placeUnits(clickedNutsId); // Birimleri yerleştirme fonksiyonunu çağır
                    } else if (selectedRegionForUnitPlacement && ownerCountryId !== playerCountry) {
                        addNotification('Birimleri yalnızca kendi topraklarınıza yerleştirebilirsiniz!', 'error');
                    }
                } else {
                    addNotification(`Tıklanan bölge: ${clickedNutsId} (Sahipsiz veya Bilinmiyor)`, 'warning');
                }
            });
        });

        // Haritadaki tüm bölgeleri başlangıç renkleriyle boya
        applyCountryColorsToMap();
        updateUnitDisplays(); // Birim sayılarını haritada göster
    });

    // Bir NUTS ID'sinin hangi ülkeye ait olduğunu bulur
    function getOwnerCountryId(nutsId) {
        for (const countryId in countriesData) {
            if (countriesData[countryId] && countriesData[countryId].nuts2 && countriesData[countryId].nuts2.includes(nutsId)) {
                return countryId;
            }
        }
        return null;
    }

    // Haritadaki NUTS2 bölgelerine ülkelerin renklerini uygula
    function applyCountryColorsToMap() {
        for (const countryId in countriesData) {
            const countryInfo = countriesData[countryId];
            // Ülke hala var mı ve nuts2 tanımı var mı kontrol et
            if (countryInfo && countryInfo.nuts2) {
                countryInfo.nuts2.forEach(nutsId => {
                    const nutsPath = nuts2RegionElements[nutsId];
                    if (nutsPath) {
                        nutsPath.style.fill = countryInfo.color;
                        nutsPath.style.stroke = '#2c3e50'; // Sınır çizgisi
                        nutsPath.style.strokeWidth = '0.5px';

                        // Varsa saldırı ikonunu kaldır
                        removeAttackIcon(nutsId);
                    }
                });
            }
        }
    }

    // Birim sayılarını haritada güncelleyen fonksiyon
    function updateUnitDisplays() {
        for (const nutsId in nuts2UnitTextElements) {
            const textElement = nuts2UnitTextElements[nutsId];
            if (territoryUnits[nutsId] && territoryUnits[nutsId] > 0) {
                textElement.textContent = territoryUnits[nutsId];
            } else {
                textElement.textContent = ''; // Birim yoksa boş bırak
            }
        }
    }


    // --- Kontrol Paneli ve Oyun Mekanikleri ---

    // Oyuncu istatistiklerini güncelleyen fonksiyon
    function updatePlayerStatsDisplay() {
        const player = countriesData[playerCountry];
        if (player) {
            playerCoinsSpan.textContent = player.coins;
            playerUnitsSpan.textContent = player.units; // Toplam satın alınmış ama yerleştirilmemiş birim sayısı
            unitPriceSpan.textContent = UNIT_COST;
        }
    }

    // Savaş ilan edilecek ülkeler dropdown'ını doldur
    function populateTargetCountrySelection() {
        targetCountrySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Ülke Seçin';
        targetCountrySelect.appendChild(defaultOption);

        for (const countryId in countriesData) {
            if (countryId !== playerCountry) { // Oyuncunun kendisi hariç
                const option = document.createElement('option');
                option.value = countryId;
                option.textContent = countriesData[countryId].name;
                targetCountrySelect.appendChild(option);
            }
        }
    }

    // Savaş İlan Etme Butonu
    declareWarButton.addEventListener('click', () => {
        const targetCountryId = targetCountrySelect.value;

        if (!targetCountryId) {
            addNotification('Lütfen savaş ilan etmek istediğiniz ülkeyi seçin.', 'warning');
            return;
        }
        if (!countriesData[targetCountryId]) {
            addNotification('Hedef ülke bulunamadı veya oyundan silinmiş.', 'error');
            return;
        }

        const playerCountryName = countriesData[playerCountry].name;
        const targetCountryName = countriesData[targetCountryId].name;

        addNotification(`${playerCountryName} ülkesi, ${targetCountryName} ülkesine SAVAŞ İLAN ETTİ!`, 'danger');

        // Savaş ilan edilen ülkenin komşu NUTS2 bölgelerine saldırı ikonu yerleştir
        displayAttackIcons(targetCountryId);

        // Burada daha karmaşık savaş başlatma, diplomatik ilişkileri güncelleme vb. mantıklar eklenecek.
    });

    // NUTS2 bölgelerinin rengini savaş/çatışma durumuna göre değiştirme
    function changeNuts2ColorForConflict(nutsId, newColor, strokeColor) {
        const nutsPath = nuts2RegionElements[nutsId];
        if (nutsPath) {
            nutsPath.style.fill = newColor; // Doğrudan SVG elemanının rengini değiştir
            nutsPath.style.stroke = strokeColor; // Savaş hali için farklı kenar
            nutsPath.style.strokeWidth = '1.5px';
        }
    }

    // Saldırı ikonlarını göster
    function displayAttackIcons(targetCountryId) {
        const playerNuts = countriesData[playerCountry].nuts2;
        const targetNuts = countriesData[targetCountryId].nuts2;
        const svgDoc = gameMapObject.contentDocument;

        // Önceki tüm saldırı ikonlarını kaldır
        svgDoc.querySelectorAll('.attack-icon').forEach(icon => icon.remove());

        // Saldırı ikonları için bir grup oluştur
        let attackIconsGroup = svgDoc.getElementById('attack-icons');
        if (!attackIconsGroup) {
            attackIconsGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
            attackIconsGroup.setAttribute("id", "attack-icons");
            svgDoc.documentElement.appendChild(attackIconsGroup);
        }

        // Saldıran ülkenin ikonunu dinamik olarak belirle
        // Eğer saldıran ülke için özel bir ikon tanımlanmışsa onu kullan, yoksa genel bir ikon kullan.
        const attackerCountryData = countriesData[playerCountry];
        const attackerIconPath = (attackerCountryData && attackerCountryData.attackIconPath) ? attackerCountryData.attackIconPath : "icons/default_attack_icon.png"; // Varsayılan ikon yolu

        playerNuts.forEach(playerNutsId => {
            const playerNeighbors = nutsNeighbors[playerNutsId] || [];
            playerNeighbors.forEach(neighborNutsId => {
                // Eğer komşu, savaş ilan edilen ülkenin bir NUTS2 bölgesi ise
                if (targetNuts.includes(neighborNutsId)) {
                    // Komşu bölgenin merkezine bir saldırı ikonu yerleştir
                    const targetPath = nuts2RegionElements[neighborNutsId];
                    if (targetPath) {
                        try {
                            const bbox = targetPath.getBBox();
                            const centerX = bbox.x + bbox.width / 2;
                            const centerY = bbox.y + bbox.height / 2;

                            const iconSize = 25; // İkon boyutu
                            const icon = svgDoc.createElementNS("http://www.w3.org/2000/svg", "image");
                            icon.setAttribute("xlink:href", attackerIconPath); // DİNAMİK İKON YOLU BURADA KULLANILDI
                            icon.setAttribute("x", centerX - iconSize / 2);
                            icon.setAttribute("y", centerY - iconSize / 2);
                            icon.setAttribute("width", iconSize);
                            icon.setAttribute("height", iconSize);
                            icon.setAttribute("data-attacking-nuts-id", playerNutsId); // Saldıran bölge
                            icon.setAttribute("data-defending-nuts-id", neighborNutsId); // Savunan bölge
                            icon.classList.add('attack-icon');
                            icon.style.cursor = 'pointer';

                            icon.addEventListener('click', (event) => {
                                event.stopPropagation(); // Path tıklamasını engelle
                                openWarModal(event.target.getAttribute('data-attacking-nuts-id'), event.target.getAttribute('data-defending-nuts-id'));
                            });
                            attackIconsGroup.appendChild(icon);

                            // Savaş rengiyle boya
                            changeNuts2ColorForConflict(neighborNutsId, '#FFA07A', '#FF0000'); // Açık somon ve kırmızı kenar
                        } catch (e) {
                            console.warn(`Error placing attack icon for NUTS ID ${neighborNutsId}:`, e);
                        }
                    }
                }
            });
        });
        addNotification('Savaş ilan edilen ülkenin komşu bölgelerine saldırı ikonları yerleştirildi. Saldırmak istediğiniz bir bölgedeki ikona tıklayın.', 'info');
    }

    // Saldırı ikonunu kaldır
    function removeAttackIcon(nutsId) {
        const svgDoc = gameMapObject.contentDocument;
        const icon = svgDoc.querySelector(`.attack-icon[data-defending-nuts-id="${nutsId}"]`);
        if (icon) {
            icon.remove();
        }
    }


    // Birim Satın Alma Butonu
    buyUnitButton.addEventListener('click', () => {
        const player = countriesData[playerCountry];
        if (player.coins >= UNIT_COST) {
            player.coins -= UNIT_COST;
            player.units += 1; // Toplam satın alınmış ama yerleştirilmemiş birim sayısı
            updatePlayerStatsDisplay();
            addNotification(`1 birim satın alındı. Kalan coin: ${player.coins}`, 'info');

            selectedRegionForUnitPlacement = true; // Birim yerleştirme modunu aktif et
            addNotification('Lütfen birim yerleştirmek istediğiniz bir bölgeye tıklayın. (Sadece kendi bölgeleriniz)', 'warning');
        } else {
            addNotification('Yeterli coin yok! Birim satın almak için 20 coin gerekir.', 'error');
        }
    });

    // Birim yerleştirme fonksiyonu
    function placeUnits(nutsId) {
        const player = countriesData[playerCountry];
        // Tıklanan bölgenin oyuncuya ait olup olmadığını kontrol et
        if (countriesData[playerCountry] && countriesData[playerCountry].nuts2 && countriesData[playerCountry].nuts2.includes(nutsId)) {
            if (player.units > 0) { // Oyuncunun yerleştirilebilir birimi varsa
                territoryUnits[nutsId] = (territoryUnits[nutsId] || 0) + 1; // Bölgeye 1 birim ekle
                player.units -= 1; // Oyuncunun toplam yerleştirilebilir biriminden düş

                updateUnitDisplays(); // Haritadaki birim sayılarını güncelle
                updatePlayerStatsDisplay(); // Kontrol panelindeki sayıları güncelle
                addNotification(`${nutsId} bölgesine 1 birim yerleştirildi. Kalan yerleştirilebilir birim: ${player.units}`, 'info');

                if (player.units === 0) {
                    selectedRegionForUnitPlacement = null; // Birim kalmadı, yerleştirme modunu kapat
                    addNotification('Tüm birimleriniz yerleştirildi. Artık birim satın alana kadar bölge seçilemez.', 'info');
                }
            } else {
                addNotification('Yerleştirilecek biriminiz kalmadı. Önce birim satın alın.', 'warning');
                selectedRegionForUnitPlacement = null; // Modu kapat
            }
        } else {
            addNotification('Yalnızca kendi topraklarınıza birim yerleştirebilirsiniz!', 'error');
        }
    }

    // Savaş Menüsü Açma
    function openWarModal(attackingNutsId, defendingNutsId) {
        currentAttackingNutsId = attackingNutsId;
        currentDefendingNutsId = defendingNutsId;

        const attackingUnits = territoryUnits[attackingNutsId] || 0;
        const defendingUnits = territoryUnits[defendingNutsId] || 0;

        attackingRegionNameSpan.textContent = attackingNutsId;
        defendingRegionNameSpan.textContent = defendingNutsId;
        attackingUnitsSpan.textContent = attackingUnits;
        defendingUnitsSpan.textContent = defendingUnits;

        warModal.style.display = 'block'; // Modalı göster
    }

    // Savaş Menüsü Kapatma
    closeWarModalButton.addEventListener('click', () => {
        warModal.style.display = 'none';
        currentAttackingNutsId = null;
        currentDefendingNutsId = null;
        applyCountryColorsToMap(); // Savaş bitince renkleri normale döndür
    });

    // Saldırı Butonu (Savaş Menüsü İçinde)
    attackButton.addEventListener('click', () => {
        if (!currentAttackingNutsId || !currentDefendingNutsId) {
            addNotification('Saldırı için geçerli bölgeler seçilmedi.', 'error');
            return;
        }

        const attackingUnits = territoryUnits[currentAttackingNutsId] || 0;
        const defendingUnits = territoryUnits[currentDefendingNutsId] || 0;

        if (attackingUnits === 0) {
            addNotification('Saldıran bölgede biriminiz yok, saldıramazsınız!', 'error');
            return;
        }

        const playerCountryObj = countriesData[playerCountry];
        const defenderCountryId = getOwnerCountryId(currentDefendingNutsId);
        const defenderCountryObj = countriesData[defenderCountryId];

        addNotification(`${playerCountryObj.name} (${currentAttackingNutsId} - ${attackingUnits} birim) -> ${defenderCountryObj.name} (${currentDefendingNutsId} - ${defendingUnits} birim) saldırıyor!`, 'info');

        if (attackingUnits > defendingUnits) {
            // Oyuncu kazanır
            addNotification(`${playerCountryObj.name} ülkesi ${currentDefendingNutsId} bölgesini FETHETTİ!`, 'success');

            // Bölge sahipliğini değiştir
            // Eski sahibinden bölgeyi çıkar
            if (defenderCountryObj && defenderCountryObj.nuts2) {
                defenderCountryObj.nuts2 = defenderCountryObj.nuts2.filter(id => id !== currentDefendingNutsId);
            }
            // Oyuncuya bölgeyi ekle
            playerCountryObj.nuts2.push(currentDefendingNutsId);

            // Birim transferi: Saldıran birimlerin bir kısmı kaybedilir, kalanı yeni bölgeye geçer
            const remainingUnits = attackingUnits - Math.floor(defendingUnits / 2); // Örneğin, savunandaki birimlerin yarısı kadar kayıp
            territoryUnits[currentAttackingNutsId] = Math.max(0, remainingUnits - 1); // Saldıran bölgede 1 birim kalır
            territoryUnits[currentDefendingNutsId] = Math.max(0, remainingUnits); // Fethedilen bölgeye aktarılır

            // Eğer savunan ülkenin hiç bölgesi kalmadıysa, oyundan sil
            if (defenderCountryObj && defenderCountryObj.nuts2.length === 0) {
                addNotification(`${defenderCountryObj.name} ülkesi oyundan silindi!`, 'warning');
                delete countriesData[defenderCountryId];
                populateTargetCountrySelection(); // Hedef listesini güncelle
            }

        } else if (attackingUnits <= defendingUnits) {
            // Savunan kazanır (veya berabere)
            addNotification(`Saldırı BAŞARISIZ OLDU! ${defenderCountryObj.name} ülkesi ${currentDefendingNutsId} bölgesini savundu.`, 'error');

            // Saldıran birimlerin bir kısmını kaybet
            territoryUnits[currentAttackingNutsId] = Math.max(0, attackingUnits - Math.floor(defendingUnits / 2)); // Örneğin, savunandaki birimlerin yarısı kadar kayıp

            // Savunan birimler de bir miktar kayıp yaşayabilir (isteğe bağlı)
            territoryUnits[currentDefendingNutsId] = Math.max(0, defendingUnits - Math.floor(attackingUnits / 2));
        }

        updatePlayerStatsDisplay();
        updateUnitDisplays(); // Haritadaki birim sayılarını güncelle
        applyCountryColorsToMap(); // Renkleri güncelle

        warModal.style.display = 'none'; // Modalı kapat
        currentAttackingNutsId = null;
        currentDefendingNutsId = null;
    });


    // --- Tur Atlama Mantığı ---
    nextTurnButton.addEventListener('click', () => {
        currentTurn++;
        currentTurnSpan.textContent = currentTurn;

        // Oyuncu geliri hesapla
        let playerRegionCount = 0;
        if (countriesData[playerCountry] && countriesData[playerCountry].nuts2) {
            playerRegionCount = countriesData[playerCountry].nuts2.length;
        }
        const playerIncome = playerRegionCount * INCOME_PER_REGION;
        countriesData[playerCountry].coins += playerIncome;
        addNotification(`${countriesData[playerCountry].name} bu tur ${playerIncome} coin kazandı. Toplam coin: ${countriesData[playerCountry].coins}`, 'info');

        // AI geliri hesapla
        for (const countryId in countriesData) {
            if (countryId !== playerCountry) { // Oyuncu dışındaki ülkeler
                const aiCountry = countriesData[countryId];
                if (aiCountry && aiCountry.nuts2) { // Ülke hala var mı kontrol et
                    const aiRegionCount = aiCountry.nuts2.length;
                    const aiIncome = aiRegionCount * INCOME_PER_REGION;
                    aiCountry.coins += aiIncome;
                }
            }
        }

        updatePlayerStatsDisplay(); // Oyuncu istatistiklerini güncelle (AI'larınki panlde gözükmez)

        addNotification(`Yeni tur başladı: Tur ${currentTurn}`, 'info');
        runAILogic(); // AI mantığını çalıştır
        applyCountryColorsToMap(); // AI kararlarından veya tur olaylarından sonra harita renklerini güncelle
        updateUnitDisplays(); // Birim sayılarını güncelle
    });

    // --- AI Kontrolü (Basit Saldırı ve Fetih Örneği) ---
    function runAILogic() {
        const WAR_CHANCE_BASE = 0.15; // AI'nın savaş ilan etme temel şansı
        const CONQUER_CHANCE_PER_UNIT_ADVANTAGE = 0.05; // Birim avantajına göre fetih şansı artışı

        // AI'ların saldırı sırasını rastgele karıştır (aynı anda saldırmamaları için)
        const aiCountryIds = Object.keys(countriesData).filter(id => !countriesData[id].isPlayer);
        aiCountryIds.sort(() => Math.random() - 0.5); // Rastgele sırala

        aiCountryIds.forEach(countryId => {
            const aiCountry = countriesData[countryId];
            if (!aiCountry || aiCountry.nuts2.length === 0) return; // Ülke daha önce silinmiş veya toprağı yoksa devam etme

            // AI birim satın alabilir (her 3 turda bir 1 birim alır ve yeterli coini varsa)
            if (currentTurn % 3 === 0 && aiCountry.coins >= UNIT_COST) {
                aiCountry.coins -= UNIT_COST;
                aiCountry.units += 1; // Satın alınan birimler, birim havuzuna eklenir
                addNotification(`${aiCountry.name} 1 birim satın aldı.`, 'info');

                // Satın alınan birimi rastgele kendi toprağına yerleştir
                if (aiCountry.nuts2.length > 0) {
                    const randomRegion = aiCountry.nuts2[Math.floor(Math.random() * aiCountry.nuts2.length)];
                    territoryUnits[randomRegion] = (territoryUnits[randomRegion] || 0) + 1;
                    aiCountry.units -= 1; // Birim havuzundan düş (eğer oyuncuda olduğu gibi bir havuzdan geliyorsa)
                    addNotification(`${aiCountry.name}, ${randomRegion} bölgesine 1 birim yerleştirdi.`, 'info');
                }
            }

            // Basit AI davranışı: rastgele başka bir ülkeye saldır
            if (Math.random() < WAR_CHANCE_BASE && Object.keys(countriesData).length > 1) {
                const potentialTargets = Object.keys(countriesData).filter(id => id !== countryId && countriesData[id] && countriesData[id].nuts2 && countriesData[id].nuts2.length > 0); // Kendisi dışındaki ve bölgesi olan tüm ülkeler
                if (potentialTargets.length === 0) return; // Hedef yoksa devam etme

                const targetCountryId = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                const targetCountry = countriesData[targetCountryId];

                if (!targetCountry || targetCountry.nuts2.length === 0) return; // Hedef ülke oyundan silinmiş veya toprağı yoksa devam etme

                // AI sadece komşu bölgelere saldırabilir
                let aiBorderRegions = aiCountry.nuts2.filter(nutsId => nutsNeighbors[nutsId] && nutsNeighbors[nutsId].some(neighbor => targetCountry.nuts2.includes(neighbor)));

                if (aiBorderRegions.length === 0) {
                    // addNotification(`${aiCountry.name} ülkesinin ${targetCountry.name} ülkesiyle komşu bölgesi yok, saldıramadı.`, 'info');
                    return; // Komşu bölge yoksa saldırma
                }

                const attackingRegionNutsId = aiBorderRegions[Math.floor(Math.random() * aiBorderRegions.length)];
                const potentialDefendingRegions = nutsNeighbors[attackingRegionNutsId].filter(neighbor => targetCountry.nuts2.includes(neighbor));
                if (potentialDefendingRegions.length === 0) return; // Saldırı için uygun savunma bölgesi yoksa

                const defendingRegionNutsId = potentialDefendingRegions[Math.floor(Math.random() * potentialDefendingRegions.length)];

                // Savaş ilanı
                if (targetCountryId === playerCountry) {
                    addNotification(`${aiCountry.name} ülkesi, size (${playerCountryNameSpan.textContent}) savaş ilan etti!`, 'danger');
                } else {
                    addNotification(`${aiCountry.name} ülkesi, ${targetCountry.name} ülkesine savaş ilan etti!`, 'danger');
                }

                // Savaş ilan edilen ülkenin NUTS2 bölgelerinin rengini değiştir
                changeNuts2ColorForConflict(defendingRegionNutsId, 'darkred', 'yellow'); // Savaş rengi

                // Savaş sonucu: Birim farkına göre basit fetih mantığı
                const aiAttackingUnits = territoryUnits[attackingRegionNutsId] || 0;
                const targetDefendingUnits = territoryUnits[defendingRegionNutsId] || 0;

                if (aiAttackingUnits === 0) {
                    addNotification(`${aiCountry.name} saldıracağı bölgede birimi olmadığı için saldıramadı.`, 'info');
                    applyCountryColorsToMap(); // Eski renklerine döner
                    return;
                }

                if (aiAttackingUnits > targetDefendingUnits) {
                    // AI kazanır
                    addNotification(`${aiCountry.name} ülkesi, ${targetCountry.name} ülkesinden ${defendingRegionNutsId} bölgesini FETHETTİ!`, 'success');

                    // Bölge sahipliğini değiştir
                    targetCountry.nuts2 = targetCountry.nuts2.filter(nutsId => nutsId !== defendingRegionNutsId);
                    aiCountry.nuts2.push(defendingRegionNutsId);

                    // Birim transferi: Kazanan birimlerin bir kısmı kaybedilir, kalanı yeni bölgeye geçer
                    const remainingUnits = aiAttackingUnits - Math.floor(targetDefendingUnits / 2);
                    territoryUnits[attackingRegionNutsId] = Math.max(0, remainingUnits - 1); // Saldıran bölgede 1 birim kalır
                    territoryUnits[defendingRegionNutsId] = Math.max(0, remainingUnits); // Fethedilen bölgeye aktarılır

                    // Eğer hedef ülkenin hiç bölgesi kalmadıysa, yok et
                    if (targetCountry.nuts2.length === 0) {
                        addNotification(`${targetCountry.name} ül
