import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Command } from "./Command.js";

export class ExtendedClient extends Client {
  commands: Collection<string, Command> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }
}
