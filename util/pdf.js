const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const writePath =
  path.join(__dirname, "../", "data", "invoices") + "/invoices-1.pdf";
const doc = new PDFDocument();

doc.pipe(fs.createWriteStream(writePath));

doc.font("Helvetica-Bold").fontSize(16).text("Invoice", { align: "center" });
doc.moveDown();
doc.font("Helvetica").fontSize(16).text("Some text with an embedded font!");

doc.end();

// console.log(path.join(__dirname, "../", "data", "invoices"));
