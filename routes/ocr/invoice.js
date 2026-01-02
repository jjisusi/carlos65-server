import express from "express";
import multer from "multer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uint8Array = new Uint8Array(req.file.buffer);
    const pdf = await getDocument({ data: uint8Array }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      let lastY = null;
      let line = "";

      for (const item of content.items) {
        const y = item.transform[5]; // posición vertical

        if (lastY === null) {
          lastY = y;
        }

        // Si cambia la Y → nueva línea
        if (Math.abs(y - lastY) > 2) {
          fullText += line.trim() + "\n";
          line = "";
          lastY = y;
        }

        line += item.str + " ";
      }

      // última línea de la página
      if (line.trim().length > 0) {
        fullText += line.trim() + "\n";
      }
    }

    res.json({ text: fullText });

  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
