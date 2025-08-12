// src/routes/carrierLines.ts
import { Router } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { db } from '../config/db';

type CarrierLine = {
  id: number;
  lob: string;
  carrier: string;
  state: string;   // 2-letter code
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
};

const router = Router();

/* ───────────────────────────────
   Estados permitidos (50 + DC)
   Si quieres territorios, agrégalos aquí y en DB (tabla states si usas FK).
─────────────────────────────── */
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
] as const;

const STATE_MAP: Record<string, string> = {
  GE: 'GA',
  IO: 'IA',
  SO: 'SC',
  WE: 'WV',
  TE: 'TX', // <-- cambia a 'TN' si tu fuente es Tennessee
  NO: 'NC', // <-- cambia a 'ND' si era North Dakota
  VI: 'VA', // <-- si realmente era US Virgin Islands, agrega 'VI' a US_STATES y a tu DB
};

function normalizeState(raw?: string): string {
  const s = String(raw ?? '').trim().toUpperCase().slice(0, 2);
  const mapped = STATE_MAP[s] ?? s;
  return mapped;
}

function isValidState(code: string): boolean {
  return US_STATES.includes(code as (typeof US_STATES)[number]);
}

function normalizeStatus(raw?: string): 'active' | 'inactive' {
  return raw === 'inactive' ? 'inactive' : 'active';
}

/* ───────────────────────────────
   Crea la tabla si no existe (cómodo para Render / primeros despliegues)
─────────────────────────────── */
async function ensureTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS carrier_lines (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      lob VARCHAR(32) NOT NULL,
      carrier VARCHAR(128) NOT NULL,
      state CHAR(2) NOT NULL,
      status ENUM('active','inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_lob_carrier_state (lob, carrier, state)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}
ensureTable().catch((e) => {
  console.error('❌ carrier_lines ensureTable error:', e?.message || e);
});

/* ───────────────────────────────
   GET /api/carrier-lines
   Filtros: ?lob=ACA&state=FL&carrier=Ambetter&q=amb&status=active
   Paginación: ?page=1&perPage=50
   Orden: ?orderBy=carrier|lob|state|status&orderDir=asc|desc
─────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const {
      lob,
      state,
      carrier,
      q,
      status,
      page = '1',
      perPage = '100',
      orderBy = 'lob',
      orderDir = 'asc',
    } = req.query as Record<string, string>;

    const where: string[] = [];
    const params: Record<string, any> = {};

    if (lob) {
      where.push('lob = :lob');
      params.lob = String(lob).trim();
    }
    if (state) {
      const st = normalizeState(state);
      if (!isValidState(st)) {
        return res.status(400).json({ message: `Estado inválido: ${state}` });
      }
      where.push('state = :state');
      params.state = st;
    }
    if (carrier) {
      where.push('carrier = :carrier');
      params.carrier = String(carrier).trim();
    }
    if (status) {
      const st = normalizeStatus(status);
      where.push('status = :status');
      params.status = st;
    }
    if (q) {
      where.push(`(carrier LIKE :q OR state LIKE :q OR lob LIKE :q)`);
      params.q = `%${q}%`;
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const allowedOrderBy = new Set(['lob', 'carrier', 'state', 'status']);
    const ob = allowedOrderBy.has(orderBy) ? orderBy : 'lob';
    const od = String(orderDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const per = Math.min(500, Math.max(1, parseInt(perPage || '100', 10)));
    const offset = (pageNum - 1) * per;

    // total
    const [countRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM carrier_lines ${whereSQL}`,
      params
    );
    const total = Number((countRows?.[0] as any)?.total || 0);

    // items
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT id, lob, carrier, state, status, created_at, updated_at
      FROM carrier_lines
      ${whereSQL}
      ORDER BY ${ob} ${od}, carrier ASC, state ASC
      LIMIT :limit OFFSET :offset
      `,
      { ...params, limit: per, offset }
    );

    res.json({
      items: rows as CarrierLine[],
      total,
      page: pageNum,
      perPage: per,
    });
  } catch (err: any) {
    console.error('GET /carrier-lines error:', err);
    res.status(500).json({ message: 'Error fetching carrier lines', error: err?.message || String(err) });
  }
});

/* ───────────────────────────────
   GET /api/carrier-lines/meta
   Listas únicas de LOBs, estados y carriers
─────────────────────────────── */
router.get('/meta', async (_req, res) => {
  try {
    const [lobs] = await db.execute<RowDataPacket[]>(`SELECT DISTINCT lob FROM carrier_lines ORDER BY lob ASC`);
    const [states] = await db.execute<RowDataPacket[]>(`SELECT DISTINCT state FROM carrier_lines ORDER BY state ASC`);
    const [carriers] = await db.execute<RowDataPacket[]>(`SELECT DISTINCT carrier FROM carrier_lines ORDER BY carrier ASC`);

    res.json({
      lobs: (lobs || []).map((r) => r.lob as string),
      states: (states || []).map((r) => r.state as string),
      carriers: (carriers || []).map((r) => r.carrier as string),
    });
  } catch (err: any) {
    console.error('GET /carrier-lines/meta error:', err);
    res.status(500).json({ message: 'Error fetching carrier-lines meta', error: err?.message || String(err) });
  }
});

/* ───────────────────────────────
   POST /api/carrier-lines
   body: { lob, carrier, state, status? }
─────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { lob, carrier, state, status } = req.body as Partial<CarrierLine>;

    if (!lob || !carrier || !state) {
      return res.status(400).json({ message: 'lob, carrier y state son obligatorios' });
    }

    const normalized = {
      lob: String(lob).trim(),
      carrier: String(carrier).trim(),
      state: normalizeState(state),
      status: normalizeStatus(status),
    };

    if (!isValidState(normalized.state)) {
      return res.status(400).json({ message: `Estado inválido: ${state}` });
    }

    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO carrier_lines (lob, carrier, state, status)
      VALUES (:lob, :carrier, :state, :status)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
      `,
      normalized
    );

    let id = result.insertId;
    if (!id) {
      const [row] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM carrier_lines WHERE lob=:lob AND carrier=:carrier AND state=:state`,
        normalized
      );
      id = Number(row?.[0]?.id || 0);
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, lob, carrier, state, status, created_at, updated_at FROM carrier_lines WHERE id = :id`,
      { id }
    );

    res.status(201).json(rows?.[0] || { id, ...normalized });
  } catch (err: any) {
    console.error('POST /carrier-lines error:', err);
    res.status(500).json({ message: 'Error creating carrier line', error: err?.message || String(err) });
  }
});

/* ───────────────────────────────
   PUT /api/carrier-lines/:id
   body: { lob?, carrier?, state?, status? }
─────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const { lob, carrier, state, status } = req.body as Partial<CarrierLine>;

    const sets: string[] = [];
    const params: Record<string, any> = { id };

    if (lob !== undefined) { sets.push('lob = :lob'); params.lob = String(lob).trim(); }
    if (carrier !== undefined) { sets.push('carrier = :carrier'); params.carrier = String(carrier).trim(); }
    if (state !== undefined) {
      const st = normalizeState(state);
      if (!isValidState(st)) return res.status(400).json({ message: `Estado inválido: ${state}` });
      sets.push('state = :state'); params.state = st;
    }
    if (status !== undefined) {
      const st = normalizeStatus(status);
      sets.push('status = :status'); params.status = st;
    }

    if (sets.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    await db.execute<ResultSetHeader>(
      `UPDATE carrier_lines SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
      params
    );

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, lob, carrier, state, status, created_at, updated_at FROM carrier_lines WHERE id = :id`,
      { id }
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err: any) {
    console.error('PUT /carrier-lines/:id error:', err);
    res.status(500).json({ message: 'Error updating carrier line', error: err?.message || String(err) });
  }
});

/* ───────────────────────────────
   PATCH /api/carrier-lines/:id/toggle-status
─────────────────────────────── */
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    await db.execute<ResultSetHeader>(
      `UPDATE carrier_lines
       SET status = IF(status='active','inactive','active'),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = :id`,
      { id }
    );

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, lob, carrier, state, status, created_at, updated_at FROM carrier_lines WHERE id = :id`,
      { id }
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err: any) {
    console.error('PATCH /carrier-lines/:id/toggle-status error:', err);
    res.status(500).json({ message: 'Error toggling status', error: err?.message || String(err) });
  }
});

/* ───────────────────────────────
   PATCH /api/carrier-lines/:id/status
   body: { status: 'active' | 'inactive' }
─────────────────────────────── */
router.patch('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const st = normalizeStatus((req.body || {}).status);
    await db.execute<ResultSetHeader>(
      `UPDATE carrier_lines SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
      { id, status: st }
    );

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, lob, carrier, state, status, created_at, updated_at FROM carrier_lines WHERE id = :id`,
      { id }
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err: any) {
    console.error('PATCH /carrier-lines/:id/status error:', err);
    res.status(500).json({ message: 'Error updating status', error: err?.message || String(err) });
  }
});

/* ───────────────────────────────
   DELETE /api/carrier-lines/:id
─────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM carrier_lines WHERE id = :id`,
      { id }
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });

    res.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE /carrier-lines/:id error:', err);
    res.status(500).json({ message: 'Error deleting carrier line', error: err?.message || String(err) });
  }
});

export default router;
