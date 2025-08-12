// src/utils/seedCarrierLines.ts
import path from 'path';
import * as xlsx from 'xlsx';
import { db } from '../config/db';

type Row = {
  LOB?: string;
  Lob?: string;
  lob?: string;

  Carrier?: string;
  carrier?: string;

  State?: string;
  STATE?: string;
  state?: string;

  Status?: string;
  status?: string;
};

function pick(o: any, keys: string[], fb = ''): string {
  for (const k of keys) {
    if (o && o[k] != null && String(o[k]).trim() !== '') return String(o[k]).trim();
  }
  return fb;
}

function normalizeLOB(v: string): string {
  const t = (v || '').trim();
  if (!t) return '';
  const up = t.toLowerCase();
  if (up.startsWith('aca')) return 'ACA';
  if (up.startsWith('medicare')) return 'Medicare';
  if (up.startsWith('life')) return 'Life';
  if (up.startsWith('supp')) return 'Supplementary';
  // deja tal cual si no coincide
  return t;
}

function normalizeState(v: string): string {
  const t = (v || '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(t)) return t;
  // intenta extraer 2 letras (por si viene "FL - Florida")
  const m = t.match(/\b[A-Z]{2}\b/);
  return m ? m[0] : t.slice(0, 2);
}

function normalizeStatus(v: string): 'active' | 'inactive' {
  const up = (v || '').trim().toLowerCase();
  if (up === 'inactive' || up === 'inactivo' || up === '0' || up === 'false') return 'inactive';
  return 'active';
}

export async function seedCarrierLines(filePathFromEnv?: string) {
  const filePath =
    filePathFromEnv ||
    process.env.CARRIERS_XLSX_PATH ||
    path.join(process.cwd(), 'Carriers.xlsx'); // /opt/render/project/src/Carriers.xlsx

  console.log(`📄 Leyendo Excel de carriers desde: ${filePath}`);

  const wb = xlsx.readFile(filePath, { cellDates: false });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<Row>(ws, { defval: '' });

  console.log(`📊 Filas detectadas en "${sheetName}": ${rows.length}`);

  const mappings: Array<{ lob: string; carrier: string; state: string; status: 'active' | 'inactive' }> = [];

  for (const r of rows) {
    const lobRaw = pick(r, ['LOB', 'Lob', 'lob']);
    const carrierRaw = pick(r, ['Carrier', 'carrier']);
    const stateRaw = pick(r, ['State', 'STATE', 'state']);
    const statusRaw = pick(r, ['Status', 'status'], 'active');

    const lob = normalizeLOB(lobRaw);
    const carrier = (carrierRaw || '').trim();
    const state = normalizeState(stateRaw);
    const status = normalizeStatus(statusRaw);

    if (!lob || !carrier || !state) continue; // ignora filas incompletas
    mappings.push({ lob, carrier, state, status });
  }

  console.log(`✅ Registros válidos a insertar/actualizar: ${mappings.length}`);
  if (mappings.length === 0) {
    console.log('Nada por insertar. Salimos.');
    return;
  }

  // Inserción en lotes con ON DUPLICATE KEY UPDATE (necesita UNIQUE(lob, carrier, state))
  const chunkSize = 200;
  let inserted = 0;

  for (let i = 0; i < mappings.length; i += chunkSize) {
    const chunk = mappings.slice(i, i + chunkSize);

    const placeholders = chunk.map(() => '(?,?,?,?)').join(',');
    const flatValues: any[] = [];
    chunk.forEach((m) => {
      flatValues.push(m.lob, m.carrier, m.state, m.status);
    });

    const sql = `
      INSERT INTO carrier_lines (lob, carrier, state, status)
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `;

    await db.query(sql, flatValues);
    inserted += chunk.length;
    console.log(`   → Procesadas ${inserted}/${mappings.length}`);
  }

  console.log('🎉 Seed de carrier_lines finalizado.');
}
