const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember]});
const config = require("./src/config.js");
const { readdirSync } = require("fs")
const moment = require("moment");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const db = require("croxydb")
const token = config.token || process.env.token
const { EmbedBuilder, SelectMenuBuilder, PermissionsBitField, RoleSelectMenuBuilder, ActionRowBuilder,ChannelSelectMenuBuilder } = require("discord.js");

client.commands = new Collection()

const rest = new REST({ version: '10' }).setToken(token);

const log = l => { console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`) };

//command-handler
const commands = [];
readdirSync('./src/commands').forEach(async file => {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
})

client.on("ready", async () => {
        try {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
        } catch (error) {
            console.error(error);
        }
    log(`Bot logged in as ${client.user.tag}!`);
})

//event-handler
readdirSync('./src/events').forEach(async file => {
	const event = require(`./src/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
})


client.on("interactionCreate",async(interaction) => {
if(interaction.customId === "select") {
  const embed = new EmbedBuilder()
  .setColor("Red")
  .setDescription("Choose which channel you want from the menu below!")
  const row = new ActionRowBuilder()
  .addComponents(
      new ChannelSelectMenuBuilder()
          .setCustomId('select2')
          .setPlaceholder('Select Channel!')
  )
  await interaction.update({embeds: [embed],components:[row]}).then(mesaj => {
db.set(`roles_${mesaj.id}`, interaction.values[0])
  })
}
if(interaction.customId === "select2") {
const channel = interaction.values[0]
const channel2 = client.channels.cache.get(channel)
if(channel2.type !== 0) return interaction.reply("Please tag a text channel!")
const data = db.fetch(`roles_${interaction.message.interaction.id}`)

console.log(data)
const embed = new EmbedBuilder()
.setDescription("You can choose a role from the menu below!")
.setColor("Red")
const row = new ActionRowBuilder()
    .addComponents(
      new SelectMenuBuilder()
      .setCustomId("select3")
      .setPlaceholder('Give Role!')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
       
 
        {
          label:"Role",
          description:"Give Role",
          value:"roles",
          emoji:"<:Member_Virtual:809468078999732254>"
        },
     
        ])
      )
    channel2.send({embeds:[embed],components:[row]}).then(mesaj => {
      db.set(`roles_${mesaj.id}`, data)
 interaction.message.delete()
    })
}
if(interaction.customId==="select3") {
  const data = db.fetch(`roles_${interaction.message.id}`)
  if(!interaction.member.roles.cache.has(data)) { 
    interaction.member.roles.add(data)
  interaction.reply({content: "I have successfully given you the role.", ephemeral: true})
   } else {
     
    interaction.member.roles.remove(data)
  interaction.reply({content: "I have successfully reclaimed the role from you.", ephemeral: true})
}

}

})
client.login(token)
