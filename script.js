let currentPage = 1;
let currentBook = "bukhari";
let hadithData = [];
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

// 📌 হাদিসের ক্যাশিং ফিচার (API কল অপটিমাইজড)
async function fetchHadith() {
    document.getElementById("loading").style.display = "block";

    let cachedData = localStorage.getItem(currentBook);
    if (cachedData) {
        hadithData = JSON.parse(cachedData);
        displayHadith();
        document.getElementById("loading").style.display = "none";
    } else {
        try {
            let response = await fetch(`https://alquranbd.com/api/hadith/${currentBook}`);
            let data = await response.json();
            hadithData = data.hadiths;
            localStorage.setItem(currentBook, JSON.stringify(hadithData));
            displayHadith();
        } catch (error) {
            console.error("ডাটা লোডিং সমস্যা:", error);
        }
        document.getElementById("loading").style.display = "none";
    }
}

// 📜 হাদিস দেখানোর ফাংশন (বুকমার্ক ফিচার সহ)
function displayHadith() {
    const hadithContainer = document.getElementById("hadith-container");
    hadithContainer.innerHTML = "";

    let start = (currentPage - 1) * 5;
    let end = currentPage * 5;
    let paginatedHadiths = hadithData.slice(start, end);

    paginatedHadiths.forEach(hadith => {
        let isBookmarked = bookmarks.includes(hadith.id) ? "⭐" : "☆";

        const hadithDiv = document.createElement("div");
        hadithDiv.classList.add("hadith-box");
        hadithDiv.innerHTML = `
            <h4>📜 হাদিস: ${hadith.id} <button onclick="toggleBookmark(${hadith.id})">${isBookmarked}</button></h4>
            <p><strong>📖 আরবি:</strong> ${hadith.arabic}</p>
            <p><strong>🇧🇩 বাংলা:</strong> ${hadith.bangla}</p>
            <p><strong>📘 বিষয়:</strong> ${hadith.topic || "অনির্দিষ্ট"}</p>
            <button class="btn btn-success btn-sm" onclick="copyHadith('${hadith.bangla}')">📋 কপি</button>
            <button class="btn btn-primary btn-sm" onclick="shareHadith('${hadith.bangla}')">📤 শেয়ার</button>
        `;
        hadithContainer.appendChild(hadithDiv);
    });
}

// 🔍 উন্নত সার্চ (আরবি, বাংলা, ইংরেজি, ও হাদিস নম্বর)
document.getElementById("hadithNumber").addEventListener("input", function () {
    let query = this.value.toLowerCase();
    let filteredHadiths = hadithData.filter(h =>
        h.id.includes(query) || h.bangla.toLowerCase().includes(query) || 
        h.arabic.includes(query) || (h.topic && h.topic.toLowerCase().includes(query))
    );
    displaySearchedHadith(filteredHadiths);
});

function displaySearchedHadith(hadiths) {
    const hadithContainer = document.getElementById("hadith-container");
    hadithContainer.innerHTML = "";

    hadiths.forEach(hadith => {
        const hadithDiv = document.createElement("div");
        hadithDiv.classList.add("hadith-box");
        hadithDiv.innerHTML = `
            <h4>📜 হাদিস নম্বর: ${hadith.id}</h4>
            <p><strong>📖 আরবি:</strong> ${hadith.arabic}</p>
            <p><strong>🇧🇩 বাংলা:</strong> ${hadith.bangla}</p>
            <p><strong>📘 বিষয়:</strong> ${hadith.topic || "অনির্দিষ্ট"}</p>
            <button class="btn btn-success btn-sm" onclick="copyHadith('${hadith.bangla}')">📋 কপি</button>
            <button class="btn btn-primary btn-sm" onclick="shareHadith('${hadith.bangla}')">📤 শেয়ার</button>
        `;
        hadithContainer.appendChild(hadithDiv);
    });
}

// ⭐ বুকমার্ক ফাংশন
function toggleBookmark(id) {
    if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(b => b !== id);
    } else {
        bookmarks.push(id);
    }
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    displayHadith();
}

// 📋 হাদিস কপি করা
function copyHadith(text) {
    navigator.clipboard.writeText(text);
    alert("✅ হাদিস কপি হয়েছে!");
}

// 📤 হাদিস শেয়ার করা
function shareHadith(text) {
    let shareData = {
        title: "হাদিস",
        text: text,
    };
    navigator.share(shareData).catch(err => console.log(err));
}

// 🌙 ডার্ক মোড চালু করা
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

// ⬅️➡️ নেভিগেশন ফাংশন
function nextPage() {
    if (currentPage * 5 < hadithData.length) {
        currentPage++;
        displayHadith();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayHadith();
    }
}

// পেজ লোড হলে লোকাল ডাটা লোড করানো হবে
fetchHadith();
