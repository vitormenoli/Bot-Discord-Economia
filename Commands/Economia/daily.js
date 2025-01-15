const Discord = require("discord.js")
const cor = require('../../config.js').discord.color
const User = require("../../Modules/Database/User")

module.exports = {
  name: 'daily', // Coloque o nome do comando
  description: 'Resgate suas moedas diárias.', // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const userId = interaction.user.id 
    const database = new User()
    
    try {
        const userDatabase = await database.find(userId)

        if (!userDatabase) {
            database.sendUndefinedUserMessage(interaction, userMentioned)
            return
        }

        const lastDaily = userDatabase.lastDaily || 0
        const now = Date.now()

        const lastDailyTimestamp = new Date(lastDaily).getTime()

        const miliseconds = 24 * 60 * 60 * 1000 // 24 horas em milisegundos

        if (now - lastDailyTimestamp < miliseconds) {
            const nextDailyTimestamp = Math.floor((lastDailyTimestamp + miliseconds) / 1000)

            const embed = new Discord.EmbedBuilder().setColor(cor).setTitle('Daily')
            .setDescription(`- Você já coletou suas moedas diárias.\n- Tente novamente <t:${nextDailyTimestamp}:R>.`)

            interaction.reply({ embeds: [embed] })
            return
        }

        const dailyReward = Math.floor(Math.random() * 801) + 200 // Gera um número entre 200 e 1000
        userDatabase.coins += dailyReward
        userDatabase.lastDaily = new Date()

        await userDatabase.save()

        const embed = new Discord.EmbedBuilder().setColor(cor).setTitle('Daily')
        .setDescription(`- Você recebeu \`${dailyReward}\` moedas.\n- Agora você possui \`${userDatabase.coins}\` moedas.`)

        interaction.reply({ embeds: [embed] })

    } catch (error) {
        console.error(error)
        database.sendErrorMessage(interaction, 'daily')
    }
  }
}