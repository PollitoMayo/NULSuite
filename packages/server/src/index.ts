import * as Sentry from "@sentry/node";
import Fastify from "fastify";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
});
import corsPlugin from "./plugins/cors.js";
import jwtPlugin from "./plugins/jwt.js";
import authRoutes from "./routes/auth.js";
import sheetsRoutes from "./routes/sheets.js";
import charactersRoutes from "./routes/characters.js";
import abilitiesRoutes from "./routes/abilities.js";
import movesRoutes      from "./routes/moves.js";
import archetypesRoutes from "./routes/archetypes.js";
import pokedexRoutes    from "./routes/pokedex.js";

(async () => {
  const app = Fastify({ logger: true });

  await app.register(corsPlugin);
  await app.register(jwtPlugin);

  await app.register(authRoutes, { prefix: "/api" });
  await app.register(sheetsRoutes, { prefix: "/api" });
  await app.register(charactersRoutes, { prefix: "/api" });
  await app.register(abilitiesRoutes,  { prefix: "/api" });
  await app.register(movesRoutes,       { prefix: "/api" });
  await app.register(archetypesRoutes,  { prefix: "/api" });
  await app.register(pokedexRoutes,     { prefix: "/api" });

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
