import fetch from "node-fetch";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  const { ODOO_URL, ODOO_DB, ODOO_UID, ODOO_PASSWORD } = process.env;

  const fields = [
    "id",
    "default_code",
    "name",
    "standard_price",
    "list_price",
    "taxes_id",
    "supplier_taxes_id"
  ];

  async function odooCall(params) {
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params,
      id: Date.now()
    };

    const response = await fetch(ODOO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return response.json();
  }

  try {
    const search = await odooCall({
      service: "object",
      method: "execute_kw",
      args: [
        ODOO_DB,
        parseInt(ODOO_UID),
        ODOO_PASSWORD,
        "product.template",
        "search",
        [[["active", "=", true]]]
      ]
    });

    const ids = search.result;

    const read = await odooCall({
      service: "object",
      method: "execute_kw",
      args: [
        ODOO_DB,
        parseInt(ODOO_UID),
        ODOO_PASSWORD,
        "product.template",
        "read",
        [ids],
        { fields }
      ]
    });

    res.json({
      count: read.result.length,
      products: read.result
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
