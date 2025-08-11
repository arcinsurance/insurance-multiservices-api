// src/controllers/policiesController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { parse, isValid, format } from 'date-fns';

// Helpers
function toTinyInt(v: any): 0 | 1 | null {
  if (v === null || v === undefined || v === '') return null;
  return (v === true || v === 1 || v === '1' || v === 'true') ? 1 : 0;
}

function toSQLDate(s: any): string | null {
  if (!s) return null;
  if (typeof s !== 'string') return null;
  // intenta yyyy-MM-dd
  let d = parse(s, 'yyyy-MM-dd', new Date());
  if (isValid(d)) return format(d, 'yyyy-MM-dd');
  // intenta MM/dd/yyyy
  d = parse(s, 'MM/dd/yyyy', new Date());
  if (isValid(d)) return format(d, 'yyyy-MM-dd');
  return null;
}

// POST /api/clients/:clientId/policies
export async function createPolicy(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    const {
      category,
      carrier = null,
      planName = null,
      effectiveDate = null,
      ffmMarketplaceUsed = null,
      npnMarketplaceUsed = null,
      agentUsedOwnNpn = null,
      typeOfSale = null,
      marketplaceId = null,
      memberId = null,
      cmsPlanId = null,
      metalLevel = null,
      policyTotalCost = null,
      taxCreditSubsidy = null,
      endDate = null,
      status = 'ACTIVE',
      premium = null,
      market_id = null, // si piensas usarlo
    } = req.body;

    if (!clientId) return res.status(400).json({ message: 'clientId is required (route param)' });
    if (!category) return res.status(400).json({ message: 'category is required' });

    const eff = toSQLDate(effectiveDate);
    const end = toSQLDate(endDate);
    const ownNpn = toTinyInt(agentUsedOwnNpn);

    // id es VARCHAR(36): usa UUID() generado por MySQL
    const sql = `
      INSERT INTO policies (
        id, clientId, category, carrier, planName, effectiveDate,
        ffmMarketplaceUsed, npnMarketplaceUsed, agentUsedOwnNpn, typeOfSale,
        marketplaceId, memberId, cmsPlanId, metalLevel,
        policyTotalCost, taxCreditSubsidy, endDate, status, premium, market_id
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `;

    const params = [
      clientId, category, carrier, planName, eff,
      ffmMarketplaceUsed, npnMarketplaceUsed, ownNpn, typeOfSale,
      marketplaceId, memberId, cmsPlanId, metalLevel,
      policyTotalCost, taxCreditSubsidy, end, status, premium, market_id
    ];

    await db.execute(sql, params);

    // devolver la creada (por clientId + últimos datos)
    const [rows]: [any[], any] = await db.query(
      `SELECT * FROM policies WHERE clientId = ? ORDER BY effectiveDate DESC, id DESC LIMIT 1`,
      [clientId]
    );
    return res.status(201).json(rows[0] || { ok: true });
  } catch (err) {
    console.error('createPolicy error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// GET /api/clients/:clientId/policies
export async function getPoliciesByClient(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    const [rows]: [any[], any] = await db.query(
      `SELECT * FROM policies WHERE clientId = ? ORDER BY effectiveDate DESC, id DESC`,
      [clientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('getPoliciesByClient error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// PUT /api/policies/:policyId
export async function updatePolicy(req: Request, res: Response) {
  try {
    const { policyId } = req.params;
    const body = req.body || {};

    // Normaliza campos a los nombres reales de la tabla
    const allowed: Record<string, any> = {};
    const map: Record<string, string> = {
      clientId: 'clientId',
      category: 'category',
      carrier: 'carrier',
      planName: 'planName',
      effectiveDate: 'effectiveDate',
      ffmMarketplaceUsed: 'ffmMarketplaceUsed',
      npnMarketplaceUsed: 'npnMarketplaceUsed',
      agentUsedOwnNpn: 'agentUsedOwnNpn',
      typeOfSale: 'typeOfSale',
      marketplaceId: 'marketplaceId',
      memberId: 'memberId',
      cmsPlanId: 'cmsPlanId',
      metalLevel: 'metalLevel',
      policyTotalCost: 'policyTotalCost',
      taxCreditSubsidy: 'taxCreditSubsidy',
      endDate: 'endDate',
      status: 'status',
      premium: 'premium',
      market_id: 'market_id',
    };

    for (const k of Object.keys(map)) {
      if (k in body) {
        let v = body[k];
        if (k === 'agentUsedOwnNpn') v = toTinyInt(v);
        if (k === 'effectiveDate' || k === 'endDate') v = toSQLDate(v);
        allowed[map[k]] = v ?? null;
      }
    }

    if (Object.keys(allowed).length === 0) {
      const [cur]: [any[], any] = await db.query(`SELECT * FROM policies WHERE id = ? LIMIT 1`, [policyId]);
      return res.json(cur[0] || null);
    }

    const sets: string[] = [];
    const vals: any[] = [];
    for (const [col, val] of Object.entries(allowed)) {
      sets.push(`${col} = ?`);
      vals.push(val);
    }
    vals.push(policyId);

    await db.execute(`UPDATE policies SET ${sets.join(', ')} WHERE id = ?`, vals);

    const [rows]: [any[], any] = await db.query(`SELECT * FROM policies WHERE id = ? LIMIT 1`, [policyId]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error('updatePolicy error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// DELETE /api/policies/:policyId
export async function deletePolicy(req: Request, res: Response) {
  try {
    const { policyId } = req.params;
    await db.execute(`DELETE FROM policies WHERE id = ?`, [policyId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('deletePolicy error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
