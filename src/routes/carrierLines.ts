// src/routes/carrierLines.ts
import { Router, Request, Response } from 'express';
import { db } from '../config/db';

const router = Router();

/**
 * GET /api/carrier-lines
 * Filtros opcionales:
 *  - lob: 'ACA' | 'Medicare' | 'Life' | 'Supplementary'
 *  - state: 'FL', 'TX', ...
 *  - carrier: exacto
 *  - q: búsqueda parcial (carrier/state)
 *  - active: '1' | '0'
 *  - page, pageSize
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      lob,
      state,
      carrier,
      q,
      active,
      page = '1',
      pageSize = '500',
    } = req.query as Record<string, string>;

    const where: string[] = [];
    const params: any = {};

    if (lob) { where.push('lob = :lob'); params.lob = lob; }
    if (state) { where.push('state = :state'); params.state = String(state).toUpperCase().slice(0, 2); }
    if (carrier) { where.push('carrier = :carrier'); params.carrier = carrier; }
    if (active === '0' || active === '1') { where.push('active = :active'); params.active = Number(active); }
    if (q) {
      where.push('(carrier LIKE :q OR state LIKE :q)');
      params.q = `%${q}%`;
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 50, 1), 2000);
    const offset = Math.max(((parseInt(page, 10) || 1) - 1) * limit, 0);

    const [rows] = await db.query(
      `SELECT id, lob, carrier, state, active, created_at, updated_at
       FROM carrier_lines
       ${whereSQL}
       ORDER BY lob, carrier, state
       LIMIT :limit OFFSET :offset`,
      { ...params, limit, offset }
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /carrier-lines error', err);
    res.status(500).json({ message: 'Error fetching carrier lines' });
  }
});

/**
 * GET /api/carrier-lines/meta
 * Devuelve listas distintas para poblar filtros (y opcionalmente filtra carriers por LOB).
 */
router.get('/meta', async (req: Request, res: Response) => {
  try {
    const { lob } = req.query as Record<string, string>;

    const [lobRows] = await db.query(`SELECT DISTINCT lob FROM carrier_lines ORDER BY lob`);
    const [stateRows] = await db.query(`SELECT DISTINCT state FROM carrier_lines ORDER BY state`);

    let carrierSQL = `SELECT DISTINCT carrier FROM carrier_lines`;
    const params: any = {};
    if (lob) {
      carrierSQL += ` WHERE lob = :lob`;
      params.lob = lob;
    }
    carrierSQL += ` ORDER BY carrier`;
    const [carrierRows] = await db.query(carrierSQL, params);

    res.json({
      lobs: (lobRows as any[]).map(r => r.lob),
      states: (stateRows as any[]).map(r => r.state),
      carriers: (carrierRows as any[]).map(r => r.carrier),
    });
  } catch (err) {
    console.error('GET /carrier-lines/meta error', err);
    res.status(500).json({ message: 'Error fetching meta' });
  }
});

/** POST /api/carrier-lines (opcional, para crear desde UI) */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { lob, carrier, state, active = 1 } = req.body || {};

    if (!lob || !carrier || !state) {
      return res.status(400).json({ message: 'lob, carrier y state son requeridos' });
    }

    await db.query(
      `INSERT INTO carrier_lines (lob, carrier, state, active)
       VALUES (:lob, :carrier, :state, :active)
       ON DUPLICATE KEY UPDATE
         active = VALUES(active),
         updated_at = CURRENT_TIMESTAMP`,
      { lob, carrier, state: String(state).toUpperCase().slice(0, 2), active: Number(active) ? 1 : 0 }
    );

    res.status(201).json({ message: 'Saved' });
  } catch (err) {
    console.error('POST /carrier-lines error', err);
    res.status(500).json({ message: 'Error saving carrier line' });
  }
});

/** PUT /api/carrier-lines/:id (opcional) */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lob, carrier, state, active } = req.body || {};

    const [result] = await db.query(
      `UPDATE carrier_lines
       SET
         lob     = COALESCE(:lob, lob),
         carrier = COALESCE(:carrier, carrier),
         state   = COALESCE(:state, state),
         active  = COALESCE(:active, active),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = :id`,
      {
        id: Number(id),
        lob: lob ?? null,
        carrier: carrier ?? null,
        state: state ? String(state).toUpperCase().slice(0, 2) : null,
        active: active === undefined ? null : (Number(active) ? 1 : 0),
      }
    );

    // @ts-ignore
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('PUT /carrier-lines/:id error', err);
    res.status(500).json({ message: 'Error updating carrier line' });
  }
});

/** DELETE /api/carrier-lines/:id (opcional) */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(`DELETE FROM carrier_lines WHERE id = :id`, { id: Number(id) });

    // @ts-ignore
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /carrier-lines/:id error', err);
    res.status(500).json({ message: 'Error deleting carrier line' });
  }
});

export default router;
