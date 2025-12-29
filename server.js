import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 

import getProducts from "./routes/odoo/get-products.js";
import updateProducts from "./routes/odoo/update-products.js";
import uploadInvoice from "./routes/ocr/invoice.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/odoo/get-products", getProducts);
app.use("/odoo/update-products", updateProducts);
app.use("/ocr/invoice", uploadInvoice);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node.js escuchando en http://localhost:${PORT}`);
});
