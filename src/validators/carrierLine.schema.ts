import { z } from 'zod';
import { US_STATES } from '../constants/states';

export const carrierLineSchema = z.object({
  lob: z.string().min(2).max(50),
  carrier: z.string().min(2).max(150),
  state: z.enum(US_STATES),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type CarrierLineInput = z.infer<typeof carrierLineSchema>;
