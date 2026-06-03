import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";

export const command: Command = {
  data: new SlashCommandSubcommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and latency info"),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `Pong! Latency: **${latency}ms** | API: **${interaction.client.ws.ping}ms**`
    );
  },
};
