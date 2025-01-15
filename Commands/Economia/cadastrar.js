const Discord = require("discord.js")
const User = require("../../Modules/Database/User")

module.exports = {
  name: 'cadastrar', // Coloque o nome do comando
  description: 'Se cadastre no banco de dados do bot.', // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const user = new User()
    const userId = interaction.user.id

    try {
        await user.create(userId)

        const embed = new Discord.EmbedBuilder().setColor('Green').setTitle('Sucesso')
        .setDescription(`- Você se cadastrou!\n- Use \`/help\` para ver a lista de comandos.`)

        interaction.reply({ embeds: [embed] })
    } catch (error) {
        if (error.message.includes('cadastrado')) {
            const embed = new Discord.EmbedBuilder().setColor('Red').setTitle('Erro')
            .setDescription(`- Você já se cadastrou!\n- Use \`/help\` para ver a lista de comandos.`)

            interaction.reply({ embeds: [embed] })
        } else {
            console.log(error)
            user.sendErrorMessage(interaction, 'cadastrar')
        }
    }
  }
}