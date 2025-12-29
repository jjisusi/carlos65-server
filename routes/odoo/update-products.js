import fetch from "node-fetch";
import express from "express";

const router = express.Router();

// Helper para llamadas JSON-RPC
async function odooCall(params) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params,
    id: Date.now()
  };

  const response = await fetch(process.env.ODOO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return response.json();
}

// Helper para Many2many
function m2m(value) {
  if (!value) return [];
  if (Array.isArray(value)) return [[6, false, value]];
  return [[6, false, [value]]];
}

router.post("/", async (req, res) => {
  const { ODOO_DB, ODOO_UID, ODOO_PASSWORD } = process.env;
  const products = req.body.products;

  const results = [];

  for (const p of products) {
    const { default_code, name, list_price, standard_price, taxes_id, supplier_taxes_id } = p;

    try {
      // 1. Buscar plantilla por default_code
      const searchTemplate = await odooCall({
        service: "object",
        method: "execute_kw",
        args: [
          ODOO_DB,
          parseInt(ODOO_UID),
          ODOO_PASSWORD,
          "product.template",
          "search",
          [[["default_code", "=", default_code]]]
        ]
      });

      const templateIds = searchTemplate.result;

      // ---------------------------------------------------------
      // 🟢 SI EXISTE → ACTUALIZAR
      // ---------------------------------------------------------
      if (templateIds.length > 0) {
        const templateId = templateIds[0];

        const updateTemplate = await odooCall({
          service: "object",
          method: "execute_kw",
          args: [
            ODOO_DB,
            parseInt(ODOO_UID),
            ODOO_PASSWORD,
            "product.template",
            "write",
            [
              [templateId],
              {
                name,
                list_price,
                standard_price,
                taxes_id: m2m(taxes_id),
                supplier_taxes_id: m2m(supplier_taxes_id)
              }
            ]
          ]
        });

        results.push({
          default_code,
          action: "updated",
          templateId,
          success: updateTemplate.result
        });

        continue;
      }

      // ---------------------------------------------------------
      // 🟢 SI NO EXISTE → CREAR
      // ---------------------------------------------------------
      const createTemplate = await odooCall({
        service: "object",
        method: "execute_kw",
        args: [
          ODOO_DB,
          parseInt(ODOO_UID),
          ODOO_PASSWORD,
          "product.template",
          "create",
          [
            {
              default_code,
              name,
              list_price,
              standard_price,
              taxes_id: m2m(taxes_id),
              supplier_taxes_id: m2m(supplier_taxes_id)
            }
          ]
        ]
      });
    } catch (err) {
      results.push({
        default_code,
        action: "error",
        error: err.message
      });
    }
  }

  res.json({ results });
});

export default router;
