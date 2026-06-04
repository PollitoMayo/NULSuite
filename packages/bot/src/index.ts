import * as Sentry from "@sentry/node";
import { ExtendedClient } from "./types/ExtendedClient.js";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "production",
  sendDefaultPii: true,
});
import { loadCommands } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";

const token = process.env.DISCORD_TOKEN;

if (!token) throw new Error("DISCORD_TOKEN is not set in environment variables.");

const client = new ExtendedClient();

(async () => {
  await loadCommands(client);
  await loadEvents(client);
  await client.login(token);
})();
