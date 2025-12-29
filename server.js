import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 

import getProducts from "./routes/get-products.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/odoo/get-products", getProducts);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node.js escuchando en http://localhost:${PORT}`);
});
