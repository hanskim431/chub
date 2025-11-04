import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks/model/handlers";

export const worker = setupWorker(...handlers);
