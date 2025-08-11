// src/models/policy.ts
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Estructura de la tabla `policies` (según tu screenshot):
 * id (varchar36) PK
 * category (varchar100)
 * ffmMarketplaceUsed (varchar100)
 * npnMarketplaceUsed (varchar100)
 * agentUsedOwnNpn (tinyint1)
 * typeOfSale (varchar50)
 * effectiveDate (date)
 * marketplaceId (varchar100)
 * memberId (varchar100)
 * cmsPlanId (varchar100)
 * carrier (varchar100)
 * planName (varchar255)
 * metalLevel (varchar50)
 * policyTotalCost (decimal(10,2))
 * taxCreditSubsidy (decimal(10,2))
 * endDate (date)
 * status (enum('ACTIVE','PENDING','EXPIRED','CANCELLED'))
 * premium (decimal(10,2))
 * clientId (varchar36)  <-- relación con clients.id
 * market_id (varchar50)
 */

// Tipos de entrada/actualización (opcionales)
export type PolicyInsert = {
  clientId: string;
  category?: string | null;
  ffmMarketplaceUsed?: string | null;
  npnMarketplaceUsed?: string | null;
  agentUsedOwnNpn?: number | boolean | null;
  typeOfSale?: string | null;
  effectiveDate?: string | null; // 'yyyy-MM-dd'
  marketplaceId?: string | null;
  memberId?: string | null;
  cmsPlanId?: string | null;
  carrier?: string | null;
  planName?: string | null;
  metalLevel?: string | null;
  policyTotalCost?: number | null;
  taxCreditSubsidy?: number | null;
  endDate?: string | null;       // 'yyyy-MM-dd'
  status?: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | null;
  premium?: number | null;
  market_id?: string | null;
};

export type PolicyUpdate = Partial<PolicyInsert>;

// =================== Helpers ===================
function toTinyInt(v: any): 0 | 1 | null {
  if (v === null || v === undefined) return null;
  return (v === true || v === 1 || v === '1' || v === 'true') ? 1 : 0;
}

function buildSetClause(payload: Record<string, any>) {
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(payload)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  return { fields, values };
}

// =================== Queries ===================

// Todas las pólizas de un cliente
export async function getPoliciesByClientId(clientId: string) {
  const sql = `
    SELECT *
    FROM policies
    WHERE clientId = ?
    ORDER BY effectiveDate DESC, created_at DESC
  `;
  const [rows]: [any[], any] = await db.query(sql, [clientId]);
  return rows;
}

// Una póliza por ID
export async function getPolicyById(id: string) {
  const [rows]: [any[], any] = await db.query(
    `SELECT * FROM policies WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

// Crear póliza para un cliente
export async function createPolicyForClient(input: PolicyInsert) {
  const id = uuidv4();
  const sql = `
    INSERT INTO policies (
      id, clientId, category, ffmMarketplaceUsed, npnMarketplaceUsed, agentUsedOwnNpn,
      typeOfSale, effectiveDate, marketplaceId, memberId, cmsPlanId, carrier, planName,
      metalLevel, policyTotalCost, taxCreditSubsidy, endDate, status, premium, market_id, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, NOW()
    )
  `;

  const params = [
    id,
    input.clientId,
    input.category ?? null,
    input.ffmMarketplaceUsed ?? null,
    input.npnMarketplaceUsed ?? null,
    toTinyInt(input.agentUsedOwnNpn),
    input.typeOfSale ?? null,
    input.effectiveDate ?? null,
    input.marketplaceId ?? null,
    input.memberId ?? null,
    input.cmsPlanId ?? null,
    input.carrier ?? null,
    input.planName ?? null,
    input.metalLevel ?? null,
    input.policyTotalCost ?? null,
    input.taxCreditSubsidy ?? null,
    input.endDate ?? null,
    input.status ?? null, // 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | null
    input.premium ?? null,
    input.market_id ?? null,
  ];

  await db.query(sql, params);
  return getPolicyById(id);
}

// Actualizar póliza por ID (set dinámico)
export async function updatePolicyById(id: string, updates: PolicyUpdate) {
  // Normalizar boolean a tinyint
  if (updates.agentUsedOwnNpn !== undefined) {
    updates.agentUsedOwnNpn = toTinyInt(updates.agentUsedOwnNpn);
  }

  const allowed: Record<string, any> = {};
  const cols = [
    'clientId','category','ffmMarketplaceUsed','npnMarketplaceUsed','agentUsedOwnNpn',
    'typeOfSale','effectiveDate','marketplaceId','memberId','cmsPlanId','carrier','planName',
    'metalLevel','policyTotalCost','taxCreditSubsidy','endDate','status','premium','market_id'
  ];
  for (const c of cols) {
    if (c in updates) (allowed as any)[c] = (updates as any)[c];
  }

  if (Object.keys(allowed).length === 0) {
    return getPolicyById(id);
  }

  const { fields, values } = buildSetClause(allowed);
  const sql = `UPDATE policies SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
  values.push(id);
  await db.query(sql, values);
  return getPolicyById(id);
}

// Borrar póliza
export async function deletePolicyById(id: string) {
  const [res]: [any, any] = await db.query(`DELETE FROM policies WHERE id = ?`, [id]);
  return res;
}

export default {
  getPoliciesByClientId,
  getPolicyById,
  createPolicyForClient,
  updatePolicyById,
  deletePolicyById,
};
