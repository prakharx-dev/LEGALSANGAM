import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import createOrder from "./api/payments/create-order";
import verifyPayment from "./api/payments/verify";

const localPaymentApi: Plugin = {
  name: "local-payment-api",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const pathname = new URL(request.url || "/", "http://localhost").pathname;
      const handler =
        pathname === "/api/payments/create-order"
          ? createOrder
          : pathname === "/api/payments/verify"
            ? verifyPayment
            : undefined;

      if (!handler) {
        next();
        return;
      }

      const vercelRequest = request as VercelRequest;
      const vercelResponse = response as VercelResponse;
      vercelResponse.status = (statusCode) => {
        response.statusCode = statusCode;
        return vercelResponse;
      };
      vercelResponse.json = (payload) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(payload));
        return vercelResponse;
      };

      if (request.method === "POST") {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of request) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const body = Buffer.concat(chunks).toString("utf8");
          vercelRequest.body = body ? JSON.parse(body) : {};
        } catch {
          vercelResponse
            .status(400)
            .json({ error: "Invalid JSON request body." });
          return;
        }
      }

      try {
        await handler(vercelRequest, vercelResponse);
      } catch (error) {
        console.error(
          "Local payment API request failed:",
          error instanceof Error ? error.message : "Unknown error",
        );
        if (!response.headersSent) {
          vercelResponse
            .status(500)
            .json({ error: "Payment service is temporarily unavailable." });
        }
      }
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      localPaymentApi,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
