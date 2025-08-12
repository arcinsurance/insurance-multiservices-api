// routes/carrierCatalog.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Archivo de seed opcional (pon el JSON que generamos)
const DATA_PATH = path.join(process.cwd(), 'data', 'carrier_catalog.json');

// Estructura en memoria (se puede reemplazar por DB)
type Row = { id: string; lob: string; carrier: string; state: string };
let rows: Row[] = [];

// Carga inicial desde JSON si existe
try {
  if (fs.existsSync(DATA_PATH)) {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const json = JSON.parse(raw);
    if (Array.isArray(json)) rows = json;
  }
} catch (e) {
  console.error('Error reading carrier_catalog.json', e);
}

// Helpers
const makeId = (lob: string, carrier: string, state: string) =>
  `${lob}|${carrier}|${state}`.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase().slice(0, 80);

// GET all
router.get('/', (_req, res) => {
  res.json(rows);
});

// POST create
router.post('/', (req, res) => {
  const { lob, carrier, state } = req.body || {};
  if (!lob || !carrier || !state) return res.status(400).json({ message: 'lob, carrier, state are required' });

  const id = makeId(lob, carrier, state);
  if (rows.find(r => r.id === id)) return res.status(409).json({ message: 'Mapping already exists' });

  const row: Row = { id, lob, carrier, state: String(state).toUpperCase() };
  rows.unshift(row);
  res.json(row);
});

// PUT update
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const idx = rows.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });

  const { lob, carrier, state } = req.body || {};
  const updated: Row = {
    id,
    lob: lob ?? rows[idx].lob,
    carrier: carrier ?? rows[idx].carrier,
    state: state ? String(state).toUpperCase() : rows[idx].state,
  };

  rows[idx] = updated;
  res.json(updated);
});

// DELETE
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const before = rows.length;
  rows = rows.filter(r => r.id !== id);
  if (rows.length === before) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

export default router;
