
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("search-button");
    const queryInput = document.getElementById("query");
    const articleInput = document.getElementById("article-number");
    const competitorDiv = document.getElementById("competitor-result");
    const resultsBody = document.getElementById("results-body");

    searchButton.addEventListener("click", async () => {
        const query = queryInput.value.trim();
        const articleNumber = articleInput.value.trim();

        competitorDiv.innerHTML = "⏳ Suche läuft...";
        resultsBody.innerHTML = "";

        let competitorTitle = "";
        let competitorSnippet = "";
        let competitorLink = "";

        try {
            const apiKey = "AIzaSyBbuUnPSZIsEHREH_EssqVEk8UwKzTbk5c";
            const cx = "a761bd25fa04947ce";
            const response = await fetch(
                `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const topResult = data.items[0];
                competitorTitle = topResult.title || "";
                competitorSnippet = topResult.snippet || "";
                competitorLink = topResult.link || "";
            } else {
                competitorDiv.innerHTML = "❌ Kein Wettbewerbsprodukt gefunden.";
            }
        } catch (error) {
            competitorDiv.innerHTML = "❌ Fehler bei der Websuche.";
            return;
        }

        if (competitorTitle) {
            competitorDiv.innerHTML = `
                <p><strong>Titel:</strong> ${competitorTitle}</p>
                <p><strong>Snippet:</strong> ${competitorSnippet}</p>
                <p><strong>Quelle:</strong> <a href="${competitorLink}" target="_blank">${competitorLink}</a></p>
            `;
        }

        try {
            const response = await fetch("hartmann_sauber_textmatch_final.json");
            const hartmannData = await response.json();

            const input = `${query} ${articleNumber}`.toLowerCase();
            const scored = hartmannData.map((item) => {
                const vergleichswert = item.Suchtext.toLowerCase();
                const treff = vergleichswert.includes(query.toLowerCase()) || vergleichswert.includes(articleNumber);
                let score = 0;

                if (treff) score += 50;
                if (vergleichswert.includes(query.toLowerCase())) score += 25;
                if (vergleichswert.includes(articleNumber)) score += 25;

                return { ...item, score };
            });

            const top5 = scored
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            if (top5.length === 0) {
                resultsBody.innerHTML = "<tr><td colspan='6'>❌ Kein passendes Hartmann-Produkt gefunden.</td></tr>";
            } else {
                top5.forEach((item) => {
                    const link = item.Artikelnummer
                        ? `https://hartmann.info/de-de/search?q=${item.Artikelnummer}`
                        : "#";
                    resultsBody.innerHTML += `
                        <tr>
                            <td>${item.Produktgruppe}</td>
                            <td>${item.Artikelnummer}</td>
                            <td>${item.PZN}</td>
                            <td>${item.Größe}</td>
                            <td>${item.score}%</td>
                            <td><a href="${link}" target="_blank">Link</a></td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            resultsBody.innerHTML = "<tr><td colspan='6'>❌ Fehler beim Laden der Hartmann-Daten.</td></tr>";
        }
    });
});
