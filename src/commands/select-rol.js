const { EmbedBuilder, PermissionsBitField, RoleSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js")
module.exports = {
  data: new SlashCommandBuilder()
    .setName("select-role")
    .setDescription("Set roles!")
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator),
    run: async (client, interaction) => {
const embed = new EmbedBuilder()
.setColor("Red")
.setDescription("Choose which role you want from the menu below!")
const row = new ActionRowBuilder()
.addComponents(
    new RoleSelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Select Role!')
)
await interaction.reply({embeds: [embed], components:[row]})
        }
 };
