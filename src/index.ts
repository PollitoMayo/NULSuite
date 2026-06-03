import { ExtendedClient } from "./types/ExtendedClient.js";
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
