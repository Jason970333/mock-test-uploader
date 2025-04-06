import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import formidable from "formidable";
import * as XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const form = new formidable.IncomingForm();
  form.uploadDir = "/tmp";
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send("Form parsing error");

    const testFilePath = files.test_result[0].filepath;
    const testWorkbook = XLSX.readFile(testFilePath);
    const testSheet = testWorkbook.Sheets[testWorkbook.SheetNames.at(-1)];
    const testData = XLSX.utils.sheet_to_json(testSheet, { header: 1 });

    const bburioPath = path.join(process.cwd(), "data", "BBURIO.xlsx");
    const bburioWorkbook = XLSX.readFile(bburioPath);
    const bburioSheet = bburioWorkbook.Sheets[bburioWorkbook.SheetNames[0]];
    const bburioData = XLSX.utils.sheet_to_json(bburioSheet);

    const outputData = [
      ["이름", "휴대폰", "[*1*]", "[*2*]", "[*3*]", "[*4*]", "[*5*]", "[*6*]", "[*7*]", "[*8*]"],
      ...bburioData.map((row) => [row.이름, row.전화번호, "", "", "", "", "", "", "", ""]),
    ];

    const outputWorkbook = XLSX.utils.book_new();
    const outputSheet = XLSX.utils.aoa_to_sheet(outputData);
    XLSX.utils.book_append_sheet(outputWorkbook, outputSheet, "자동문자");

    const outputFile = path.join("/tmp", `result_${Date.now()}.xlsx`);
    XLSX.writeFile(outputWorkbook, outputFile);

    const resultBuffer = fs.readFileSync(outputFile);
    res.setHeader("Content-Disposition", "attachment; filename=1차 모의고사 뿌리오.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.status(200).send(resultBuffer);
  });
}
