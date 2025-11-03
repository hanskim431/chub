import "@testing-library/jest-dom";
import { handlers } from "@mocks/handlers";
import { setupServer } from "msw/node";

export const server = setupServer(...handlers);

server.events.on("request:start", ({ request }) => {
  // 어떤 URL로 요청 나가는지 확인
  console.log("[MSW] start:", request.method, request.url);
});

server.events.on("request:match", ({ request }) => {
  // 어떤 핸들러에 매칭됐는지 확인
  console.log("[MSW] match:", request.method, request.url);
});

server.events.on("request:unhandled", ({ request }) => {
  // 매칭 실패한 URL 즉시 확인
  console.error("[MSW] unhandled:", request.method, request.url);
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
