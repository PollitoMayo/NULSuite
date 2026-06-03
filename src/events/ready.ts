import { Client, Events } from "discord.js";

export const event = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    const guilds = client.guilds.cache.map((g) => `  - ${g.name} (${g.id})`).join("\n");
    console.log(
      `[Bot] Online as ${client.user?.tag}\n` +
      `[Bot] Active in ${client.guilds.cache.size} server(s):\n${guilds}`
    );
  },
};
