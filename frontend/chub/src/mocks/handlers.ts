import { http } from "msw";
import { userHandlers } from "@mocks/userHandlers";
import { interviewHandlers } from "./interviewHandlers";
import { dashboardHandlers } from "./dashboardHandlers";

export const handlers = [
  http.all("*", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }),
  ...userHandlers,
  ...dashboardHandlers,
  ...interviewHandlers,
];
