import { readdirSync } from "fs";
import { join } from "path";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID;
const isDev = process.env.NODE_ENV === "development";

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and CLIENT_ID must be set.");
}

(async () => {
  const nulCommand = new SlashCommandBuilder()
    .setName("nul")
    .setDescription("NUL Bot commands");

  const commandsPath = join(__dirname, "commands");
  const ext = __filename.endsWith(".ts") ? ".ts" : ".js";
  const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith(ext));

  for (const file of commandFiles) {
    const { command } = await import(join(commandsPath, file));
    if (command?.data) {
      nulCommand.addSubcommand(command.data);
      console.log(`[Deploy] Added subcommand: /nul ${command.data.name}`);
    }
  }

  const rest = new REST().setToken(token);

  if (isDev && guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: [nulCommand.toJSON()],
    });
    console.log(`[Deploy] Registered /nul with ${commandFiles.length} subcommand(s) (DEV) in guild ${guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), {
      body: [nulCommand.toJSON()],
    });
    console.log(`[Deploy] Registered /nul with ${commandFiles.length} subcommand(s) (PROD)`);
  }
})();
