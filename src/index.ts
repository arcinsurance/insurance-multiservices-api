import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import documentTemplatesRoutes from "./routes/documentTemplates.js";
import clientRoutes from "./routes/clients.js";
import agentRoutes from "./routes/agents.js";
import authRoutes from "./routes/auth.js";
import changePasswordRoute from "./routes/changePassword.js";
import productCategoryRoutes from "./routes/productCategories.js";
import policyRoutes from "./routes/policies.js";
import documentRoutes from "./routes/documents.js";
import messageRoutes from "./routes/messages.js";
import signedDocumentsRoutes from "./routes/signedDocuments.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import agencyLicensesRoutes from "./routes/agencyLicenses.js";
import carriersRoutes from "./routes/carriers.js";
import chatMessagesRoutes from "./routes/chatMessages.js";
import commissionRatesRoutes from "./routes/commissionRates.js";
import settingsLogRoutes from "./routes/settingsLog.js";
import leadRoutes from "./routes/leadRoutes.js";
import agencyProfileRoutes from "./routes/agencyProfileRoutes.js";
import { db } from "./config/db.js";

dotenv.config();
const app = express();

/* Middlewares globales */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* CORS */
const allowedOrigins = [
  "https://crm.insurancemultiservices.com",
  "https://www.crm.insurancemultiservices.com",
  "https://insurancemultiservices.com",
  "https://www.insurancemultiservices.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    console.log(" CORS - Origin recibido:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(" CORS - Origen permitido");
      callback(null, true);
    } else {
      console.log(" CORS - Origen NO permitido. Or�genes permitidos:", allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

/* Rutas */
app.use("/api/auth", authRoutes);
app.use("/api/change-password", changePasswordRoute);
app.use("/api/agents", agentRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/document-templates", documentTemplatesRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/signed-documents", signedDocumentsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/agency-licenses", agencyLicensesRoutes);
app.use("/api/carriers", carriersRoutes);
app.use("/api/chat-messages", chatMessagesRoutes);
app.use("/api/commission-rates", commissionRatesRoutes);
app.use("/api/settings-log", settingsLogRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/agency-profile", agencyProfileRoutes);

/* Ruta b�sica */
app.get("/", (req, res) => {
  res.json({
    message: "Insurance Multiservices API - Funcionando ",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

/* Inicializaci�n del servidor */
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await db.getConnection().then(connection => connection.release());
    console.log(" Conexi�n a MySQL establecida");
    
    app.listen(PORT, () => {
      console.log(` Servidor corriendo en puerto ${PORT}`);
      console.log(` CORS configurado para: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error(" Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();
