import "@testing-library/jest-dom";
import { handlers } from "@mocks/handlers";
import { setupServer } from "msw/node";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
