import { userHandlers } from "@/mocks/model/userHandlers";
import { interviewHandlers } from "./interviewHandlers";
import { dashboardHandlers } from "./dashboardHandlers";
import { recruiterHandlers } from "./recruiterHandler";
import { resumeHandlers } from "./resumeHandler";

export const handlers = [
  ...userHandlers,
  ...dashboardHandlers,
  ...interviewHandlers,
  ...recruiterHandlers,
  ...resumeHandlers,
];
