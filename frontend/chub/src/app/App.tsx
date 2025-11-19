import AppRouter from "@/app/routes/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryProvider } from "@/app/queryProvider/QueryProvider";
import { useMe } from "@/features/auth/api/me";
import { useWebSocket } from "@/shared/websocket/useWebSocket";

function App() {
  const { data } = useMe();
  const isAuthenticated = !!(data?.success && data?.data);
  const currentUserId = data?.data?.id;

  // WebSocket 연결 초기화 (전역에서 한 번만, 인증된 경우에만)
  useWebSocket({
    enabled: isAuthenticated && !!currentUserId,
  });

  return (
    <QueryProvider>
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
