import { http, HttpResponse } from "msw";

export const exampleHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/api/my/watchlist`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({
      stockCode: "AAPL",
      stockName: "Apple Inc.",
      stockPrice: 150.75,
      stockChange: 1.25,
      stockChangePercent: 0.83,
    });
  }),
];
