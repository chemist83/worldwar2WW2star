document.addEventListener('DOMContentLoaded', () => {
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

    // Yeni eklenen HTML elementleri için referanslar
    const playerCoinsSpan = document.getElementById('playerCoins');
    const playerUnitsSpan = document.getElementById('playerUnits');
    const buyUnitButton = document.getElementById('buyUnitButton');
    const unitPriceSpan = document.getElementById('unitPrice');


    let playerName = '';
    let playerCountry = ''; // Örn: "UK"
    let currentTurn = 1;
    const UNIT_COST = 20; // Birim başına maliyet
    const INCOME_PER_REGION = 10; // Bölge başına gelir

    let selectedRegionForUnitPlacement = null; // Birim yerleştirmek için seçilen bölgeyi tutacak
    let nuts2RegionElements = {}; // data-nuts-id'ye göre SVG path elemanlarını tutacak
    let nuts2UnitTextElements = {}; // data-nuts-id'ye göre SVG text elemanlarını (birim sayıları) tutacak
    // Her NUTS2 bölgesindeki birim sayısını tutacak yapı
    let territoryUnits = {}; // Örn: { 'FRC1': 5, 'DE71': 3 }


    // ----------- BURAYI DOLDURUN: Ülke ve NUTS2 bölgeleri arasındaki ilişkiyi tutacak obje -----------
    // ÖNEMLİ: 'nuts2' dizilerine kendi map.svg dosyanızdaki data-nuts-id değerlerini YAZMALISINIZ!
    // Her ülkenin NUTS2 bölgeleri aynı renkte olacak şekilde ayarlanmıştır.
    let countriesData = {
        'UK': {
            name: 'Birleşik Krallık',
            nuts2: ['UKI', 'UKD', 'UKJ', 'UKM', 'UKN', 'UKL', 'UKF', 'UKC', 'UKE', 'UKG', 'UKH'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#19cf0c', // Sizin verdiğiniz renk: Yeşil
            coins: 100, // Başlangıç coin miktarı
            units: 0 // Başlangıç birim sayısı
        },
        'FR': {
            name: 'Fransa',
            nuts2: ['FRC1', 'FR23', /* BURAYA DİĞER TÜM FRANSA NUTS2 KODLARINI EKLEYİN */ 'FR1', 'FR2', 'FR3', 'FR4', 'FR5', 'FR6', 'FR7', 'FR8', 'FR9', 'FRA', 'FRB', 'FRC', 'FRD', 'FRE', 'FRF', 'FRG', 'FRH', 'FRI', 'FRJ', 'FRK', 'FRL', 'FRM', 'FRN'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#947119', // Sizin verdiğiniz renk: Kahverengimsi
            coins: 100,
            units: 0
        },
        'DE': {
            name: 'Almanya',
            nuts2: ['DE71', /* BURAYA DİĞER TÜM ALMANYA NUTS2 KODLARINI EKLEYİN */ 'DE1', 'DE2', 'DE3', 'DE4', 'DE5', 'DE6', 'DE8', 'DE9', 'DEA', 'DEB', 'DEC', 'DED', 'DEE', 'DEF', 'DEG'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#e0d253', // Sizin verdiğiniz renk: Açık Sarımsı
            coins: 100,
            units: 0
        },
        TR': { // Ülke kodu olarak ISO 3166 Alpha-2 kullanıldı
        name: 'Türkiye',
        // BURAYA SİZİN MAP.SVG DOSYANIZDAKİ TÜM TÜRKİYE NUTS KODLARINI EKLEYECEKSİNİZ!
        nuts2: ['TR10', 'TR21', 'TR22', 'TR31', 'TR32', 'TR33', 'TR41', 'TR42', 'TR51', 'TR52', 'TR61', 'TR62', 'TR63', 'TR71', 'TR72', 'TR81', 'TR82', 'TR83', 'TR90', 'TRA1', 'TRA2', 'TRB1', 'TRB2', 'TRC1', 'TRC2', 'TRC3'], // Bu liste eksiksiz olmalı!
        isPlayer: false, // Varsayılan olarak oyuncu ülkesi değil
        color: '#ff0000', // Türkiye için bir renk (kırmızı örnek)
        coins: 100, // Başlangıç coin miktarı
        units: 0 // Başlangıç birim sayısı
    },

        'PT': {
            name: 'Portekiz',
            nuts2: ['PT11', 'PT15', 'PT16', 'PT17', 'PT18', 'PT20', 'PT30'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#dc2ee6', // Sizin verdiğiniz renk: Morumsu Pembe
            coins: 100,
            units: 0
        },
        'ES': {
            name: 'İspanya',
            nuts2: ['ES1', 'ES2', 'ES3', 'ES4', 'ES5', 'ES6', 'ES7'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#62d9d5', // Sizin verdiğiniz renk: Turkuaz
            coins: 100,
            units: 0
        },
        'IT': {
            name: 'İtalya',
            nuts2: ['ITC', 'ITD', 'ITE', 'ITF', 'ITG', 'ITH', 'ITI', 'ITJ'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#9c9b6a', // Sizin verdiğiniz renk: Grimsi Yeşil
            coins: 100,
            units: 0
        },
        // --- Tek Topraklı Ülkeler (ISO 3166 Alpha-3 kodları veya benzeri ID'ler) ---
        // ÖNEMLİ: Bu ülkelerin SVG'de hangi data-nuts-id'lere sahip olduğunu KONTROL ETMELİSİNİZ.
        // Eğer ISO 3166 Alpha-3 kodu kullanılıyorsa, nuts2 dizisine o ISO kodunun kendisini ekleyebilirsiniz.
        // Örneğin, <path data-nuts-id="MAR" ... /> ise.

        'MAR': { // Fas
            name: 'Fas',
            nuts2: ['MAR'], // KONTROL EDİN: SVG'de MAR ID'li bir path mi var? Yoksa MAR1 gibi mi?
            isPlayer: false,
            color: '#8b0000', // Örnek renk: Koyu Kırmızı
            coins: 50,
            units: 0
        },
        'DZA': { // Cezayir
            name: 'Cezayir',
            nuts2: ['DZA'], // KONTROL EDİN
            isPlayer: false,
            color: '#006400', // Örnek renk: Koyu Yeşil
            coins: 50,
            units: 0
        },
        'SYR': { // Suriye
            name: 'Suriye',
            nuts2: ['SYR'], // KONTROL EDİN
            isPlayer: false,
            color: '#4682b4', // Örnek renk: Çelik Mavi
            coins: 50,
            units: 0
        },
        'LBN': { // Lübnan (Fransa'nın renginde olacak)
            name: 'Lübnan',
            nuts2: ['LBN'], // KONTROL EDİN
            isPlayer: false,
            color: '#947119', // Fransa'nın rengi
            coins: 20,
            units: 0
        },
        'IRQ': { // Irak
            name: 'Irak',
            nuts2: ['IRQ'], // KONTROL EDİN
            isPlayer: false,
            color: '#d2691e', // Örnek renk: Çikolata Kahve
            coins: 50,
            units: 0
        },
        'CYP': { // Kıbrıs (UK'nin renginde olacak)
            name: 'Kıbrıs',
            nuts2: ['CYP'], // KONTROL EDİN
            isPlayer: false,
            color: '#19cf0c', // Birleşik Krallık'ın rengi
            coins: 20,
            units: 0
        },
        'LBY': { // Libya (İtalya'nın renginde olacak)
            name: 'Libya',
            nuts2: ['LBY'], // KONTROL EDİN
            isPlayer: false,
            color: '#9c9b6a', // İtalya'nın rengi
            coins: 50,
            units: 0
        },

        // --- Baltık Ülkeleri ---
        // Verdiğiniz format: EE00, LV00, LT00
        'EST': { // Estonya
            name: 'Estonya',
            nuts2: ['EE00'], // KONTROL EDİN: SVG'de EE00 ID'li bir path mi var?
            isPlayer: false,
            color: '#346369', // Sizin verdiğiniz renk
            coins: 50,
            units: 0
        },
        'LVA': { // Letonya
            name: 'Letonya',
            nuts2: ['LV00'], // KONTROL EDİN
            isPlayer: false,
            color: '#4a398f', // Sizin verdiğiniz renk
            coins: 50,
            units: 0
        },
        'LTU': { // Litvanya
            name: 'Litvanya',
            nuts2: ['LT00'], // KONTROL EDİN
            isPlayer: false,
            color: '#4e6644', // Sizin verdiğiniz renk
            coins: 50,
            units: 0
        }

        // Diğer tüm ülkeler buraya kendi NUTS2 ID'leri ve renkleriyle eklenecek.
        // Her ülkenin 'nuts2' dizisini kendi map.svg dosyanızdan kontrol edip DOLDURMALISINIZ.
    };
    // --------------------------------------------------------------------------------------


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
            // Harita yüklendiğinde çalışacak initializeGameMap'i manuel tetikleyelim
            // Eğer SVG zaten yüklendiyse, load olayını manuel olarak tetikle
            if (gameMapObject.contentDocument && gameMapObject.contentDocument.documentElement && gameMapObject.contentDocument.documentElement.nodeName === 'svg') {
                gameMapObject.dispatchEvent(new Event('load'));
            } else {
                 // Eğer henüz yüklenmediyse, load event listener'ı devreye girecektir.
                 // Bu durumda initializeGameMap'i doğrudan çağırmıyoruz, load event'ini bekliyoruz.
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
            const bbox = path.getBBox(); // Path'in bounding box'ını al
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            textElement.setAttribute("x", centerX);
            textElement.setAttribute("y", centerY);

            // Tüm text elementlerini SVG'nin kök elementine veya uygun bir gruba ekle
            // Örneğin, SVG içinde id="texts" olan bir grup oluşturabilirsiniz.
            // Yoksa, doğrudan svgDoc.documentElement.appendChild(textElement); yapabilirsiniz.
            // Daha düzenli olması için bir 'texts' grubu oluşturalım (manuel olarak SVG'ye eklemeniz gerekebilir)
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

            // Her NUTS2 bölgesine tıklama olayı ekle
            path.addEventListener('click', (event) => {
                const clickedNutsId = event.target.getAttribute('data-nuts-id');
                let ownerCountryId = null;
                for (const countryId in countriesData) {
                    if (countriesData[countryId].nuts2 && countriesData[countryId].nuts2.includes(clickedNutsId)) {
                        ownerCountryId = countryId;
                        break;
                    }
                }
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

    // Haritadaki NUTS2 bölgelerine ülkelerin renklerini uygula
    function applyCountryColorsToMap() {
        for (const countryId in countriesData) {
            const countryInfo = countriesData[countryId];
            if (countryInfo.nuts2) { // nuts2 tanımı varsa
                countryInfo.nuts2.forEach(nutsId => {
                    const nutsPath = nuts2RegionElements[nutsId];
                    if (nutsPath) {
                        nutsPath.style.fill = countryInfo.color;
                        nutsPath.style.stroke = '#2c3e50'; // Sınır çizgisi
                        nutsPath.style.strokeWidth = '0.5px';
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
        console.log("Savaş İlan Et butonuna tıklandı!");
        const targetCountryId = targetCountrySelect.value;
        console.log("Seçilen hedef ülke ID:", targetCountryId);

        if (!targetCountryId) {
            addNotification('Lütfen savaş ilan etmek istediğiniz ülkeyi seçin.', 'warning');
            console.log("Hedef ülke seçilmedi, işlem durduruldu.");
            return;
        }

        const playerCountryName = countriesData[playerCountry].name;
        const targetCountryName = countriesData[targetCountryId].name;

        // Basit bir savaş ilanı mantığı:
        addNotification(`${playerCountryName} ülkesi, ${targetCountryName} ülkesine SAVAŞ İLAN ETTİ!`, 'danger');

        // Savaş ilan edilen ülkenin NUTS2 bölgelerinin rengini değiştir
        changeNuts2ColorForConflict(targetCountryId, 'darkred', 'yellow'); // Savaş rengi
        console.log("Hedef ülkenin rengi değiştirildi.");

        // Burada daha karmaşık savaş başlatma, diplomatik ilişkileri güncelleme vb. mantıklar eklenecek.
    });

    // NUTS2 bölgelerinin rengini savaş/çatışma durumuna göre değiştirme
    function changeNuts2ColorForConflict(countryId, newColor, strokeColor) {
        const countryInfo = countriesData[countryId];
        if (countryInfo && countryInfo.nuts2) {
            countryInfo.nuts2.forEach(nutsId => {
                const nutsPath = nuts2RegionElements[nutsId];
                if (nutsPath) {
                    nutsPath.style.fill = newColor; // Doğrudan SVG elemanının rengini değiştir
                    nutsPath.style.stroke = strokeColor; // Savaş hali için farklı kenar
                    nutsPath.style.strokeWidth = '1.5px';
                }
            });
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
            addNotification('Lütfen birim yerleştirmek istediğiniz bir bölgeye tıklayın.', 'warning');
        } else {
            addNotification('Yeterli coin yok! Birim satın almak için 20 coin gerekir.', 'error');
        }
    });

    // Birim yerleştirme fonksiyonu
    function placeUnits(nutsId) {
        const player = countriesData[playerCountry];
        // Tıklanan bölgenin oyuncuya ait olup olmadığını kontrol et
        if (countriesData[playerCountry].nuts2 && countriesData[playerCountry].nuts2.includes(nutsId)) {
            if (player.units > 0) { // Oyuncunun yerleştirilebilir birimi varsa
                territoryUnits[nutsId] = (territoryUnits[nutsId] || 0) + 1; // Bölgeye 1 birim ekle
                player.units -= 1; // Oyuncunun toplam yerleştirilebilir biriminden düş

                updateUnitDisplays(); // Haritadaki birim sayılarını güncelle
                updatePlayerStatsDisplay(); // Kontrol panelindeki sayıları güncelle
                addNotification(`${nutsId} bölgesine 1 birim yerleştirildi. Kalan yerleştirilebilir birim: ${player.units}`, 'info');

                if (player.units === 0) {
                    selectedRegionForUnitPlacement = null; // Birim kalmadı, yerleştirme modunu kapat
                    addNotification('Tüm birimleriniz yerleştirildi.', 'info');
                }
            } else {
                addNotification('Yerleştirilecek biriminiz kalmadı. Önce birim satın alın.', 'warning');
                selectedRegionForUnitPlacement = null; // Modu kapat
            }
        } else {
            addNotification('Yalnızca kendi topraklarınıza birim yerleştirebilirsiniz!', 'error');
        }
    }


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
                if (aiCountry.nuts2) {
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
            if (!aiCountry) return; // Ülke daha önce silinmiş olabilir

            // AI birim satın alabilir (her 3 turda bir 1 birim alır ve yeterli coini varsa)
            if (currentTurn % 3 === 0 && aiCountry.coins >= UNIT_COST) {
                aiCountry.coins -= UNIT_COST;
                aiCountry.units += 1; // Satın alınan birimler, birim havuzuna eklenir
                addNotification(`${aiCountry.name} 1 birim satın aldı.`, 'info');

                // Satın alınan birimi rastgele kendi toprağına yerleştir
                if (aiCountry.nuts2 && aiCountry.nuts2.length > 0) {
                    const randomRegion = aiCountry.nuts2[Math.floor(Math.random() * aiCountry.nuts2.length)];
                    territoryUnits[randomRegion] = (territoryUnits[randomRegion] || 0) + 1;
                    aiCountry.units -= 1; // Birim havuzundan düş
                    addNotification(`${aiCountry.name}, ${randomRegion} bölgesine 1 birim yerleştirdi.`, 'info');
                }
            }

            // Basit AI davranışı: rastgele başka bir ülkeye saldır
            if (Math.random() < WAR_CHANCE_BASE && Object.keys(countriesData).length > 1) {
                const potentialTargets = Object.keys(countriesData).filter(id => id !== countryId && countriesData[id].nuts2 && countriesData[id].nuts2.length > 0); // Kendisi dışındaki ve bölgesi olan tüm ülkeler
                if (potentialTargets.length === 0) return; // Hedef yoksa devam etme

                const targetCountryId = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                const targetCountry = countriesData[targetCountryId];

                if (!targetCountry) return; // Hedef ülke oyundan silinmiş olabilir

                if (targetCountryId === playerCountry) {
                    addNotification(`${aiCountry.name} ülkesi, size (${playerCountryNameSpan.textContent}) savaş ilan etti!`, 'danger');
                } else {
                    addNotification(`${aiCountry.name} ülkesi, ${targetCountry.name} ülkesine savaş ilan etti!`, 'danger');
                }

                // Savaş ilan edilen ülkenin NUTS2 bölgelerinin rengini değiştir
                changeNuts2ColorForConflict(targetCountryId, 'darkred', 'yellow'); // Savaş rengi

                // Savaş sonucu: Birim farkına göre basit fetih mantığı
                // Hedef ülkenin NUTS2 bölgesi varsa ve birimleri varsa
                if (targetCountry.nuts2 && targetCountry.nuts2.length > 0) {
                    // AI ve hedefin toplam harita üzerindeki birimlerini hesapla
                    let aiTotalDeployedUnits = 0;
                    aiCountry.nuts2.forEach(nutsId => aiTotalDeployedUnits += (territoryUnits[nutsId] || 0));

                    let targetTotalDeployedUnits = 0;
                    targetCountry.nuts2.forEach(nutsId => targetTotalDeployedUnits += (territoryUnits[nutsId] || 0));

                    // Eğer AI'ın harita üzerinde hiç birimi yoksa, saldırmasın veya zayıf kalsın
                    if (aiTotalDeployedUnits === 0) {
                        addNotification(`${aiCountry.name} birimleri olmadığı için saldıramadı.`, 'info');
                        applyCountryColorsToMap(); // Eski renklerine döner
                        return;
                    }

                    let unitAdvantage = aiTotalDeployedUnits - targetTotalDeployedUnits;
                    let conquestChance = 0.5 + (unitAdvantage * CONQUER_CHANCE_PER_UNIT_ADVANTAGE); // Temel %50 şans + birim avantajı
                    conquestChance = Math.max(0.1, Math.min(0.9, conquestChance)); // Şansı %10-90 arasında tut

                    if (Math.random() < conquestChance) {
                        // Fetih başarılı! Rastgele bir bölgeyi al
                        const conqueredRegionNutsId = targetCountry.nuts2[Math.floor(Math.random() * targetCountry.nuts2.length)];

                        // Bölgenin sahibini değiştir
                        // Eski sahibin nuts2 listesinden çıkar
                        targetCountry.nuts2 = targetCountry.nuts2.filter(nutsId => nutsId !== conqueredRegionNutsId);
                        // Yeni sahibin nuts2 listesine ekle
                        aiCountry.nuts2.push(conqueredRegionNutsId);

                        // Birimleri transfer et/yok et (saldıran birim kaybeder, savunan birim kaybeder)
                        // Fethedilen bölgedeki birimleri sıfırla veya yeniden ata
                        const transferredUnits = Math.min(territoryUnits[conqueredRegionNutsId] || 0, aiTotalDeployedUnits); // Bölgedeki birimleri al
                        territoryUnits[conqueredRegionNutsId] = 0; // Fethedilen bölgenin birimini sıfırla

                        // Basitçe: Saldıran birim kaybeder, fetheden ülkenin genel birim havuzuna eklenmez.
                        // Yeni fethedilen bölgeye AI kendi birimlerinden bir miktar aktarabilir.
                        const unitsToPlaceOnConquered = Math.min(aiTotalDeployedUnits, Math.floor(Math.random() * 3) + 1); // Max 3 birim
                        if (unitsToPlaceOnConquered > 0) {
                            territoryUnits[conqueredRegionNutsId] = unitsToPlaceOnConquered;
                            // AI'ın toplam birim havuzundan düşürülebilir eğer birimler bir havuzdan geliyorsa
                        }


                        addNotification(`${aiCountry.name} ülkesi, ${targetCountry.name} ülkesinden ${conqueredRegionNutsId} bölgesini FETHETTİ!`, 'success');

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
                        applyCountryColorsToMap(); // Eski renklerine döner
                    }
                } else {
                    addNotification(`${aiCountry.name} hedef ülkede fethedilecek bölge bulamadı.`, 'warning');
                }
            }
        });
    }

    // --- Bildirim Sistemi (tip eklendi) ---
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
