import { userHandlers } from "@/mocks/model/userHandlers";
import { interviewHandlers } from "@/mocks/model/interviewHandlers";
import { dashboardHandlers } from "@/mocks/model/dashboardHandlers";
import { recruiterHandlers } from "@/mocks/model/recruiterHandler";
import { resumeHandlers } from "@/mocks/model/resumeHandler";

export const handlers = [
  ...userHandlers,
  ...dashboardHandlers,
  ...interviewHandlers,
  ...recruiterHandlers,
  ...resumeHandlers,
];
