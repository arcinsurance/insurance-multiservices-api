import express from 'express';
import importClientsRoute from './routes/importClients.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', importClientsRoute);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});