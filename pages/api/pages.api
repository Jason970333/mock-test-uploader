import dynamic from "next/dynamic";

const MockTestUploader = dynamic(() => import("../components/MockTestUploader"), {
  ssr: false,
});

export default function Home() {
  return <MockTestUploader />;
}
