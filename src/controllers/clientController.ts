import { Request, Response } from 'express';
import { db } from '../config/db';

export async function getClients(req: Request, res: Response) {
  const [rows] = await db.query('SELECT * FROM clients');
  res.json(rows);
}

export async function createClient(req: Request, res: Response) {
  const { agent_id, first_name, last_name, email, phone } = req.body;
  const [result] = await db.execute(
    'INSERT INTO clients (agent_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)',
    [agent_id, first_name, last_name, email, phone]
  );
  res.status(201).json({ id: (result as any).insertId });
}

export async function updateClient(req: Request, res: Response) {
  const { id } = req.params;
  const { first_name, last_name, email, phone } = req.body;
  await db.execute(
    'UPDATE clients SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?',
    [first_name, last_name, email, phone, id]
  );
  res.sendStatus(204);
}

export async function deleteClient(req: Request, res: Response) {
  const { id } = req.params;
  await db.execute('DELETE FROM clients WHERE id = ?', [id]);
  res.sendStatus(204);
}