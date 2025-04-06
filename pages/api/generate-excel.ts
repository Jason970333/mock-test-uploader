import path from "path";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { writeFile } from "fs/promises";
const formidable = require("formidable");
import * as XLSX from "xlsx";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const form = new formidable.IncomingForm();
  form.uploadDir = "/tmp";
  form.keepExtensions = true;

  form.parse(req, async (err: any, fields: any, files: any) => {
    try {
      if (err) throw new Error("Form parsing error");

      if (!files?.test_result || !Array.isArray(files.test_result) || !files.test_result[0]?.filepath) {
        return res.status(400).send("파일이 업로드되지 않았습니다.");
      }

      const testFilePath = files.test_result[0].filepath;
      if (!fs.existsSync(testFilePath)) return res.status(400).send("업로드된 파일 경로가 존재하지 않습니다.");

      const testWorkbook = XLSX.readFile(testFilePath);
      const sheetNames = testWorkbook.SheetNames;
      if (!sheetNames || sheetNames.length === 0) return res.status(400).send("엑셀에 시트가 없습니다.");

      const lastSheetName = sheetNames[sheetNames.length - 1];
      const testSheet = testWorkbook.Sheets[lastSheetName];
      if (!testSheet) return res.status(400).send("마지막 시트를 읽을 수 없습니다.");

      const testData = XLSX.utils.sheet_to_json(testSheet, { header: 1 });

      const bburioPath = path.join(process.cwd(), "data", "BBURIO.xlsx");
      if (!fs.existsSync(bburioPath)) return res.status(400).send("BBURIO.xlsx 파일을 찾을 수 없습니다.");

      const bburioWorkbook = XLSX.readFile(bburioPath);
      const bburioSheet = bburioWorkbook.Sheets[bburioWorkbook.SheetNames[0]];
      if (!bburioSheet) return res.status(400).send("BBURIO 시트를 찾을 수 없습니다.");

      const bburioData = XLSX.utils.sheet_to_json(bburioSheet);

      const outputData = [
        ["이름", "휴대폰", "[*1*]", "[*2*]", "[*3*]", "[*4*]", "[*5*]", "[*6*]", "[*7*]", "[*8*]"],
        ...bburioData.map((row: any) => [row.이름 ?? "", row.전화번호 ?? "", "", "", "", "", "", "", "", ""]),
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
    } catch (error: any) {
      console.error("오류 발생:", error);
      res.status(500).send("서버 오류가 발생했습니다.");
    }
  });
}
