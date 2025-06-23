async function searchProduct() {
    const searchInput = document.getElementById("searchQuery").value.trim();
    const matchInput = document.getElementById("matchQuery").value.trim();
    const competitorDiv = document.getElementById("competitorResult");
    const resultsDiv = document.getElementById("results");

    competitorDiv.innerHTML = "";
    resultsDiv.innerHTML = "";

    if (!searchInput || !matchInput) {
        resultsDiv.innerHTML = "<p>Bitte beide Felder ausfüllen.</p>";
        return;
    }

    // Websuche mit Freitext
    const apiKey = "AIzaSyBbuUnPSZIsEHREH_EssqVEk8UwKzTbk5c";
    const cx = "a761bd25fa04947ce";
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchInput)}`;

    try {
        const webResponse = await fetch(searchUrl);
        const webData = await webResponse.json();
        const item = webData.items?.[0];
        if (item) {
            competitorDiv.innerHTML = `
                <h3>🔎 Wettbewerbsprodukt:</h3>
                <p><strong>Titel:</strong> ${item.title}</p>
                <p><strong>Snippet:</strong> ${item.snippet}</p>
                <p><strong>Quelle:</strong> <a href="${item.link}" target="_blank">${item.link}</a></p>
            `;
        } else {
            competitorDiv.innerHTML = "<p>❌ Kein Wettbewerbsprodukt gefunden.</p>";
        }
    } catch (e) {
        competitorDiv.innerHTML = "<p>⚠️ Fehler bei der Websuche.</p>";
    }

    // Lokales Matching mit Artikelnummer
    const localResponse = await fetch("hartmann_sauber.json");
    const data = await localResponse.json();

    const matches = data
        .map(product => {
            const score = similarity(matchInput.toString(), product.Artikelnummer.toString());
            return { ...product, score };
        })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
        resultsDiv.innerHTML = "<p>❌ Kein passendes Hartmann-Produkt gefunden.</p>";
    } else {
        let html = "<h2>💊 Mögliche Hartmann-Produkte:</h2><table><tr><th>Produktgruppe</th><th>Artikelnummer</th><th>PZN</th><th>Größe</th><th>Ähnlichkeit (%)</th></tr>";
        matches.forEach(match => {
            html += `<tr><td>${match.Produktgruppe}</td><td>${match.Artikelnummer}</td><td>${match.PZN}</td><td>${match.Größe}</td><td>${(match.score * 100).toFixed(1)}%</td></tr>`;
        });
        html += "</table>";
        resultsDiv.innerHTML = html;
    }
}

function similarity(a, b) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = Array(s2.length + 1).fill().map((_, i) => i);
    for (let i = 1; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 1; j <= s2.length; j++) {
            let newValue = costs[j - 1];
            if (s1[i - 1] !== s2[j - 1]) {
                newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
        }
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
