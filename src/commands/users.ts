import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Command } from "../types/Command.js";

export const command: Command = {
  data: new SlashCommandSubcommandBuilder()
    .setName("users")
    .setDescription("List server members or inspect a specific user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to inspect — omit to list all members")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user");

    if (targetUser) {
      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle(targetUser.username)
        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
        .setColor(member?.displayHexColor ?? "#5865F2")
        .addFields(
          { name: "ID", value: targetUser.id, inline: true },
          { name: "Bot", value: targetUser.bot ? "Yes" : "No", inline: true },
          {
            name: "Account Created",
            value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`,
            inline: true,
          }
        );

      if (member) {
        const roles = member.roles.cache
          .filter((r) => r.id !== interaction.guild!.id)
          .sort((a, b) => b.position - a.position)
          .map((r) => r.toString())
          .join(", ") || "None";

        embed.addFields(
          {
            name: "Joined Server",
            value: member.joinedTimestamp
              ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
              : "Unknown",
            inline: true,
          },
          { name: "Nickname", value: member.nickname ?? "None", inline: true },
          { name: "Highest Role", value: member.roles.highest.toString(), inline: true },
          { name: "Roles", value: roles.length > 1024 ? roles.slice(0, 1021) + "..." : roles }
        );
      }

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.deferReply();

      const members = await interaction.guild.members.fetch();
      const humans = members
        .filter((m) => !m.user.bot)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

      const listed = humans
        .map((m) => `**${m.displayName}** — ${m.roles.highest.name}`)
        .slice(0, 25)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(`Members in ${interaction.guild.name}`)
        .setDescription(listed || "No members found.")
        .setColor("#5865F2")
        .setFooter({
          text: `Showing ${Math.min(humans.size, 25)} of ${humans.size} member(s)`,
        });

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
