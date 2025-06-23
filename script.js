
document.getElementById("matchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const searchQuery = document.getElementById("searchQuery").value.toLowerCase();
  const matchQuery = document.getElementById("matchQuery").value;

  document.getElementById("results").innerHTML = "⏳ Suche läuft ...";

  fetch("hartmann_sauber_textmatch.json")
    .then((response) => response.json())
    .then((products) => {
      const matched = products.map((product) => {
        let score = 0;

        if (product.Artikelnummer?.toString() === matchQuery.trim()) {
          score += 50;
        }

        if (product.Suchtext?.toLowerCase().includes(searchQuery)) {
          score += 50;
        }

        return { ...product, score };
      }).filter((p) => p.score > 0);

      matched.sort((a, b) => b.score - a.score);

      let resultHTML = "<h3>💊 Mögliche Hartmann-Produkte:</h3>";
      if (matched.length === 0) {
        resultHTML += "<p>❌ Kein passendes Hartmann-Produkt gefunden.</p>";
      } else {
        resultHTML += "<table><tr><th>Produktgruppe</th><th>Artikelnummer</th><th>PZN</th><th>Größe</th><th>Ähnlichkeit (%)</th></tr>";
        matched.forEach((p) => {
          resultHTML += `<tr><td>${p.Produktgruppe || ""}</td><td>${p.Artikelnummer}</td><td>${p.PZN || ""}</td><td>${p.Größe || ""}</td><td>${p.score}</td></tr>`;
        });
        resultHTML += "</table>";
      }
      document.getElementById("results").innerHTML = resultHTML;
    });
});
