import fetch from "node-fetch";
import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { ODOO_URL, ODOO_DB, ODOO_UID, ODOO_PASSWORD } = process.env;
  const products = req.body.products;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Se esperaba un array 'products'" });
  }

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

  const results = [];

  for (const p of products) {
    const { default_code, name, list_price, standard_price, taxes_id, supplier_taxes_id } = p;

    try {
      // Buscar si existe por default_code
      const search = await odooCall({
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

      const ids = search.result;

      if (ids.length > 0) {
        // -------------------------
        // 🔵 ACTUALIZAR PRODUCTO
        // -------------------------
        const update = await odooCall({
          service: "object",
          method: "execute_kw",
          args: [
            ODOO_DB,
            parseInt(ODOO_UID),
            ODOO_PASSWORD,
            "product.template",
            "write",
            [
              ids,
              {
                name,
                list_price,
                standard_price,
                taxes_id: taxes_id ? [[6, false, taxes_id]] : undefined,
                supplier_taxes_id: supplier_taxes_id ? [[6, false, supplier_taxes_id]] : undefined
              }
            ]
          ]
        });

        results.push({
          default_code,
          action: "updated",
          id: ids[0],
          success: update.result
        });

      } else {
        // -------------------------
        // 🟢 CREAR PRODUCTO NUEVO
        // -------------------------
        const create = await odooCall({
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
                taxes_id: taxes_id ? [[6, false, taxes_id]] : [],
                supplier_taxes_id: supplier_taxes_id ? [[6, false, supplier_taxes_id]] : []
              }
            ]
          ]
        });

        results.push({
          default_code,
          action: "created",
          id: create.result,
          success: true
        });
      }

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
