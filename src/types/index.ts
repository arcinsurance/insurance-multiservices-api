export interface Address {
  id?: number;
  client_id: string;
  type: 'physical' | 'mailing';
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface IncomeSource {
  id?: number;
  client_id: string;
  employerOrSelfEmployed?: string;
  employerPhoneNumber?: string;
  positionOccupation?: string;
  annualIncome?: number;
}

export interface ImmigrationDetails {
  id?: number;
  client_id: string;
  status?: string;
  category?: string;
  ssn?: string;
  uscis_number?: string;
}

export interface Client {
  id: string;
  agent_id?: string | null;
  assigned_agent_full_name?: string | null;
  first_name: string;
  middle_name?: string;
  last_name: string;
  last_name_2?: string;
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  preferred_language?: string;
  is_tobacco_user?: boolean;
  is_pregnant?: boolean;
  is_lead?: boolean;
  date_added?: string;

  incomeSources?: IncomeSource[];
  immigrationDetails?: ImmigrationDetails;
  physicalAddress?: Address;
  mailingAddress?: Address;
  mailingAddressSameAsPhysical?: boolean;
}
