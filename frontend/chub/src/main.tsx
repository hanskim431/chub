import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@app/App.tsx";

async function enableMocking() {
  if (import.meta.env.VITE_API_MOCK !== "true") {
    return;
  }
  const { worker } = await import("@mocks/browser.ts");
  await worker.start();
}

enableMocking().then(() => {
  console.log("App 렌더링 시작!");
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("App 렌더링 완료!");
});
