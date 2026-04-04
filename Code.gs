/**
 * TIMA GRUPO — Google Sheets Sync Backend
 * Sheet ID: 1-68Gps0LZAbgZvNmlB5i9lHVEeldVrp6bhkVfs3px7U
 *
 * This script receives data from the frontend and APPENDS rows
 * to the corresponding sheet. Data is never deleted — only accumulated.
 *
 * Hojas: Employés, Présences, Absences, Demandes Personnel,
 *        Recrutements, Uniformes, Plannings
 */

const SHEET_ID = '1-68Gps0LZAbgZvNmlB5i9lHVEeldVrp6bhkVfs3px7U';

const SHEETS = {
  'employes':    { name: 'Employés',           cols: ['id','nom','local','poste','marque','date_entree','actif','telephone','timestamp'] },
  'presences':   { name: 'Présences',          cols: ['id','employe_id','employe_nom','local','date','statut','heure','timestamp'] },
  'absences':    { name: 'Absences',           cols: ['id','employe_id','employe_nom','local','date','motif','prevenu','reporte_par','notes','timestamp'] },
  'plannings':   { name: 'Plannings',          cols: ['id','employe_id','employe_nom','local','semaine','lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche','publie','timestamp'] },
  'recrutements':{ name: 'Recrutements',       cols: ['id','nom','tel','local','poste','etape','demande_id','notes','timestamp'] },
  'demandes':    { name: 'Demandes Personnel', cols: ['id','local','poste','urgence','motif','date','statut','demande_par','timestamp'] },
  'uniformes':   { name: 'Uniformes',          cols: ['id','employe_id','employe_nom','local','taille_haut','taille_bas','pointure','casquette','statut_livraison','date_livraison','timestamp'] }
};

// ============================================================
// HELPERS
// ============================================================
function getSS() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function getOrCreateSheet(ss, cfg) {
  let sh = ss.getSheetByName(cfg.name);
  if (!sh) {
    sh = ss.insertSheet(cfg.name);
    sh.getRange(1, 1, 1, cfg.cols.length).setValues([cfg.cols]);
    sh.getRange(1, 1, 1, cfg.cols.length).setFontWeight('bold');
  } else {
    // Ensure headers exist
    const first = sh.getRange(1, 1, 1, Math.min(cfg.cols.length, sh.getLastColumn() || 1)).getValues()[0];
    if (first[0] !== cfg.cols[0]) {
      sh.getRange(1, 1, 1, cfg.cols.length).setValues([cfg.cols]);
    }
  }
  return sh;
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// doGet — health check
// ============================================================
function doGet(e) {
  return jsonOut({ ok: true, status: 'Tima RRHH Sheets Sync active', sheets: Object.keys(SHEETS) });
}

// ============================================================
// doPost — append rows to sheets (accumulate, never delete)
// ============================================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // action = "sync"
    // body.table = "employes" | "presences" | "absences" | etc.
    // body.rows = [ { col: value, ... }, ... ]  (array of objects)
    // body.row = { col: value, ... }  (single object, alternative to rows)

    if (action !== 'sync') {
      return jsonOut({ ok: false, error: 'Unknown action: ' + action });
    }

    const tableName = body.table;
    const cfg = SHEETS[tableName];
    if (!cfg) {
      return jsonOut({ ok: false, error: 'Unknown table: ' + tableName });
    }

    const ss = getSS();
    const sh = getOrCreateSheet(ss, cfg);

    // Accept single row or array of rows
    let rows = body.rows || [];
    if (body.row) rows = [body.row];

    if (!rows.length) {
      return jsonOut({ ok: false, error: 'No rows provided' });
    }

    // Add timestamp to each row
    const ts = new Date().toISOString();

    // Convert objects to arrays matching column order
    const values = rows.map(r => {
      return cfg.cols.map(col => {
        if (col === 'timestamp') return ts;
        return r[col] !== undefined ? r[col] : '';
      });
    });

    // Append all rows at once (efficient)
    const lastRow = sh.getLastRow();
    sh.getRange(lastRow + 1, 1, values.length, cfg.cols.length).setValues(values);

    return jsonOut({ ok: true, appended: values.length, table: cfg.name });

  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }
}
