import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function MockTestUploader() {
  const [testFile, setTestFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleUpload = async () => {
    if (!testFile) return alert("성적 정오표 파일을 업로드해주세요.");

    const formData = new FormData();
    formData.append("test_result", testFile);

    const response = await fetch("/api/generate-excel", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "1차 모의고사 뿌리오.xlsx";
      a.click();
      setSubmitted(true);
    } else {
      alert("파일 생성에 실패했습니다.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-xl mx-auto">
      <Card className="rounded-2xl shadow-md p-6">
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">1차 모의고사 자동 문자 생성기</h2>

          <div>
            <label className="font-medium block mb-1">성적 정오표 파일 (.xlsx)</label>
            <input type="file" accept=".xlsx" onChange={(e) => setTestFile(e.target.files[0])} />
          </div>

          <Button onClick={handleUpload} className="w-full flex items-center gap-2">
            <Upload size={16} /> 자동문자 엑셀 만들기
          </Button>

          {submitted && <p className="text-green-600 font-medium">✅ 파일이 성공적으로 생성되었습니다!</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
