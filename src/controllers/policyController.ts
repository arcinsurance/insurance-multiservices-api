// src/controllers/policyController.ts
import { Request, Response } from 'express';
import { parse, isValid, format } from 'date-fns';
import * as Policy from '../models/policy';

// ===== Helpers =====
function toSQLDate(input?: any): string | null {
  if (!input) return null;
  const s = String(input).trim();
  // Acepta 'YYYY-MM-DD'
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Intenta 'MM/DD/YYYY'
  try {
    const d = parse(s, 'MM/dd/yyyy', new Date());
    if (isValid(d)) return format(d, 'yyyy-MM-dd');
  } catch {}
  return null;
}

function fmtOut(d?: any): string | null {
  if (!d) return null;
  try { return format(new Date(d), 'MM/dd/yyyy'); } catch { return null; }
}

// ===== Endpoints =====

// GET /api/policies/client/:clientId
export async function getPoliciesByClient(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    const rows = await Policy.getPoliciesByClientId(clientId);
    const data = rows.map((p: any) => ({
      ...p,
      effectiveDate: fmtOut(p.effectiveDate),
      endDate: fmtOut(p.endDate),
    }));
    res.json(data);
  } catch (err) {
    console.error('getPoliciesByClient error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/policies/client/:clientId  (upsert)
export async function upsertPolicy(req: Request, res: Response) {
  try {
    const { clientId } = req.params;
    if (!clientId) return res.status(400).json({ error: 'clientId is required (route param)' });

    const b = req.body || {};
    const payload: Policy.PolicyInsert = {
      clientId,
      category: b.category ?? 'HEALTH',
      ffmMarketplaceUsed: b.ffmMarketplaceUsed ?? null,
      npnMarketplaceUsed: b.npnMarketplaceUsed ?? null,
      agentUsedOwnNpn: b.agentUsedOwnNpn ?? null,
      typeOfSale: b.typeOfSale ?? null,
      effectiveDate: toSQLDate(b.effectiveDate),
      endDate: toSQLDate(b.endDate),
      marketplaceId: b.marketplaceId ?? null,
      memberId: b.memberId ?? null,
      cmsPlanId: b.cmsPlanId ?? null,
      carrier: b.carrier ?? null,
      planName: b.planName ?? null,
      metalLevel: b.metalLevel ?? null,
      policyTotalCost: b.policyTotalCost != null ? Number(b.policyTotalCost) : null,
      taxCreditSubsidy: b.taxCreditSubsidy != null ? Number(b.taxCreditSubsidy) : null,
      premium: b.premium != null ? Number(b.premium) : null,
      status: (b.status ?? 'ACTIVE') as any,
      market_id: b.market_id ?? b.marketId ?? null,
    };

    const saved = await Policy.upsertPolicyForClient(payload);
    if (saved) {
      return res.status(201).json({
        ...saved,
        effectiveDate: fmtOut(saved.effectiveDate),
        endDate: fmtOut(saved.endDate),
      });
    }
    res.status(201).json({ ok: true });
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('Duplicate') || msg.includes('UNIQUE')) {
      return res.status(409).json({
        error:
          'Duplicate policy for this client (market_id) o (planName + effectiveDate) cuando market_id es NULL.',
      });
    }
    console.error('upsertPolicy error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/policies/:policyId
export async function updatePolicy(req: Request, res: Response) {
  try {
    const { policyId } = req.params;
    if (!policyId) return res.status(400).json({ error: 'policyId is required' });

    const b = req.body || {};
    const updates: Policy.PolicyUpdate = {
      clientId: b.clientId,
      category: b.category,
      ffmMarketplaceUsed: b.ffmMarketplaceUsed,
      npnMarketplaceUsed: b.npnMarketplaceUsed,
      agentUsedOwnNpn: b.agentUsedOwnNpn,
      typeOfSale: b.typeOfSale,
      effectiveDate: toSQLDate(b.effectiveDate),
      endDate: toSQLDate(b.endDate),
      marketplaceId: b.marketplaceId,
      memberId: b.memberId,
      cmsPlanId: b.cmsPlanId,
      carrier: b.carrier,
      planName: b.planName,
      metalLevel: b.metalLevel,
      policyTotalCost: b.policyTotalCost != null ? Number(b.policyTotalCost) : undefined,
      taxCreditSubsidy: b.taxCreditSubsidy != null ? Number(b.taxCreditSubsidy) : undefined,
      premium: b.premium != null ? Number(b.premium) : undefined,
      status: b.status,
      market_id: b.market_id ?? b.marketId,
    };

    const saved = await Policy.updatePolicyById(policyId, updates);
    if (!saved) return res.status(404).json({ error: 'Policy not found' });

    res.json({
      ...saved,
      effectiveDate: fmtOut(saved.effectiveDate),
      endDate: fmtOut(saved.endDate),
    });
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('Duplicate') || msg.includes('UNIQUE')) {
      return res.status(409).json({
        error:
          'Duplicate policy for this client (market_id) o (planName + effectiveDate) cuando market_id es NULL.',
      });
    }
    console.error('updatePolicy error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/policies/:policyId
export async function deletePolicy(req: Request, res: Response) {
  try {
    const { policyId } = req.params;
    if (!policyId) return res.status(400).json({ error: 'policyId is required' });

    await Policy.deletePolicyById(policyId);
    res.json({ ok: true });
  } catch (err) {
    console.error('deletePolicy error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 🔁 Compatibilidad con código anterior
export const createPolicy = upsertPolicy;
