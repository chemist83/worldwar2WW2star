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

    let playerName = '';
    let playerCountry = ''; // Örn: "UK"
    let currentTurn = 1;

    // ----------- BURAYI DOLDURUN: Ülke ve NUTS2 bölgeleri arasındaki ilişkiyi tutacak obje -----------
    // ÖNEMLİ: 'nuts2' dizilerine kendi map.svg dosyanızdaki data-nuts-id değerlerini YAZMALISINIZ!
    // Her ülkenin NUTS2 bölgeleri aynı renkte olacak şekilde ayarlanmıştır.
    let countriesData = {
        'UK': {
            name: 'Birleşik Krallık',
            nuts2: ['UKI', 'UKD', 'UKJ', 'UKM', 'UKN', 'UKL', 'UKF', 'UKC', 'UKE', 'UKG', 'UKH'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#19cf0c' // Sizin verdiğiniz renk: Yeşil
        },
        'FR': {
            name: 'Fransa',
            nuts2: ['FRC1', 'FR23', /* BURAYA DİĞER TÜM FRANSA NUTS2 KODLARINI EKLEYİN */ 'FR1', 'FR2', 'FR3', 'FR4', 'FR5', 'FR6', 'FR7', 'FR8', 'FR9', 'FRA', 'FRB', 'FRC', 'FRD', 'FRE', 'FRF', 'FRG', 'FRH', 'FRI', 'FRJ', 'FRK', 'FRL', 'FRM', 'FRN'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#947119' // Sizin verdiğiniz renk: Kahverengimsi
        },
        'DE': {
            name: 'Almanya',
            nuts2: ['DE71', /* BURAYA DİĞER TÜM ALMANYA NUTS2 KODLARINI EKLEYİN */ 'DE1', 'DE2', 'DE3', 'DE4', 'DE5', 'DE6', 'DE8', 'DE9', 'DEA', 'DEB', 'DEC', 'DED', 'DEE', 'DEF', 'DEG'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#e0d253' // Sizin verdiğiniz renk: Açık Sarımsı
        },
        'PT': {
            name: 'Portekiz',
            nuts2: ['PT11', 'PT15', 'PT16', 'PT17', 'PT18', 'PT20', 'PT30'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#dc2ee6' // Sizin verdiğiniz renk: Morumsu Pembe
        },
        'ES': {
            name: 'İspanya',
            nuts2: ['ES', 'ES12', 'ES13', 'ES61', 'ES43', 'ES6', 'ES7'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#62d9d5' // Sizin verdiğiniz renk: Turkuaz
        },
        'IT': {
            name: 'İtalya',
            nuts2: ['ITC', 'ITD', 'ITE', 'ITF', 'ITG', 'ITH', 'ITI', 'ITJ'], // ÖRNEK NUTS2 ID'leri, KENDİ SVG'NİZE GÖRE DOLDURUN!
            isPlayer: false,
            color: '#9c9b6a' // Sizin verdiğiniz renk: Grimsi Yeşil
        },
        // --- Tek Topraklı Ülkeler (ISO 3166 Alpha-3 kodları veya benzeri ID'ler) ---
        // ÖNEMLİ: Bu ülkelerin SVG'de hangi data-nuts-id'lere sahip olduğunu KONTROL ETMELİSİNİZ.
        // Eğer ISO 3166 Alpha-3 kodu kullanılıyorsa, nuts2 dizisine o ISO kodunun kendisini ekleyebilirsiniz.
        // Örneğin, <path data-nuts-id="MAR" ... /> ise.

        'MAR': { // Fas
            name: 'Fas',
            nuts2: ['MAR'], // KONTROL EDİN: SVG'de MAR ID'li bir path mi var? Yoksa MAR1 gibi mi?
            isPlayer: false,
            color: '#8b0000' // Örnek renk: Koyu Kırmızı
        },
        'DZA': { // Cezayir
            name: 'Cezayir',
            nuts2: ['DZA'], // KONTROL EDİN
            isPlayer: false,
            color: '#006400' // Örnek renk: Koyu Yeşil
        },
        'SYR': { // Suriye
            name: 'Suriye',
            nuts2: ['SYR'], // KONTROL EDİN
            isPlayer: false,
            color: '#4682b4' // Örnek renk: Çelik Mavi
        },
        'LBN': { // Lübnan (Fransa'nın renginde olacak)
            name: 'Lübnan',
            nuts2: ['LBN'], // KONTROL EDİN
            isPlayer: false,
            color: '#947119' // Fransa'nın rengi
        },
        'IRQ': { // Irak
            name: 'Irak',
            nuts2: ['IRQ'], // KONTROL EDİN
            isPlayer: false,
            color: '#d2691e' // Örnek renk: Çikolata Kahve
        },
        'CYP': { // Kıbrıs (UK'nin renginde olacak)
            name: 'Kıbrıs',
            nuts2: ['CYP'], // KONTROL EDİN
            isPlayer: false,
            color: '#19cf0c' // Birleşik Krallık'ın rengi
        },
        'LBY': { // Libya (İtalya'nın renginde olacak)
            name: 'Libya',
            nuts2: ['LBY'], // KONTROL EDİN
            isPlayer: false,
            color: '#9c9b6a' // İtalya'nın rengi
        },

        // --- Baltık Ülkeleri ---
        // Verdiğiniz format: EE00, LV00, LT00
        'EST': { // Estonya
            name: 'Estonya',
            nuts2: ['EE00'], // KONTROL EDİN: SVG'de EE00 ID'li bir path mi var?
            isPlayer: false,
            color: '#346369' // Sizin verdiğiniz renk
        },
        'LVA': { // Letonya
            name: 'Letonya',
            nuts2: ['LV00'], // KONTROL EDİN
            isPlayer: false,
            color: '#4a398f' // Sizin verdiğiniz renk
        },
        'LTU': { // Litvanya
            name: 'Litvanya',
            nuts2: ['LT00'], // KONTROL EDİN
            isPlayer: false,
            color: '#4e6644' // Sizin verdiğiniz renk
        }

        // Diğer tüm ülkeler buraya kendi NUTS2 ID'leri ve renkleriyle eklenecek.
        // Her ülkenin 'nuts2' dizisini kendi map.svg dosyanızdan kontrol edip DOLDURMALISINIZ.
    };
    // --------------------------------------------------------------------------------------


    let nuts2RegionElements = {}; // data-nuts-id'ye göre SVG path elemanlarını tutacak

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
            playerCountryNameSpan.textContent = countriesData[playerCountry].name;
            countrySelectionScreen.classList.remove('active');
            gameScreen.classList.add('active');
            initializeGameMap(); // Haritayı ve etkileşimleri başlat
            populateTargetCountrySelection(); // Savaş ilan edilecek ülkeleri doldur
            addNotification(`Oyuna hoş geldiniz, ${playerName}! ${countriesData[playerCountry].name} olarak başlıyorsunuz.`, 'info');
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
            nuts2RegionElements[nutsId] = path; // Elemanı objemizde sakla

            // Her NUTS2 bölgesine tıklama olayı ekle
            path.addEventListener('click', (event) => {
                const clickedNutsId = event.target.getAttribute('data-nuts-id');
                let ownerCountryId = '';
                for (const countryId in countriesData) {
                    if (countriesData[countryId].nuts2 && countriesData[countryId].nuts2.includes(clickedNutsId)) {
                        ownerCountryId = countryId;
                        break;
                    }
                }
                if (ownerCountryId) {
                    addNotification(`Tıklanan bölge: ${clickedNutsId} (${countriesData[ownerCountryId].name})`, 'info');
                    // Burada bölgeye ait detayları gösteren bir menü açılabilir
                } else {
                    addNotification(`Tıklanan bölge: ${clickedNutsId} (Sahipsiz veya Bilinmiyor)`, 'warning');
                }
            });
        });

        // Haritadaki tüm bölgeleri başlangıç renkleriyle boya
        applyCountryColorsToMap();
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


    // --- Kontrol Paneli ve Oyun Mekanikleri ---

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

        const playerCountryName = countriesData[playerCountry].name;
        const targetCountryName = countriesData[targetCountryId].name;

        // Basit bir savaş ilanı mantığı:
        addNotification(`${playerCountryName} ülkesi, ${targetCountryName} ülkesine SAVAŞ İLAN ETTİ!`, 'danger');

        // Savaş ilan edilen ülkenin NUTS2 bölgelerinin rengini değiştir
        changeNuts2ColorForConflict(targetCountryId, 'darkred'); // Savaş rengi

        // Burada daha karmaşık savaş başlatma, diplomatik ilişkileri güncelleme vb. mantıklar eklenecek.
        // Örneğin: countriesData[playerCountry].relations[targetCountryId] = 'war';
    });

    // NUTS2 bölgelerinin rengini savaş/çatışma durumuna göre değiştirme
    function changeNuts2ColorForConflict(countryId, newColor) {
        const countryInfo = countriesData[countryId];
        if (countryInfo.nuts2) {
            countryInfo.nuts2.forEach(nutsId => {
                const nutsPath = nuts2RegionElements[nutsId];
                if (nutsPath) {
                    nutsPath.style.fill = newColor; // Doğrudan SVG elemanının rengini değiştir
                    nutsPath.style.stroke = 'yellow'; // Savaş hali için farklı kenar
                    nutsPath.style.strokeWidth = '1.5px';
                }
            });
        }
    }


    // --- Tur Atlama Mantığı ---
    nextTurnButton.addEventListener('click', () => {
        currentTurn++;
        currentTurnSpan.textContent = currentTurn;
        addNotification(`Yeni tur başladı: Tur ${currentTurn}`, 'info');
        runAILogic();
        // Tur sonunda yapılması gereken diğer şeyler: kaynak üretimi, birim hareketleri vb.
        applyCountryColorsToMap(); // AI kararlarından veya tur olaylarından sonra harita renklerini güncelle
    });

    // --- AI Kontrolü (Çok Basit Örnek) ---
    function runAILogic() {
        for (const countryId in countriesData) {
            if (countriesData[countryId].isPlayer) continue; // Oyuncunun ülkesini atla

            // Basit AI davranışı:
            const randomAction = Math.random();
            if (randomAction < 0.1 && Object.keys(countriesData).length > 1) { // %10 ihtimalle savaş ilan et
                const nonPlayerCountries = Object.keys(countriesData).filter(id => id !== countryId && !countriesData[id].isPlayer);
                if (nonPlayerCountries.length > 0) {
                    const targetCountryId = nonPlayerCountries[Math.floor(Math.random() * nonPlayerCountries.length)];
                    addNotification(`${countriesData[countryId].name} ülkesi, ${countriesData[targetCountryId].name} ülkesine savaş ilan etti!`, 'danger');
                    changeNuts2ColorForConflict(targetCountryId, 'darkviolet'); // AI tarafından saldırılan ülkeler mor
                }
            }
        }
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
