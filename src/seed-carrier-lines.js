/* eslint-disable no-console */
const mysql = require('mysql2/promise');
const XLSX = require('xlsx');
const path = require('path');

function env(name, fallback = '') {
  return process.env[name] ?? fallback;
}

const DB_HOST = env('DB_HOST');
const DB_PORT = Number(env('DB_PORT', '3306'));
const DB_USER = env('DB_USER');
const DB_PASSWORD = env('DB_PASSWORD');
const DB_NAME = env('DB_NAME');

// Tu Excel está en la raíz del repo con el nombre Carriers.xlsx
const XLSX_PATH = env('CARRIERS_XLSX_PATH', path.resolve('Carriers.xlsx'));

const LOB_ALLOWED = new Set(['ACA', 'Medicare', 'Life', 'Supplementary']);

function normalizeState(s) {
  if (!s) return '';
  return String(s).trim().toUpperCase().slice(0, 2);
}

function normalizeLOB(v) {
  const t = String(v || '').trim();
  if (LOB_ALLOWED.has(t)) return t;
  const m = t.toLowerCase();
  if (m === 'aca') return 'ACA';
  if (m === 'medicare') return 'Medicare';
  if (m === 'life' || m === 'life insurance') return 'Life';
  if (m.startsWith('supp')) return 'Supplementary';
  return '';
}

async function main() {
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('❌ Faltan variables de entorno DB_HOST/DB_USER/DB_NAME');
    process.exit(1);
  }

  console.log('🔌 Conectando a MySQL…');
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('📄 Leyendo Excel:', XLSX_PATH);
    const wb = XLSX.readFile(XLSX_PATH);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    // Crea tabla si no existe
    const createSQL = `
      CREATE TABLE IF NOT EXISTS carrier_lines (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        lob VARCHAR(32) NOT NULL,
        carrier VARCHAR(255) NOT NULL,
        state CHAR(2) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_lob_carrier_state (lob, carrier, state),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await conn.execute(createSQL);

    const insertSQL = `
      INSERT INTO carrier_lines (lob, carrier, state, active)
      VALUES (?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE active = VALUES(active), updated_at = CURRENT_TIMESTAMP
    `;

    let ok = 0, skipped = 0;

    for (const r of rows) {
      const lob = normalizeLOB(r.lob ?? r.LOB ?? r.line ?? r.Line);
      const carrier = String(r.carrier ?? r.Carrier ?? '').trim();
      const state = normalizeState(r.state ?? r.State);

      if (!lob || !carrier || !state) {
        skipped++;
        continue;
      }

      await conn.execute(insertSQL, [lob, carrier, state]);
      ok++;
    }

    console.log(`✅ Seed completado. Insertados/actualizados: ${ok}. Saltados: ${skipped}.`);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
