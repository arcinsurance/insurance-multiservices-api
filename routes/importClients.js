
import csv from 'csv-parser';
import { Readable } from 'stream';

export default async function importClients(req, res) {
  const results = [];
  const failedRows = [];

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se recibió el archivo CSV.' });
  }

  try {
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        if (data.email) {
          results.push(data);
        } else {
          failedRows.push({ row: data, reason: 'Falta el campo email' });
        }
      })
      .on('end', () => {
        console.log(`✅ Clientes procesados: ${results.length}, fallidos: ${failedRows.length}`);
        res.status(200).json({
          success: true,
          created: results.length,
          failed: failedRows.length,
          failedDetails: failedRows.slice(0, 5)
        });
      });
  } catch (err) {
    console.error("❌ Error al importar clientes:", err.message);
    res.status(500).json({ success: false, error: "Fallo al procesar el archivo CSV." });
  }
}
