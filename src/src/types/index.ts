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

// Mappers entre frontend y backend
export const mapClientToApi = (client: Client) => ({
  ...client,
  client_id: client.id,
  agent_id: client.agent_id,
  assigned_agent_full_name: client.assigned_agent_full_name,
  first_name: client.first_name,
  middle_name: client.middle_name,
  last_name: client.last_name,
  last_name_2: client.last_name_2,
  name: client.name,
  email: client.email,
  phone: client.phone,
  date_of_birth: client.date_of_birth,
  gender: client.gender,
  preferred_language: client.preferred_language,
  is_tobacco_user: client.is_tobacco_user,
  is_pregnant: client.is_pregnant,
  is_lead: client.is_lead,
  date_added: client.date_added,
});

export const mapApiToClient = (data: any): Client => ({
  id: data.id,
  agent_id: data.agent_id,
  assigned_agent_full_name: data.assigned_agent_full_name,
  first_name: data.first_name,
  middle_name: data.middle_name,
  last_name: data.last_name,
  last_name_2: data.last_name_2,
  name: data.name,
  email: data.email,
  phone: data.phone,
  date_of_birth: data.date_of_birth,
  gender: data.gender,
  preferred_language: data.preferred_language,
  is_tobacco_user: data.is_tobacco_user,
  is_pregnant: data.is_pregnant,
  is_lead: data.is_lead,
  date_added: data.date_added,

  incomeSources: data.incomeSources || [],
  immigrationDetails: data.immigrationDetails || {},
  physicalAddress: data.physicalAddress || {},
  mailingAddress: data.mailingAddress || {},
  mailingAddressSameAsPhysical: data.mailingAddressSameAsPhysical || false,
});
