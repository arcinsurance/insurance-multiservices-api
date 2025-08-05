import { Request, Response } from 'express';
import { db } from '../config/db';

export async function createPolicy(req: Request, res: Response) {
  const { clientId } = req.params;
  const {
    category,
    carrier = '',
    planName = '',
    effectiveDate = '',
    ffmMarketplaceUsed = '',
    npnMarketplaceUsed = '',
    agentUsedOwnNpn = false,
    typeOfSale = '',
    marketplaceId = '',
    memberId = '',
    cmsPlanId = '',
    metalLevel = '',
    policyTotalCost = 0,
    taxCreditSubsidy = 0,
    endDate = '',
    status = 'ACTIVE',
    premium = 0
  } = req.body;

  // Solo validamos "category" como obligatorio
  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  const [result] = await db.execute(
    `INSERT INTO policies (
      client_id, category, carrier, plan_name, effective_date,
      ffm_marketplace_used, npn_marketplace_used, agent_used_own_npn, type_of_sale,
      marketplace_id, member_id, cms_plan_id, metal_level,
      policy_total_cost, tax_credit_subsidy, end_date, status, premium
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clientId, category, carrier, planName, effectiveDate,
      ffmMarketplaceUsed, npnMarketplaceUsed, agentUsedOwnNpn, typeOfSale,
      marketplaceId, memberId, cmsPlanId, metalLevel,
      policyTotalCost, taxCreditSubsidy, endDate, status, premium
    ]
  );

  res.status(201).json({ id: (result as any).insertId });
}
