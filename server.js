import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 

import getProducts from "./routes/get-products.js";
import updateProducts from "./routes/update-products.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/odoo/get-products", getProducts);
app.use("/odoo/update-products", updateProducts);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node.js escuchando en http://localhost:${PORT}`);
});
