/**
 * HS4S Medicatielijst
 * Persoonlijke opslag in een privé-Google-spreadsheet.
 * Deploy de webapp met toegang: Alleen ik.
 */

function setup() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('MEDICATIE_SHEET_ID');

  if (id) {
    return 'De medicatiesheet bestaat al: ' + SpreadsheetApp.openById(id).getUrl();
  }

  const ss = SpreadsheetApp.create('HS4S - Medicatie');
  const meds = ss.getSheets()[0];
  meds.setName('Medicatie');
  meds.getRange(1, 1, 1, 7).setValues([[
    'Naam', 'Hoeveelheid', 'Eenheid', 'Frequentie',
    'Innamemoment', 'Voorraad', 'Geselecteerd'
  ]]);
  meds.setFrozenRows(1);

  const catalog = ss.insertSheet('Catalogus');
  catalog.getRange(1, 1).setValue('Eigen medicatiecatalogus');
  catalog.setFrozenRows(1);

  props.setProperty('MEDICATIE_SHEET_ID', ss.getId());
  return 'Klaar! Je privé medicatiesheet is aangemaakt: ' + ss.getUrl();
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('HS4S - Mijn medicatie')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getAppData() {
  const ss = getSpreadsheet_();
  const medsSheet = ss.getSheetByName('Medicatie');
  const catalogSheet = ss.getSheetByName('Catalogus');

  const last = medsSheet.getLastRow();
  const rows = last > 1
    ? medsSheet.getRange(2, 1, last - 1, 7).getValues()
    : [];

  const medicines = rows
    .filter(r => String(r[0] || '').trim())
    .map(r => ({
      naam: String(r[0]),
      hoeveelheid: String(r[1] || ''),
      eenheid: String(r[2] || 'tabletten'),
      frequentie: String(r[3] || 'per dag'),
      moment: String(r[4] || ''),
      voorraad: String(r[5] || 'Veel'),
      geselecteerd: r[6] === true || String(r[6]).toLowerCase() === 'true'
    }));

  const catalogLast = catalogSheet.getLastRow();
  const customCatalog = catalogLast > 1
    ? catalogSheet.getRange(2, 1, catalogLast - 1, 1).getValues()
        .flat().map(v => String(v || '').trim()).filter(Boolean)
    : [];

  return { medicines: medicines, customCatalog: customCatalog };
}

function saveAppData(data) {
  if (!data || !Array.isArray(data.medicines) || !Array.isArray(data.customCatalog)) {
    throw new Error('Ongeldige gegevens ontvangen.');
  }
  if (data.medicines.length > 300 || data.customCatalog.length > 300) {
    throw new Error('De lijst bevat te veel items.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = getSpreadsheet_();
    const medsSheet = ss.getSheetByName('Medicatie');
    const catalogSheet = ss.getSheetByName('Catalogus');

    const headers = [[
      'Naam', 'Hoeveelheid', 'Eenheid', 'Frequentie',
      'Innamemoment', 'Voorraad', 'Geselecteerd'
    ]];
    medsSheet.getRange(1, 1, 1, 7).setValues(headers);

    if (medsSheet.getLastRow() > 1) {
      medsSheet.getRange(2, 1, medsSheet.getLastRow() - 1, 7).clearContent();
    }

    const rows = data.medicines
      .filter(m => m && String(m.naam || '').trim())
      .map(m => [
        String(m.naam).slice(0, 160),
        String(m.hoeveelheid || '').slice(0, 80),
        String(m.eenheid || 'tabletten').slice(0, 40),
        String(m.frequentie || 'per dag').slice(0, 40),
        String(m.moment || '').slice(0, 80),
        String(m.voorraad || 'Veel').slice(0, 30),
        Boolean(m.geselecteerd)
      ]);

    if (rows.length) {
      medsSheet.getRange(2, 1, rows.length, 7).setValues(rows);
    }

    catalogSheet.getRange(1, 1).setValue('Eigen medicatiecatalogus');
    if (catalogSheet.getLastRow() > 1) {
      catalogSheet.getRange(2, 1, catalogSheet.getLastRow() - 1, 1).clearContent();
    }

    const custom = [...new Set(data.customCatalog
      .map(v => String(v || '').trim())
      .filter(Boolean)
      .map(v => v.slice(0, 160)))];

    if (custom.length) {
      catalogSheet.getRange(2, 1, custom.length, 1).setValues(custom.map(v => [v]));
    }

    return { ok: true, savedAt: new Date().toISOString() };
  } finally {
    lock.releaseLock();
  }
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('MEDICATIE_SHEET_ID');
  if (!id) {
    throw new Error('De opslag is nog niet ingesteld. Voer eerst setup() uit in Apps Script.');
  }
  return SpreadsheetApp.openById(id);
}
