// src/controllers/agentController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';

export const createAgent = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, npn, role } = req.body;
    const [result] = await db.execute(
      'INSERT INTO agents (full_name, email, phone, npn, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone, npn, role]
    );
    res.status(201).json({ message: 'Agent created successfully', result });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllAgents = async (_req: Request, res: Response) => {
  try {
    const [agents] = await db.execute('SELECT * FROM agents');
    res.status(200).json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
