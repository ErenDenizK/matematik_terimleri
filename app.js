// -------------------------
// Dinamik JSON Yükleme ve Listeleme
// -------------------------

/**
 * Belirtilen JSON dosyasını yükler ve listeyi oluşturur.
 * @param {string} fileName - Yüklenecek JSON dosyasının adı
 */
async function loadJsonAndGenerateList(fileName) {
    try {
        console.log(`JSON Yükleniyor: ${fileName}`); // Yükleme yolunu kontrol et
        const response = await fetch(fileName); // JSON dosyasını yükle
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json(); // Veriyi JSON formatına çevir
        const sortedData = data.sort((a, b) => a.isim.localeCompare(b.isim)); // Alfabetik sıraya göre sırala
        console.log("Yüklenen JSON Verisi:", sortedData); // Veriyi kontrol et
        generateHTML(sortedData); // HTML içeriği oluştur
    } catch (error) {
        console.error(`JSON dosyası (${fileName}) yüklenirken bir hata oluştu:`, error);
    }
}

/**
 * JSON verilerini HTML olarak listeye dönüştürür.
 * @param {Array} kavramlar - JSON'dan gelen kavramlar
 */
function generateHTML(kavramlar) {
    const container = document.getElementById("list-container");
    container.innerHTML = ''; // Mevcut içeriği temizle
    let currentLetter = null;

    kavramlar.forEach(({ isim, tanim, link }) => {
        const firstLetter = isim[0].toUpperCase();

        // Alfabetik başlıkları ekler
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            const segmentHeader = document.createElement("h2");
            segmentHeader.textContent = currentLetter;
            container.appendChild(segmentHeader);
        }

        // Kavramları listeye ekler
        const listItem = document.createElement("li");
        listItem.innerHTML = `<b>${isim}:</b> ${tanim} (<a href="${link}" target="_blank">Wikipedia</a>)`;
        container.appendChild(listItem);
    });
}

// -------------------------
// Highlight Özelliği
// -------------------------

/**
 * Metindeki arama terimini vurgulamak için kullanılacak fonksiyon.
 * @param {string} text - İçeriğin tamamı.
 * @param {string} query - Arama kelimesi.
 * @returns {string} - Vurgulanan HTML içeriği.
 */
function highlightText(text, query) {
    if (!query) return text; // Eğer arama kelimesi boşsa, metni olduğu gibi döndür.
    const regex = new RegExp(`(${query})`, 'gi'); // Büyük/küçük harf duyarsız arama
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// -------------------------
// Dinamik Arama Özelliği
// -------------------------

/**
 * Arama kutusu için filtreleme işlevi
 */
function setupSearch() {
    const searchInput = document.querySelector('.search-input'); // Arama kutusunu seç
    const listContainer = document.getElementById("list-container"); // Liste konteynerini seç
    const fileName = document.body.dataset.file; // JSON dosya yolunu al

    searchInput.addEventListener('keyup', async (event) => {
        const query = event.target.value.toLowerCase(); // Arama terimini küçük harfe çevir

        try {
            const response = await fetch(fileName); // JSON dosyasını tekrar yükle
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json(); // JSON verilerini çöz
            if (!query) {
                // Eğer arama kutusu boşsa, tüm listeyi tekrar göster
                generateHTML(data.sort((a, b) => a.isim.localeCompare(b.isim)));
                return;
            }

            // Veriyi filtrele
            const filteredData = data.filter((item) =>
                item.isim.toLowerCase().includes(query) || item.tanim.toLowerCase().includes(query)
            );

            // Listeyi güncelle
            listContainer.innerHTML = ''; // Mevcut içeriği temizle
            filteredData.forEach(({ isim, tanim, link }) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <b>${highlightText(isim, query)}:</b> 
                    ${highlightText(tanim, query)} 
                    (<a href="${link}" target="_blank">Wikipedia</a>)
                `;
                listContainer.appendChild(listItem);
            });

            // Eğer sonuç bulunmazsa mesaj göster
            if (filteredData.length === 0) {
                listContainer.innerHTML = '<p>Sonuç bulunamadı.</p>';
            }
        } catch (error) {
            console.error("Arama sırasında hata oluştu:", error); // Hataları konsola yazdır
        }
    });
}

/**
 * Metindeki arama terimini vurgulamak için kullanılacak fonksiyon.
 * @param {string} text - İçeriğin tamamı.
 * @param {string} query - Arama kelimesi.
 * @returns {string} - Vurgulanan HTML içeriği.
 */
function highlightText(text, query) {
    if (!query) return text; // Eğer arama kelimesi boşsa, metni olduğu gibi döndür
    const regex = new RegExp(`(${query})`, 'gi'); // Arama kelimesini vurgulamak için regex
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// -------------------------
// Arama Menüsü Tıklama ve Hover Özelliği
// -------------------------

/**
 * Arama menüsü tıklama veya hover ile açılma işlevi
 */
function setupSearchMenu() {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');

    // Hover etkisini kaldırmadan open/close işlevselliği ekle
    searchContainer.addEventListener('mouseenter', () => {
        searchContainer.classList.add('active');
        searchInput.focus();
    });

    searchContainer.addEventListener('mouseleave', () => {
        if (!searchInput.value) { // Eğer kutuda yazı yoksa
            searchContainer.classList.remove('active');
        }
    });

    searchInput.addEventListener('input', () => {
        if (searchInput.value) {
            searchContainer.classList.add('active');
        } else {
            searchContainer.classList.remove('active'); // Metin silinirse kapanabilir
        }
    });
}


// -------------------------
// Aktif Navigasyon Bağlantısı Ayarlama
// -------------------------

/**
 * Navigasyon menüsünde aktif bağlantıyı ayarlar.
 */
function setActiveNav() {
    const navLinks = document.querySelectorAll('.nav-container nav a'); // Navigasyon bağlantılarını seç
    const currentPath = window.location.pathname.replace(/\/$/, ""); // URL sonundaki slash'i kaldır

    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, ""); // Bağlantının tam yolunu al
        if (currentPath === linkPath) {
            link.classList.add('active'); // Aktif bağlantıya sınıf ekle
        } else {
            link.classList.remove('active'); // Diğerlerinden kaldır
        }
    });
}


// -------------------------
// Hoş Geldiniz Ekranı Yönetimi
// -------------------------

/**
 * Hoş geldiniz ekranını yönetir.
 */
function manageWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');

    if (!welcomeScreen) return; // Eğer hoş geldiniz ekranı yoksa çık

    // Hoş geldiniz ekranını 1.5 saniye sonra gizle
    setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Sayfa kaydırma geri açılır
    }, 1500);
}

// -------------------------
// Başlangıç Fonksiyonları
// -------------------------

/**
 * Sayfa yüklendiğinde çalışacak ana fonksiyon
 */
function initialize() {
    const fileName = document.body.dataset.file; // Hangi JSON dosyasını kullanacağınızı belirleyin
    console.log(`Başlangıç için JSON dosyası: ${fileName}`); // Dosya yolunu kontrol et
    loadJsonAndGenerateList(fileName); // JSON yükle ve listeyi oluştur
    setupSearch(); // Arama kutusunu başlat
    setupSearchMenu(); // Arama menüsünü başlat
    setActiveNav(); // Aktif navigasyon bağlantısını ayarla
    manageWelcomeScreen(); // Hoş geldiniz ekranını yönet
}

// Başlangıç
initialize();