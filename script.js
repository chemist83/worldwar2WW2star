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
    // Renkleri siz dolduracaksınız.
    let countriesData = {
        // Batı Avrupa
        'UK': {
            name: 'Birleşik Krallık',
            nuts2: ['UKI', 'UKD', 'UKJ', 'UKM', 'UKN', 'UKL', 'UKF', 'UKC', 'UKE', 'UKG', 'UKH', 'UKZZ'], // UKZZ bazen genel adadır
            isPlayer: false,
            color: '#19cf0c', // Yeşil
            coins: 100,
            units: 0
        },
        'FR': {
            name: 'Fransa',
            nuts2: ['FR10', 'FRB0', 'FRC1', 'FRC2', 'FRC3', 'FRD1', 'FRD2', 'FRD3', 'FRE1', 'FRE2', 'FRE3', 'FRF1', 'FRF2', 'FRF3', 'FRG0', 'FRH0', 'FRI0', 'FRJ0', 'FRL0', 'FRM0', 'FRN0', 'FRP0'], // FRK0, FRJ0 eksikse ekleyin
            isPlayer: false,
            color: '#947119', // Kahverengimsi
            coins: 100,
            units: 0
        },
        'DE': {
            name: 'Almanya',
            nuts2: ['DE11', 'DE12', 'DE13', 'DE14', 'DE21', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27', 'DE30', 'DE40', 'DE50', 'DE60', 'DE71', 'DE72', 'DE80', 'DE91', 'DE92', 'DE93', 'DE94', 'DEA1', 'DEA2', 'DEA3', 'DEA4', 'DEA5', 'DEB1', 'DEB2', 'DEB3', 'DEB4', 'DEC0', 'DED1', 'DED2', 'DED3', 'DED4', 'DEE0', 'DEF0', 'DEG0'],
            isPlayer: false,
            color: '#e0d253', // Açık Sarımsı
            coins: 100,
            units: 0
        },
        'PT': {
            name: 'Portekiz',
            nuts2: ['PT11', 'PT15', 'PT16', 'PT17', 'PT18', 'PT20', 'PT30'],
            isPlayer: false,
            color: '#dc2ee6', // Morumsu Pembe
            coins: 100,
            units: 0
        },
        'ES': {
            name: 'İspanya',
            nuts2: ['ES11', 'ES12', 'ES13', 'ES21', 'ES22', 'ES23', 'ES24', 'ES30', 'ES41', 'ES42', 'ES43', 'ES51', 'ES52', 'ES53', 'ES61', 'ES62', 'ES63', 'ES70', 'ESZZ'], // ESZZ bazen genel adadır
            isPlayer: false,
            color: '#62d9d5', // Turkuaz
            coins: 100,
            units: 0
        },
        'IT': {
            name: 'İtalya',
            nuts2: ['ITC1', 'ITC2', 'ITC3', 'ITC4', 'ITD1', 'ITD2', 'ITD3', 'ITD4', 'ITD5', 'ITE1', 'ITE2', 'ITE3', 'ITE4', 'ITF1', 'ITF2', 'ITF3', 'ITF4', 'ITF5', 'ITF6', 'ITG1', 'ITG2', 'ITH1', 'ITH2', 'ITH3', 'ITH4', 'ITH5', 'ITI1', 'ITI2', 'ITI3', 'ITI4', 'ITJ1', 'ITJ2', 'ITJ3', 'ITJ4'],
            isPlayer: false,
            color: '#9c9b6a', // Grimsi Yeşil
            coins: 100,
            units: 0
        },
        'NL': { // Hollanda
            name: 'Hollanda',
            nuts2: ['NL11', 'NL12', 'NL13', 'NL21', 'NL22', 'NL23', 'NL31', 'NL32', 'NL33', 'NL34', 'NL41', 'NL42'],
            isPlayer: false,
            color: '#FFD700', // Altın Sarısı
            coins: 80,
            units: 0
        },
        'BE': { // Belçika
            name: 'Belçika',
            nuts2: ['BE10', 'BE21', 'BE22', 'BE23', 'BE24', 'BE25', 'BE31', 'BE32', 'BE33', 'BE34', 'BE35'],
            isPlayer: false,
            color: '#FFA500', // Turuncu
            coins: 80,
            units: 0
        },
        'LU': { // Lüksemburg (Tek Topraklı)
            name: 'Lüksemburg',
            nuts2: ['LU00'], // Lüksemburg NUTS2 kodu
            isPlayer: false,
            color: '#800080', // Mor
            coins: 30,
            units: 0
        },
        'AT': { // Avusturya
            name: 'Avusturya',
            nuts2: ['AT11', 'AT12', 'AT13', 'AT21', 'AT22', 'AT31', 'AT32', 'AT33', 'AT34'],
            isPlayer: false,
            color: '#FF4500', // Koyu Turuncu
            coins: 90,
            units: 0
        },
        'CH': { // İsviçre (NUTS'a dahil değil, ama genellikle coğrafi bölgelere ayrılır)
            name: 'İsviçre',
            nuts2: ['CH01', 'CH02', 'CH03', 'CH04', 'CH05', 'CH06', 'CH07'], // Tahmini bölgeler
            isPlayer: false,
            color: '#DC143C', // Koyu Kırmızı
            coins: 90,
            units: 0
        },

        // İskandinavya ve Baltıklar
        'NO': { // Norveç
            name: 'Norveç',
            nuts2: ['NO01', 'NO02', 'NO03', 'NO04', 'NO05', 'NO06', 'NO07'], // Tahmini NUTS2 benzeri bölgeler
            isPlayer: false,
            color: '#008080', // Teal
            coins: 80,
            units: 0
        },
        'SE': { // İsveç
            name: 'İsveç',
            nuts2: ['SE11', 'SE12', 'SE21', 'SE22', 'SE23', 'SE31', 'SE32', 'SE33'],
            isPlayer: false,
            color: '#ADD8E6', // Açık Mavi
            coins: 80,
            units: 0
        },
        'FI': { // Finlandiya
            name: 'Finlandiya',
            nuts2: ['FI19', 'FI1A', 'FI1B', 'FI1C', 'FI1D', 'FI20'],
            isPlayer: false,
            color: '#87CEEB', // Gök Mavisi
            coins: 70,
            units: 0
        },
        'DK': { // Danimarka (Tek Topraklı olabilir veya birkaç NUTS2)
            name: 'Danimarka',
            nuts2: ['DK01', 'DK02', 'DK03', 'DK04', 'DK05'], // Danimarka NUTS2
            isPlayer: false,
            color: '#FF6347', // Domates Kırmızısı
            coins: 60,
            units: 0
        },
        'IS': { // İzlanda (Tek Topraklı)
            name: 'İzlanda',
            nuts2: ['IS00'], // İzlanda NUTS2 kodu
            isPlayer: false,
            color: '#6A5ACD', // Slate Blue
            coins: 40,
            units: 0
        },
        'IE': { // İrlanda (Tek Topraklı veya birkaç NUTS2)
            name: 'İrlanda',
            nuts2: ['IE04', 'IE05', 'IE06'], // İrlanda NUTS2 kodları
            isPlayer: false,
            color: '#32CD32', // Lime Green
            coins: 70,
            units: 0
        },
        'EE': { // Estonya (Tek Topraklı)
            name: 'Estonya',
            nuts2: ['EE00'], // Estonya NUTS2 kodu
            isPlayer: false,
            color: '#346369', // Sizin verdiğiniz renk
            coins: 50,
            units: 0
        },
        'LV': { // Letonya (Tek Topraklı)
            name: 'Letonya',
            nuts2: ['LV00'], // Letonya NUTS2 kodu
            isPlayer: false,
            color: '#4a398f', // Sizin verdiğiniz renk
            coins: 50,
            units: 0
        },
        'LT': { // Litvanya (Tek Topraklı)
            name: 'Litvanya',
            nuts2: ['LT00'], // Litvanya NUTS2 kodu
            isPlayer: false,
            color: '#4e6644', // Sizin verdiğiniz renk
            coins: 50,
            units: 0
        },

        // Doğu Avrupa ve Balkanlar
        'PL': { // Polonya
            name: 'Polonya',
            nuts2: ['PL21', 'PL22', 'PL41', 'PL42', 'PL43', 'PL51', 'PL52', 'PL61', 'PL62', 'PL63'],
            isPlayer: false,
            color: '#FF0000', // Kırmızı
            coins: 90,
            units: 0
        },
        'CZ': { // Çekya
            name: 'Çekya',
            nuts2: ['CZ01', 'CZ02', 'CZ03', 'CZ04', 'CZ05', 'CZ06', 'CZ07', 'CZ08'],
            isPlayer: false,
            color: '#B0C4DE', // Açık Çelik Mavisi
            coins: 70,
            units: 0
        },
        'SK': { // Slovakya
            name: 'Slovakya',
            nuts2: ['SK01', 'SK02', 'SK03', 'SK04'],
            isPlayer: false,
            color: '#4682B4', // Çelik Mavisi
            coins: 60,
            units: 0
        },
        'HU': { // Macaristan
            name: 'Macaristan',
            nuts2: ['HU10', 'HU21', 'HU22', 'HU31', 'HU32', 'HU33'],
            isPlayer: false,
            color: '#3CB371', // Medium Sea Green
            coins: 70,
            units: 0
        },
        'SI': { // Slovenya (Tek Topraklı olabilir veya iki NUTS2)
            name: 'Slovenya',
            nuts2: ['SI03', 'SI04'], // Slovenya NUTS2 kodları
            isPlayer: false,
            color: '#8A2BE2', // Mavi Menekşe
            coins: 50,
            units: 0
        },
        'HR': { // Hırvatistan (Tek Topraklı olabilir veya birkaç NUTS2)
            name: 'Hırvatistan',
            nuts2: ['HR03', 'HR04'], // Hırvatistan NUTS2 kodları
            isPlayer: false,
            color: '#B22222', // Ateş Tuğlası
            coins: 60,
            units: 0
        },
        'BA': { // Bosna-Hersek (NUTS'a dahil değil, genellikle tek topraklı)
            name: 'Bosna-Hersek',
            nuts2: ['BA'], // Tahmini ID
            isPlayer: false,
            color: '#5F9EA0', // Cadet Blue
            coins: 40,
            units: 0
        },
        'RS': { // Sırbistan (NUTS'a dahil değil, genellikle tek topraklı veya birkaç bölge)
            name: 'Sırbistan',
            nuts2: ['RS'], // Tahmini ID
            isPlayer: false,
            color: '#DDA0DD', // Erik Moru
            coins: 50,
            units: 0
        },
        'ME': { // Karadağ (Tek Topraklı)
            name: 'Karadağ',
            nuts2: ['ME00'], // Tahmini ID
            isPlayer: false,
            color: '#6B8E23', // Olive Drab
            coins: 30,
            units: 0
        },
        'AL': { // Arnavutluk (Tek Topraklı veya birkaç bölge)
            name: 'Arnavutluk',
            nuts2: ['AL01', 'AL02', 'AL03'], // Arnavutluk NUTS2
            isPlayer: false,
            color: '#CD853F', // Peru
            coins: 40,
            units: 0
        },
        'MK': { // Kuzey Makedonya (Tek Topraklı)
            name: 'Kuzey Makedonya',
            nuts2: ['MK00'], // Tahmini ID
            isPlayer: false,
            color: '#A9A9A9', // Koyu Gri
            coins: 30,
            units: 0
        },
        'GR': { // Yunanistan (Özel İstek: GR olarak!)
            name: 'Yunanistan',
            nuts2: ['GR11', 'GR12', 'GR13', 'GR14', 'GR21', 'GR22', 'GR23', 'GR24', 'GR25', 'GR30', 'GR41', 'GR42', 'GR43'],
            isPlayer: false,
            color: '#00BFFF', // Derin Gök Mavisi
            coins: 80,
            units: 0
        },
        'TR': { // Türkiye
            name: 'Türkiye',
            nuts2: ['TR10', 'TR21', 'TR22', 'TR31', 'TR32', 'TR33', 'TR41', 'TR42', 'TR51', 'TR52', 'TR61', 'TR62', 'TR63', 'TR71', 'TR72', 'TR81', 'TR82', 'TR83', 'TR90', 'TRA1', 'TRA2', 'TRB1', 'TRB2', 'TRC1', 'TRC2', 'TRC3'],
            isPlayer: false,
            color: '#FF0000', // Kırmızı
            coins: 100,
            units: 0
        },
        'CY': { // Kıbrıs (Tek Topraklı)
            name: 'Kıbrıs',
            nuts2: ['CY00'], // Kıbrıs NUTS2 kodu
            isPlayer: false,
            color: '#19cf0c', // UK ile aynı renk (daha önce böyleydi)
            coins: 20,
            units: 0
        },
        'RO': { // Romanya
            name: 'Romanya',
            nuts2: ['RO11', 'RO12', 'RO21', 'RO22', 'RO31', 'RO32', 'RO41', 'RO42'],
            isPlayer: false,
            color: '#FFFF00', // Sarı
            coins: 80,
            units: 0
        },
        'BG': { // Bulgaristan
            name: 'Bulgaristan',
            nuts2: ['BG31', 'BG32', 'BG33', 'BG34', 'BG41', 'BG42'],
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı
            coins: 70,
            units: 0
        },

        // Kuzey Afrika ve Ortadoğu (Genellikle tek topraklı veya NUTS'a dahil değil)
        'MA': { // Fas (Sizin kodunuzda 'MAR' idi, burada standart ISO kodunu kullandım, SVG'nizi kontrol edin)
            name: 'Fas',
            nuts2: ['MA'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı
            coins: 50,
            units: 0
        },
        'DZ': { // Cezayir (Sizin kodunuzda 'DZA' idi)
            name: 'Cezayir',
            nuts2: ['DZ'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#006400', // Koyu Yeşil
            coins: 50,
            units: 0
        },
        'TN': { // Tunus (Tek Topraklı)
            name: 'Tunus',
            nuts2: ['TN'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#BDB76B', // Koyu Haki
            coins: 40,
            units: 0
        },
        'LY': { // Libya (Sizin kodunuzda 'LBY' idi)
            name: 'Libya',
            nuts2: ['LY'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#9c9b6a', // İtalya'nın rengiyle benzerdi
            coins: 50,
            units: 0
        },
        'EG': { // Mısır (Genellikle tek topraklı)
            name: 'Mısır',
            nuts2: ['EG'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#DAA520', // Altınçubuk
            coins: 60,
            units: 0
        },
        'SY': { // Suriye (Sizin kodunuzda 'SYR' idi)
            name: 'Suriye',
            nuts2: ['SY'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#4682b4', // Çelik Mavi
            coins: 50,
            units: 0
        },
        'LB': { // Lübnan (Sizin kodunuzda 'LBN' idi)
            name: 'Lübnan',
            nuts2: ['LB'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#947119', // Fransa'nın rengi
            coins: 20,
            units: 0
        },
        'IQ': { // Irak (Sizin kodunuzda 'IRQ' idi)
            name: 'Irak',
            nuts2: ['IQ'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#d2691e', // Çikolata Kahve
            coins: 50,
            units: 0
        },
        'IR': { // İran (Genellikle tek topraklı veya birkaç bölge)
            name: 'İran',
            nuts2: ['IR'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#008000', // Yeşil
            coins: 70,
            units: 0
        },
        'SA': { // Suudi Arabistan (Genellikle tek topraklı)
            name: 'Suudi Arabistan',
            nuts2: ['SA'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#228B22', // Orman Yeşili
            coins: 80,
            units: 0
        },
        'YE': { // Yemen (Genellikle tek topraklı)
            name: 'Yemen',
            nuts2: ['YE'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#7CFC00', // Çim Yeşili
            coins: 30,
            units: 0
        },
        'OM': { // Umman (Genellikle tek topraklı)
            name: 'Umman',
            nuts2: ['OM'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#00CED1', // Koyu Turkuaz
            coins: 40,
            units: 0
        },
        'AE': { // Birleşik Arap Emirlikleri (Tek Topraklı)
            name: 'Birleşik Arap Emirlikleri',
            nuts2: ['AE'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#8B4513', // Sepya
            coins: 50,
            units: 0
        },
        'QA': { // Katar (Tek Topraklı)
            name: 'Katar',
            nuts2: ['QA'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#FFDAB9', // Şeftali Kreması
            coins: 30,
            units: 0
        },
        'KW': { // Kuveyt (Tek Topraklı)
            name: 'Kuveyt',
            nuts2: ['KW'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#FFFAF0', // Karbeyazı
            coins: 30,
            units: 0
        },
        'BH': { // Bahreyn (Tek Topraklı)
            name: 'Bahreyn',
            nuts2: ['BH'], // Genellikle tek ID, SVG'nizi kontrol edin
            isPlayer: false,
            color: '#F0E68C', // Haki
            coins: 30,
            units: 0
        },

        // Doğu Avrupa - Geniş Ülkeler
        'UA': { // Ukrayna
            name: 'Ukrayna',
            nuts2: ['UA11', 'UA12', 'UA13', 'UA14', 'UA15', 'UA16', 'UA17', 'UA18', 'UA19', 'UA20', 'UA21', 'UA22', 'UA23', 'UA24', 'UA25', 'UA26', 'UA27'], // Tahmini NUTS2 benzeri
            isPlayer: false,
            color: '#FFD700', // Altın Sarısı
            coins: 90,
            units: 0
        },
        'BY': { // Belarus (Genellikle birkaç bölgeye ayrılır)
            name: 'Belarus',
            nuts2: ['BY10', 'BY20', 'BY30', 'BY40', 'BY50', 'BY60', 'BY70'], // Tahmini NUTS2 benzeri
            isPlayer: false,
            color: '#7FFF00', // Chartreuse
            coins: 70,
            units: 0
        },
        'MD': { // Moldova (Tek Topraklı veya birkaç bölge)
            name: 'Moldova',
            nuts2: ['MD00'], // Tahmini ID
            isPlayer: false,
            color: '#8B0000', // Koyu Kırmızı
            coins: 30,
            units: 0
        },
        'RU': { // Rusya (Avrupa Kısmı - NUTS'a dahil değil, geniş bölgeler)
            name: 'Rusya',
            nuts2: ['RU-MOS', 'RU-SPE', 'RU-KGD', 'RU-LEN', 'RU-MUR', 'RU-ARK', 'RU-VLG', 'RU-NGR', 'RU-PSK', 'RU-TVE', 'RU-SMO', 'RU-BRY', 'RU-KLU', 'RU-ORL', 'RU-LIP', 'RU-TUL', 'RU-RYA', 'RU-VLA', 'RU-IVA', 'RU-KOS', 'RU-YAR', 'RU-TVL', 'RU-KDA', 'RU-ROS', 'RU-VGG', 'RU-AST', 'RU-DA', 'RU-CHE', 'RU-KAB', 'RU-KC', 'RU-AD', 'RU-ME', 'RU-KOS', 'RU-STV', 'RU-VOR', 'RU-TAM', 'RU-BEL', 'RU-KRS', 'RU-RYA', 'RU-NIZ', 'RU-PNZ', 'RU-SAM', 'RU-SAR', 'RU-ULY', 'RU-ORE', 'RU-PER', 'RU-KIR', 'RU-UD', 'RU-MOR', 'RU-CHU', 'RU-TA', 'RU-BA'], // Avrupa Rusya'sının tahmini bazı federal bölgeleri/oblastları
            isPlayer: false,
            color: '#808080', // Gri
            coins: 120,
            units: 0
        },
    };
    // --------------------------------------------------------------------------------------

    // NUTS2 Komşuluk Verisi
    // ÖNEMLİ: Burayı kendi haritanızdaki NUTS2 bölgelerinin komşuluklarına göre DOLDURMALISINIZ.
    // Örnek: 'TR63': ['TR62', 'SY'], (TR63, TR62 ve Suriye'ye komşu)
    // Eğer bir bölge başka bir ülkenin bölgesiyle komşuysa, o komşu bölgenin NUTS ID'sini yazın.
    const nutsNeighbors = {
        'TR63': ['TR62', 'SY', 'IQ'], // Örnek: TR63, TR62'ye ve Suriye'ye komşu varsayım. Siz doğrulayın.
        'SY': ['TR63', 'IQ', 'LB', 'JO', 'SA'], // Suriye'nin komşuları
        'IQ': ['TR63', 'SY', 'IR', 'SA', 'KW', 'JO'], // Irak'ın komşuları
        'EE00': ['LV00', 'RU-LEN'], // Estonya'nın komşuları
        'LV00': ['EE00', 'LT00', 'RU-PSK', 'BY10'], // Letonya'nın komşuları
        'LT00': ['LV00', 'PL21', 'BY20', 'RU-KGD'], // Litvanya'nın komşuları
        'GR11': ['GR12', 'GR13', 'AL01', 'MK00'], // Örnek Yunanistan komşusu
        'ITG2': ['ITG1', 'SI03', 'AT31'], // İtalya ve komşuları
        'FRC1': ['FRC2', 'DE60', 'LU00'], // Fransa ve komşuları
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

                            const iconSize = 15; // İkon boyutu
                            const icon = svgDoc.createElementNS("http://www.w3.org/2000/svg", "image");
                            icon.setAttribute("xlink:href", "attack-icon.png"); // Kendi ikon dosyanızın yolu
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

            // Savunan bölgedeki birimler sıfırlanır
            // territoryUnits[currentDefendingNutsId] = 0; // Eğer fetihle sıfırlansın istenirse

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
                        addNotification(`${targetCountry.name} ülkesi oyundan silindi!`, 'warning');
                        delete countriesData[targetCountryId]; // Ülkeyi ülkeler listesinden kaldır
                        populateTargetCountrySelection(); // Savaş ilan hedef listesini güncelle
                    }

                    // Harita renklerini ve birim sayılarını güncelle
                    applyCountryColorsToMap();
                    updateUnitDisplays();
                } else {
                    addNotification(`${aiCountry.name} ülkesinin saldırısı ${targetCountry.name} ülkesine karşı BAŞARISIZ OLDU!`, 'info');
                    territoryUnits[attackingRegionNutsId] = Math.max(0, aiAttackingUnits - Math.floor(targetDefendingUnits / 2));
                    territoryUnits[defendingRegionNutsId] = Math.max(0, targetDefendingUnits - Math.floor(aiAttackingUnits / 2));
                    applyCountryColorsToMap(); // Eski renklerine döner
                    updateUnitDisplays();
                }
            }
        });
    }

    // --- Bildirim Sistemi ---
    function addNotification(message, type = 'default') {
        const li = document.createElement('li');
        li.textContent = message;
        li.className = `notification-${type}`; // Stil için sınıf ekle

        notificationList.prepend(li); // En yeni bildirimi üste ekle
        if (notificationList.children.length > 15) { // Çok fazla bildirim birikmesini önle
            notificationList.removeChild(notificationList.lastChild);
        }
    }

    // Sayfa yüklendiğinde SVG'nin hazır olup olmadığını kontrol et
    // Eğer SVG zaten yüklendiyse, load olayını manuel olarak tetikle
    if (gameMapObject.contentDocument && gameMapObject.contentDocument.documentElement && gameMapObject.contentDocument.documentElement.nodeName === 'svg') {
        gameMapObject.dispatchEvent(new Event('load'));
    }
});
