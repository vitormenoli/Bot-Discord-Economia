const Discord = require("discord.js")
const cor = require('../../config.js').discord.color
const User = require("../../Modules/Database/User")

module.exports = {
  name: 'balance', // Coloque o nome do comando
  description: 'Veja a carteira de usuários.', // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: 'usuário',
        description: 'Mencione um usário.',
        type: Discord.ApplicationCommandOptionType.User,
        required: false,
    }
  ],

  run: async (client, interaction) => {
    const userMentioned = interaction.options.getUser('usuário') || interaction.user

    const database = new User()

    const userDatabase = await database.find(userMentioned.id)

    if (!userDatabase) {
        database.sendUndefinedUserMessage(interaction, userMentioned)
        return
    }

    const embed = new Discord.EmbedBuilder().setColor(cor).setTitle('Balance')
    
    if (userMentioned.id === interaction.user.id) {
        embed.setDescription(`- Você possui \`${userDatabase.coins}\` moedas.`)
    } else {
        embed.setDescription(`- O usuário ${userMentioned} possui \`${userDatabase.coins}\` moedas.`)
    }
    
    interaction.reply({ embeds: [embed] })
  }
}