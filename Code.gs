/**
 * TIMA GRUPO — Google Sheets Sync Backend
 * Sheet ID: 1-68Gps0LZAbgZvNmlB5i9lHVEeldVrp6bhkVfs3px7U
 *
 * Two modes:
 *   action=sync      → APPEND rows (accumulate, never delete)
 *   action=fullSync  → OVERWRITE entire sheet (full dump from Supabase)
 */

const SHEET_ID = '1-68Gps0LZAbgZvNmlB5i9lHVEeldVrp6bhkVfs3px7U';

const SHEETS = {
  'employes':    { name: 'Employés',           cols: ['id','nom','poste','poste_specifique','local','statut','date_entree','telephone','timestamp'] },
  'presences':   { name: 'Présences',          cols: ['id','employe_id','employe_nom','local','date','statut','heure','turno','cloture','timestamp'] },
  'absences':    { name: 'Absences',           cols: ['id','employe_id','employe_nom','local','date','motif','prevenu','reporte_par','notes','timestamp'] },
  'plannings':   { name: 'Plannings',          cols: ['id','employe_id','employe_nom','local','semaine','lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche','publie','timestamp'] },
  'recrutements':{ name: 'Recrutements',       cols: ['id','nom','tel','local','poste','etape','demande_id','notes','timestamp'] },
  'demandes':    { name: 'Demandes Personnel', cols: ['id','local','poste','urgence','motif','date','statut','demande_par','timestamp'] },
  'uniformes':   { name: 'Uniformes',          cols: ['id','employe_id','employe_nom','local','taille_haut','taille_bas','pointure','casquette','statut_livraison','date_livraison','timestamp'] }
};

function getSS() { return SpreadsheetApp.openById(SHEET_ID); }

function getOrCreateSheet(ss, cfg) {
  let sh = ss.getSheetByName(cfg.name);
  if (!sh) {
    sh = ss.insertSheet(cfg.name);
  }
  // Always set headers in row 1
  sh.getRange(1, 1, 1, cfg.cols.length).setValues([cfg.cols]);
  sh.getRange(1, 1, 1, cfg.cols.length).setFontWeight('bold');
  return sh;
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return jsonOut({ ok: true, status: 'Tima RRHH Sheets Sync active' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const tableName = body.table;
    const cfg = SHEETS[tableName];
    if (!cfg) return jsonOut({ ok: false, error: 'Unknown table: ' + tableName });

    const ss = getSS();
    const sh = getOrCreateSheet(ss, cfg);
    const ts = new Date().toISOString();

    let rows = body.rows || [];
    if (body.row) rows = [body.row];
    if (!rows.length) return jsonOut({ ok: false, error: 'No rows' });

    const values = rows.map(r => cfg.cols.map(col => col === 'timestamp' ? ts : (r[col] !== undefined && r[col] !== null ? r[col] : '')));

    if (action === 'fullSync') {
      // OVERWRITE: clear all data rows (keep header), then write
      const lastRow = sh.getLastRow();
      if (lastRow > 1) sh.getRange(2, 1, lastRow - 1, cfg.cols.length).clearContent();
      if (values.length) sh.getRange(2, 1, values.length, cfg.cols.length).setValues(values);
      return jsonOut({ ok: true, mode: 'fullSync', written: values.length, table: cfg.name });
    }

    if (action === 'sync') {
      // APPEND: add rows at the end
      const lastRow = sh.getLastRow();
      sh.getRange(lastRow + 1, 1, values.length, cfg.cols.length).setValues(values);
      return jsonOut({ ok: true, mode: 'append', appended: values.length, table: cfg.name });
    }

    return jsonOut({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }
}
