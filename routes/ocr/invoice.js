import express from "express";
import multer from "multer";
import { processOCR } from "../../services/ocrService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    const text = await processOCR(req.file.buffer, req.file.mimetype);

    res.json({ text });

  } catch (err) {
    console.error("Error OCR:", err);
    res.status(500).json({ error: "Error procesando OCR" });
  }
});

export default router;

