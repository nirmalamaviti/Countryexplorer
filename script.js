const API_URL = "https://restcountries.com/v3.1";
let countries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

window.onload = () => {
    fetchCountries();
    renderFavorites();
};

async function fetchCountries() {
    try {
        const response = await fetch(`${API_URL}/all`);
        countries = await response.json();
        renderCountryList();
        populateLanguageOptions();
    } catch (error) {
        console.error("Error fetching countries:", error);
    }
}

function populateLanguageOptions() {
    const languageFilter = document.getElementById("languageFilter");
    const languages = new Set();

    countries.forEach(country => {
        if (country.languages) {
            Object.values(country.languages).forEach(lang => languages.add(lang));
        }
    });

    languages.forEach(lang => {
        const option = document.createElement("option");
        option.value = lang;
        option.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
        languageFilter.appendChild(option);
    });
}

function renderCountryList(filteredCountries = countries) {
    const countryList = document.getElementById("countryList");
    countryList.innerHTML = filteredCountries
        .map(country => `
            <div class="country-card">
                <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
                <p>${country.name.common}</p>
                <button onclick="showCountryDetails('${country.cca3}')">View Details</button>
                <span class="favorite-icon" onclick="toggleFavorite('${country.cca3}')">
                    <i class="${isFavorite(country.cca3) ? 'fas fa-heart' : 'far fa-heart'}"></i>
                </span>
            </div>
        `)
        .join("");
}

function showCountryDetails(countryCode) {
    const country = countries.find(c => c.cca3 === countryCode);
    if (!country) return;

    const details = document.getElementById("countryInfo");
    details.innerHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.png}" alt="Flag of ${country.name.common}" style="width: 200px; height: auto;">
        <p><strong>Capital:</strong> ${country.capital}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Area:</strong> ${country.area.toLocaleString()} km²</p>
        <p><strong>Languages:</strong> ${Object.values(country.languages).join(", ")}</p>
        <button onclick="toggleFavorite('${country.cca3}')">
            <i class="${isFavorite(country.cca3) ? 'fas fa-heart' : 'far fa-heart'}"></i> 
            ${isFavorite(country.cca3) ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
    `;
    document.getElementById("countryDetails").style.display = "block";
}

function closeDetails() {
    document.getElementById("countryDetails").style.display = "none";
}

document.getElementById("searchBtn").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value;
    if (!query) return;

    try {
        const response = await fetch(`${API_URL}/name/${query}`);
        const searchResults = await response.json();
        renderCountryList(searchResults);
    } catch (error) {
        console.error("Search failed:", error);
    }
});

function toggleFavorite(countryCode) {
    if (isFavorite(countryCode)) {
        favorites = favorites.filter(code => code !== countryCode);
    } else {
        favorites.push(countryCode);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
    renderCountryList();
    showCountryDetails(countryCode);
}

function renderFavorites() {
    const favoriteList = document.getElementById("favoritesList");
    favoriteList.innerHTML = favorites
        .map(code => {
            const country = countries.find(c => c.cca3 === code);
            return country ? `
                <li onclick="showCountryDetails('${country.cca3}')">
                    ${country.name.common}
                    <span class="remove-favorite" onclick="removeFavorite(event, '${country.cca3}')">&times;</span>
                </li>
            ` : "";
        })
        .join("");
}

function removeFavorite(event, countryCode) {
    event.stopPropagation();
    favorites = favorites.filter(code => code !== countryCode);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
}

function isFavorite(countryCode) {
    return favorites.includes(countryCode);
}

function openFavoritesList() {
    renderFavorites();
    document.getElementById("favoritesModal").style.display = "block";
}

function closeFavoritesList() {
    document.getElementById("favoritesModal").style.display = "none";
}
