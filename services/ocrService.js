import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import Tesseract from "tesseract.js";

export async function processOCR(buffer, mimetype) {
  // Si es PDF → multipágina
  if (mimetype === "application/pdf") {
    const pdf = await PDFDocument.load(buffer);
    const pageCount = pdf.getPageCount();

    let fullText = "";

    for (let i = 0; i < pageCount; i++) {
      // Extraer una sola página
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);

      const singlePagePdf = await newPdf.save();

      // Convertir esa página a PNG
      const pngBuffer = await sharp(singlePagePdf, { density: 200 })
        .png()
        .toBuffer();

      // OCR de la página
      const result = await Tesseract.recognize(pngBuffer, "spa");
      fullText += `\n\n--- Página ${i + 1} ---\n\n`;
      fullText += result.data.text;
    }

    return fullText;
  }

  // Si es imagen → OCR directo
  const result = await Tesseract.recognize(buffer, "spa");
  return result.data.text;
}

