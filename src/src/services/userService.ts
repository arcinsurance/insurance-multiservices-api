// src/services/userService.ts
import axios from 'axios';

export const createAgent = async (agentData: any) => {
  const response = await axios.post('/api/agents', agentData);
  return response.data;
};
