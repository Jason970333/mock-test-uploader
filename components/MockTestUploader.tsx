import { useState } from "react";

export default function MockTestUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택해주세요.");
    const formData = new FormData();
    formData.append("test_result", file);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-excel", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("파일 생성 실패");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "1차 모의고사 뿌리오.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("파일 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>성적 정오표 업로드</h1>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "생성 중..." : "자동문자 파일 생성하기"}
      </button>
    </div>
  );
}
