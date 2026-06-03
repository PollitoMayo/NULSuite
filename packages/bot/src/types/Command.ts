import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";

export interface Command {
  data: SlashCommandSubcommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
