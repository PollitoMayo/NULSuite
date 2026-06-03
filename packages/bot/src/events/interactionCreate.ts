import { Events, Interaction } from "discord.js";
import { ExtendedClient } from "../types/ExtendedClient.js";

const COMMAND_TIMEOUT_MS = 10_000;

export const event = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: Interaction, client: ExtendedClient) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "nul") return;

    const subcommandName = interaction.options.getSubcommand();
    const command = client.commands.get(subcommandName);
    if (!command) {
      console.warn(`[Commands] Unknown subcommand: /nul ${subcommandName}`);
      return;
    }

    const deferTimer = setTimeout(async () => {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply().catch(() => null);
      }
    }, 2000);

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Command timed out")), COMMAND_TIMEOUT_MS)
    );

    try {
      await Promise.race([command.execute(interaction), timeout]);
    } catch (error) {
      console.error(`[Commands] Error in /nul ${subcommandName}:`, error);
      const content =
        error instanceof Error && error.message === "Command timed out"
          ? "This command took too long to respond."
          : "There was an error executing this command.";
      const reply = { content, ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => null);
      } else {
        await interaction.reply(reply).catch(() => null);
      }
    } finally {
      clearTimeout(deferTimer);
    }
  },
};
