import { http } from "msw";
import { userHandlers } from "@/mocks/model/userHandlers";
import { interviewHandlers } from "./interviewHandlers";
import { dashboardHandlers } from "./dashboardHandlers";
import { recruiterHandlers } from "./recruiterHandler";

export const handlers = [
  // http.all("*", async () => {
  //   await delay(200);
  // }),
  ...userHandlers,
  ...dashboardHandlers,
  ...interviewHandlers,
  ...recruiterHandlers,
];
