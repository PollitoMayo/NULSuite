import Fastify from "fastify";
import corsPlugin from "./plugins/cors.js";
import jwtPlugin from "./plugins/jwt.js";
import authRoutes from "./routes/auth.js";
import sheetsRoutes from "./routes/sheets.js";

(async () => {
  const app = Fastify({ logger: true });

  await app.register(corsPlugin);
  await app.register(jwtPlugin);

  await app.register(authRoutes, { prefix: "/api" });
  await app.register(sheetsRoutes, { prefix: "/api" });

  app.get("/health", async () => ({ ok: true }));

  const port = parseInt(process.env.PORT ?? "3000", 10);
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
    console.log(`[Server] Running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
