/**
 * TIMA GRUPO — Google Sheets Sync Backend v3
 * Sheet ID: 1-68Gps0LZAbgZvNmlB5i9lHVEeldVrp6bhkVfs3px7U
 *
 * Actions:
 *   sync      → APPEND rows (accumulate)
 *   fullSync  → OVERWRITE entire sheet (full dump from Supabase)
 *   bulkSync  → Multiple tables in one call (full dump all)
 */

const SHEET_ID = '1-68Gps0LZAbgZvNmlB5i9lHVEeldVrp6bhkVfs3px7U';

const SHEETS = {
  'employes': {
    name: 'Employes',
    cols: ['id','nom','poste','poste_specifique','local','marque','date_entree','actif','telephone','motif_depart','note_depart','timestamp']
  },
  'presences': {
    name: 'Presences',
    cols: ['id','employe_id','employe_nom','local','date','statut','heure','turno','cloture','timestamp']
  },
  'absences': {
    name: 'Absences',
    cols: ['id','employe_id','employe_nom','local','date','motif','prevenu','reporte_par','notes','timestamp']
  },
  'plannings': {
    name: 'Plannings',
    cols: ['id','employe_id','employe_nom','local','semaine','lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche','publie','timestamp']
  },
  'demandes': {
    name: 'Demandes',
    cols: ['id','local','poste','urgence','motif','date','statut','demande_par','timestamp']
  },
  'recrutements': {
    name: 'Recrutements',
    cols: ['id','nom','tel','local','poste','etape','demande_id','notes','timestamp']
  },
  'uniform_types': {
    name: 'Uniform_Types',
    cols: ['id','local','nom','description','stock_total','timestamp']
  },
  'uniform_assignments': {
    name: 'Uniform_Assign',
    cols: ['id','employee_id','employee_nom','local','uniform_type_id','uniform_nom','taille','quantite','date_livraison','date_retour','retourne','notes','timestamp']
  }
};

function getSS() { return SpreadsheetApp.openById(SHEET_ID); }

function getOrCreateSheet(ss, cfg) {
  let sh = ss.getSheetByName(cfg.name);
  if (!sh) sh = ss.insertSheet(cfg.name);
  // Always ensure headers
  if (sh.getLastColumn() < cfg.cols.length || sh.getRange(1, 1).getValue() !== cfg.cols[0]) {
    sh.getRange(1, 1, 1, cfg.cols.length).setValues([cfg.cols]);
    sh.getRange(1, 1, 1, cfg.cols.length).setFontWeight('bold');
  }
  return sh;
}

function rowsToValues(rows, cols, ts) {
  return rows.map(r => cols.map(col => {
    if (col === 'timestamp') return ts;
    const v = r[col];
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'oui' : 'non';
    return v;
  }));
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return jsonOut({ ok: true, status: 'Tima RRHH Sheets Sync v3', tables: Object.keys(SHEETS) });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ts = new Date().toISOString();
    const ss = getSS();

    // --- BULK SYNC: multiple tables at once ---
    if (action === 'bulkSync') {
      const tables = body.tables || {};
      const results = {};
      for (const [tableName, rows] of Object.entries(tables)) {
        const cfg = SHEETS[tableName];
        if (!cfg || !rows || !rows.length) { results[tableName] = 0; continue; }
        const sh = getOrCreateSheet(ss, cfg);
        // Clear data rows (keep header)
        if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, cfg.cols.length).clearContent();
        const values = rowsToValues(rows, cfg.cols, ts);
        if (values.length) sh.getRange(2, 1, values.length, cfg.cols.length).setValues(values);
        results[tableName] = values.length;
      }
      return jsonOut({ ok: true, mode: 'bulkSync', results });
    }

    // --- SINGLE TABLE OPERATIONS ---
    const tableName = body.table;
    const cfg = SHEETS[tableName];
    if (!cfg) return jsonOut({ ok: false, error: 'Unknown table: ' + tableName });

    let rows = body.rows || [];
    if (body.row) rows = [body.row];
    if (!rows.length) return jsonOut({ ok: false, error: 'No rows' });

    const sh = getOrCreateSheet(ss, cfg);
    const values = rowsToValues(rows, cfg.cols, ts);

    if (action === 'fullSync') {
      // Overwrite: clear all data, write new
      if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, cfg.cols.length).clearContent();
      if (values.length) sh.getRange(2, 1, values.length, cfg.cols.length).setValues(values);
      return jsonOut({ ok: true, mode: 'fullSync', written: values.length, table: cfg.name });
    }

    if (action === 'sync') {
      // Append
      const lastRow = sh.getLastRow();
      sh.getRange(lastRow + 1, 1, values.length, cfg.cols.length).setValues(values);
      return jsonOut({ ok: true, mode: 'append', appended: values.length, table: cfg.name });
    }

    return jsonOut({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }
}
