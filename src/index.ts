import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients';
import agentRoutes from './routes/agents';
import authRoutes from './routes/auth';
import { db } from './config/db';

dotenv.config(); // ✅ Siempre al inicio

const app = express(); // ✅ Aquí se define antes de usar

app.use(cors());
app.use(express.json());

// 🔐 Rutas API
app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes); // ✅ Esto ya funciona ahora

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
