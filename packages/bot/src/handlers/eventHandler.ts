import { readdirSync } from "fs";
import { join } from "path";
import { ExtendedClient } from "../types/ExtendedClient.js";

export async function loadEvents(client: ExtendedClient): Promise<void> {
  const eventsPath = join(__dirname, "..", "events");
  const ext = __filename.endsWith(".ts") ? ".ts" : ".js";
  const eventFiles = readdirSync(eventsPath).filter((f) => f.endsWith(ext));

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const { event } = await import(filePath);
    if (!event?.name || !event?.execute) {
      console.warn(`[Events] Skipping ${file}: missing name or execute`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(`[Events] Registered: ${event.name}`);
  }
}
