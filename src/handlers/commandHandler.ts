import { readdirSync } from "fs";
import { join } from "path";
import { ExtendedClient } from "../types/ExtendedClient.js";

export async function loadCommands(client: ExtendedClient): Promise<void> {
  const commandsPath = join(__dirname, "..", "commands");
  const ext = __filename.endsWith(".ts") ? ".ts" : ".js";
  const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith(ext));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const { command } = await import(filePath);
    if (command?.data && command?.execute) {
      client.commands.set(command.data.name, command);
      console.log(`[Commands] Loaded: ${command.data.name}`);
    } else {
      console.warn(`[Commands] Skipping ${file}: missing data or execute`);
    }
  }
}
