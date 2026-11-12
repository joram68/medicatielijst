# HS4S Medicatielijst

Responsive persoonlijke medicatielijst voor Mac, iPhone en iPad.

## Bestanden
- `index.html` – interface en afdrukweergave (ticket/A4).
- `Code.gs` – Google Apps Script backend voor privéopslag in Google Sheets.

## Eenmalige installatie
1. Maak een nieuw Google Apps Script-project aan via https://script.google.com/.
2. Plak de inhoud van `Code.gs` in het scriptbestand.
3. Maak een HTML-bestand met de naam `index` (zonder .html) en plak de inhoud van `index.html`.
4. Selecteer in Apps Script de functie `setup` en klik op Uitvoeren. Geef de gevraagde Google-toestemming. Dit maakt een privéspreadsheet met tabbladen `Medicatie` en `Catalogus`.
5. Kies Implementeren → Nieuwe implementatie → Webapp.
6. Voer uit als: **Ik**. Toegang: **Alleen ik**. Implementeer en kopieer de webapp-URL.
7. Open die URL op je Mac, iPhone en iPad met hetzelfde Google-account.

## Privacy
- Plaats nooit patiëntgegevens, medicijngegevens, spreadsheet-ID's of geheimen in deze GitHub-repository.
- Houd de Google Apps Script-webapp beperkt tot **Alleen ik**.
- De gegevens worden opgeslagen in een spreadsheet in je eigen Google Drive.

GitHub bewaart de broncode. De Apps Script-webapp is de live toepassing omdat die de Google Sheets-koppeling veilig kan uitvoeren.
