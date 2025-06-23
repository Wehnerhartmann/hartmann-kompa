async function searchProduct() {
    const input = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!input) {
        resultsDiv.innerHTML = "<p>Bitte eine Artikelnummer eingeben.</p>";
        return;
    }

    const response = await fetch("data/hartmann_sauber.json");
    const data = await response.json();

    const matches = data
        .map(product => {
            const score = similarity(input, product.Artikelnummer.toString());
            return { ...product, score };
        })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
        resultsDiv.innerHTML = "<p>❌ Kein passendes Produkt gefunden.</p>";
    } else {
        let html = "<h2>Gefundene Treffer:</h2><table><tr><th>Produktgruppe</th><th>Artikelnummer</th><th>PZN</th><th>Größe</th><th>Ähnlichkeit (%)</th></tr>";
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