import AppRouter from "@/app/routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryProvider } from "@/app/queryProvider/QueryProvider";
import { WebSocketInitializer } from "@/app/components/WebSocketInitializer";

function App() {
  return (
    <QueryProvider>
      <WebSocketInitializer />
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
