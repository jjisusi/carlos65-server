const pdf = require("pdf-parse");

module.exports = async function extractPdf(buffer) {
  const data = await pdf(buffer);
  return data.text;
};
