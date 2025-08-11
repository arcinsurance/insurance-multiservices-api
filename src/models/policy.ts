// src/models/policy.ts
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tabla `policies`
 * Campos relevantes usados aquí:
 *  id (varchar36) PK
 *  clientId (varchar36) -> clients.id
 *  category (varchar100)
 *  ffmMarketplaceUsed (varchar100)
 *  npnMarketplaceUsed (varchar100)
 *  agentUsedOwnNpn (tinyint1)
 *  typeOfSale (varchar50)
 *  effectiveDate (date)
 *  endDate (date)
 *  marketplaceId (varchar100)
 *  memberId (varchar100)
 *  cmsPlanId (varchar100)
 *  carrier (varchar100)
 *  planName (varchar255)
 *  metalLevel (varchar50)
 *  policyTotalCost (decimal(10,2))
 *  taxCreditSubsidy (decimal(10,2))
 *  premium (decimal(10,2))
 *  status (enum('ACTIVE','PENDING','EXPIRED','CANCELLED'))
 *  market_id (varchar50)
 *  unique_no_market_id_key (varchar300)  // creada en paso 10.2B + triggers
 *
 * Índices/uniques asumidos (ya creados en pasos previos):
 *  - UNIQUE (clientId, market_id)
 *  - UNIQUE (unique_no_market_id_key)  // sólo cuando market_id es NULL (vía triggers)
 */

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
  market_id?: string | null;     // si viene, usa UNIQUE (clientId, market_id)
};

export type PolicyUpdate = Partial<PolicyInsert>;

// ============= Helpers =============
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

// ============= Queries =============

// Todas las pólizas de un cliente (orden estable sin depender de columnas que quizá no existan)
export async function getPoliciesByClientId(clientId: string) {
  const sql = `
    SELECT id, clientId, category, ffmMarketplaceUsed, npnMarketplaceUsed, agentUsedOwnNpn,
           typeOfSale, effectiveDate, endDate, marketplaceId, memberId, cmsPlanId,
           carrier, planName, metalLevel, policyTotalCost, taxCreditSubsidy, premium,
           status, market_id
    FROM policies
    WHERE clientId = ?
    ORDER BY effectiveDate DESC, id DESC
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

/**
 * UPSERT de póliza para un cliente.
 * - Si hay UNIQUE hit por (clientId, market_id) o por unique_no_market_id_key (cuando market_id es NULL),
 *   hace UPDATE.
 * - Los triggers creados en DB calculan unique_no_market_id_key cuando market_id es NULL.
 */
export async function upsertPolicyForClient(input: PolicyInsert) {
  const id = uuidv4();

  // normalizar boolean tinyint
  const agentOwn = toTinyInt(input.agentUsedOwnNpn);

  const sql = `
    INSERT INTO policies (
      id, clientId, category, ffmMarketplaceUsed, npnMarketplaceUsed, agentUsedOwnNpn,
      typeOfSale, effectiveDate, endDate, marketplaceId, memberId, cmsPlanId,
      carrier, planName, metalLevel, policyTotalCost, taxCreditSubsidy, premium,
      status, market_id
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
    ON DUPLICATE KEY UPDATE
      category = VALUES(category),
      ffmMarketplaceUsed = VALUES(ffmMarketplaceUsed),
      npnMarketplaceUsed = VALUES(npnMarketplaceUsed),
      agentUsedOwnNpn = VALUES(agentUsedOwnNpn),
      typeOfSale = VALUES(typeOfSale),
      effectiveDate = VALUES(effectiveDate),
      endDate = VALUES(endDate),
      marketplaceId = VALUES(marketplaceId),
      memberId = VALUES(memberId),
      cmsPlanId = VALUES(cmsPlanId),
      carrier = VALUES(carrier),
      planName = VALUES(planName),
      metalLevel = VALUES(metalLevel),
      policyTotalCost = VALUES(policyTotalCost),
      taxCreditSubsidy = VALUES(taxCreditSubsidy),
      premium = VALUES(premium),
      status = VALUES(status)
  `;

  const params = [
    id,
    input.clientId,
    input.category ?? 'HEALTH',
    input.ffmMarketplaceUsed ?? null,
    input.npnMarketplaceUsed ?? null,
    agentOwn,
    input.typeOfSale ?? null,
    input.effectiveDate ?? null,
    input.endDate ?? null,
    input.marketplaceId ?? null,
    input.memberId ?? null,
    input.cmsPlanId ?? null,
    input.carrier ?? null,
    input.planName ?? null,
    input.metalLevel ?? null,
    input.policyTotalCost ?? null,
    input.taxCreditSubsidy ?? null,
    input.premium ?? null,
    (input.status ?? 'ACTIVE')?.toUpperCase(),
    input.market_id ?? null,
  ];

  await db.query(sql, params);

  // Devolver la fila final (si hay market_id, preferimos esa llave)
  if (input.market_id) {
    const [rows]: [any[], any] = await db.query(
      `SELECT * FROM policies WHERE clientId = ? AND market_id = ? ORDER BY effectiveDate DESC, id DESC LIMIT 1`,
      [input.clientId, input.market_id]
    );
    return rows[0] || null;
  } else {
    // Sin market_id, buscamos por combinación lógica (misma que usan los triggers)
    const [rows]: [any[], any] = await db.query(
      `SELECT * FROM policies
         WHERE clientId = ?
           AND COALESCE(planName,'') = COALESCE(?, '')
           AND effectiveDate <=> ?
       ORDER BY id DESC
       LIMIT 1`,
      [input.clientId, input.planName ?? null, input.effectiveDate ?? null]
    );
    return rows[0] || null;
  }
}

// Crear “sólo insert” (si quieres conservarla separada); internamente puedes reutilizar upsert
export async function createPolicyForClient(input: PolicyInsert) {
  return upsertPolicyForClient(input);
}

// Actualizar póliza por ID (set dinámico)
export async function updatePolicyById(id: string, updates: PolicyUpdate) {
  // Normalizar boolean a tinyint si viene
  if (updates.agentUsedOwnNpn !== undefined) {
    updates.agentUsedOwnNpn = toTinyInt(updates.agentUsedOwnNpn);
  }

  // Filtrar columnas permitidas
  const allowed: Record<string, any> = {};
  const cols = [
    'clientId','category','ffmMarketplaceUsed','npnMarketplaceUsed','agentUsedOwnNpn',
    'typeOfSale','effectiveDate','endDate','marketplaceId','memberId','cmsPlanId',
    'carrier','planName','metalLevel','policyTotalCost','taxCreditSubsidy','premium',
    'status','market_id'
  ];
  for (const c of cols) {
    if (c in updates) (allowed as any)[c] = (updates as any)[c];
  }

  if (Object.keys(allowed).length === 0) {
    return getPolicyById(id);
  }

  const { fields, values } = buildSetClause(allowed);
  const sql = `UPDATE policies SET ${fields.join(', ')} WHERE id = ?`;
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
  upsertPolicyForClient,
  createPolicyForClient,
  updatePolicyById,
  deletePolicyById,
};
