
function calculateSimilarity(input, target) {
  const inputWords = input.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);
  const common = inputWords.filter(word => targetWords.includes(word));
  return (common.length / inputWords.length) * 100;
}

document.getElementById("matchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const searchQuery = document.getElementById("searchQuery").value.trim().toLowerCase();
  const matchQuery = document.getElementById("matchQuery").value.trim();

  document.getElementById("results").innerHTML = "⏳ Suche läuft ...";

  fetch("hartmann_sauber_textmatch.json")
    .then((response) => response.json())
    .then((products) => {
      const matched = products.map((product) => {
        let score = 0;

        if (product.Artikelnummer?.toString() === matchQuery) {
          score += 50;
        }

        if (product.Suchtext) {
          score += calculateSimilarity(searchQuery, product.Suchtext);
        }

        return { ...product, score: Math.round(score) };
      }).filter((p) => p.score > 0);

      matched.sort((a, b) => b.score - a.score);

      const top5 = matched.slice(0, 5);

      let resultHTML = "<h3>💊 Top 5 Hartmann-Produkte:</h3>";
      if (top5.length === 0) {
        resultHTML += "<p>❌ Kein passendes Hartmann-Produkt gefunden.</p>";
      } else {
        resultHTML += "<table><tr><th>Produktgruppe</th><th>Artikelnummer</th><th>PZN</th><th>Größe</th><th>Ähnlichkeit (%)</th><th>Link</th></tr>";
        top5.forEach((p) => {
          const linkHTML = p.Link ? `<a href='${p.Link}' target='_blank'>🔗</a>` : "";
          resultHTML += `<tr><td>${p.Produktgruppe || ""}</td><td>${p.Artikelnummer}</td><td>${p.PZN || ""}</td><td>${p.Größe || ""}</td><td>${p.score}</td><td>${linkHTML}</td></tr>`;
        });
        resultHTML += "</table>";
      }
      document.getElementById("results").innerHTML = resultHTML;
    });
});
