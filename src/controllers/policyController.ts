import { Request, Response } from 'express';
import { db } from '../config/db';

export async function createPolicy(req: Request, res: Response) {
  const { clientId } = req.params;
  const {
    category,
    ffmMarketplaceUsed,
    npnMarketplaceUsed,
    agentUsedOwnNpn,
    typeOfSale,
    effectiveDate,
    marketplaceId,
    memberId,
    cmsPlanId,
    carrier,
    planName,
    metalLevel,
    policyTotalCost,
    taxCreditSubsidy,
    endDate,
    status,
    premium,
  } = req.body;

  if (!category) {
    return res.status(400).json({
      message: 'To add a policy, you must provide the Category.',
    });
  }

  try {
    await db.execute(
      `INSERT INTO policies 
      (client_id, category, ffmMarketplaceUsed, npnMarketplaceUsed, agentUsedOwnNpn, typeOfSale, effectiveDate, marketplaceId, memberId, cmsPlanId, carrier, planName, metalLevel, policyTotalCost, taxCreditSubsidy, endDate, status, premium) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        category,
        ffmMarketplaceUsed,
        npnMarketplaceUsed,
        agentUsedOwnNpn ? 1 : 0,
        typeOfSale,
        effectiveDate,
        marketplaceId,
        memberId,
        cmsPlanId,
        carrier,
        planName,
        metalLevel,
        policyTotalCost,
        taxCreditSubsidy,
        endDate,
        status,
        premium,
      ]
    );

    res.status(201).json({ message: 'Policy created successfully.' });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}
