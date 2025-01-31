const Discord = require("discord.js")
const cor = require('../../config.js').discord.color
const User = require('../../Modules/Database/User')
const ms = require('ms')

module.exports = {
  name: 'apostar', // Coloque o nome do comando
  description: 'Aposte moedas com um usuário.', // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: 'usuário',
        description: 'Mencione um usuário.',
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: 'moedas',
        description: 'Quantidade de moedas para apostar.',
        type: Discord.ApplicationCommandOptionType.Number,
        required: true,
    }
  ],

  run: async (client, interaction) => {
    const userMentioned = interaction.options.getUser('usuário')

    const userId = interaction.user.id

    const coinsBet = Math.floor(interaction.options.getNumber('moedas'))

    const database = new User()

    try {
        const userDatabase = await database.find(userId)
        const userMentionedDatabase = await database.find(userMentioned.id)

        const embed = new Discord.EmbedBuilder()

        const validateBet = function(userDatabase, userMentionedDatabase, coinsBet) {
            if (!userDatabase) {
                return '- Você ainda não está cadastrado no banco de dados.\n- Por favor, utilize \`/cadastrar\`.'
            }

            if (userMentioned.bot) {
                return '- Você não pode apostar moedas contra bots.'
            }

            if (!userMentionedDatabase) {
                return `- O usuário ${userMentioned} ainda não está cadastrado no banco de dados.\n- ${userMentioned.username} deve utilizar \`/cadastrar\`.`
            }

            if (userId === userMentioned.id) {
                return '- Você não pode apostar moedas com você mesmo.'
            }

            if (coinsBet <= 0) {
                return '- Você deve apostar apenas valores positivos.'
            }

            if (userDatabase.coins < coinsBet) {
                return `- Você não possui moedas o suficiente para apostar.\n- Seu saldo: \`${userDatabase.coins}\` moedas.`
            }

            if (userMentionedDatabase.coins < coinsBet) {
                return `- O usuário ${userMentioned} não possui moedas o suficiente para apostar.\n- Saldo de ${userMentioned.username}: \`${userMentionedDatabase.coins}\` moedas.`
            }

            return null
        }

        const errorMessage = validateBet(userDatabase, userMentionedDatabase, coinsBet)

        if (errorMessage) {
            embed.setColor(cor).setTitle('Apostar').setDescription(errorMessage)

            return interaction.reply({ embeds: [embed] })
        }

        const embedAcceptBet = new Discord.EmbedBuilder().setColor(cor).setTitle('Apostar')
        .setDescription(`- ${interaction.user} Deseja apostar com você ${userMentioned}!\n- Moedas: \`${coinsBet}\`.\n- A aposta será cancelada automaticamente em 1 minuto caso **${userMentioned.username}** não aceite.`)

        const row = new Discord.ActionRowBuilder()

        const button = new Discord.ButtonBuilder()
        .setCustomId(interaction.id + '-aposta')
        .setEmoji('🤝')
        .setLabel('Apostar!')
        .setStyle(Discord.ButtonStyle.Success)

        row.addComponents(button)

        interaction.reply({ embeds: [embedAcceptBet], components: [row] })

        const filter = (i) => i.user.id === userMentioned.id && i.customId === interaction.id + '-aposta'
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: ms('1m'), max: 1 })

        let accepted = false

        collector.on('collect', async(c) => {
            accepted = true

            await c.deferUpdate()

            const embedLoad = new Discord.EmbedBuilder().setColor(cor).setTitle('🔄 Carregando Aposta')
            .setDescription(`- A aposta de ${interaction.user} foi aceita por ${userMentioned}.\n- O resultado da aposta será gerado em 5 segundos.`)

            interaction.editReply({ embeds: [embedLoad], components: [] })

            setTimeout(async() => {
                const ids = [userId, userMentioned.id]
                const randomId = ids[Math.floor(Math.random() * 2)]

                if (randomId === userId) {
                    embed.setColor(cor).setTitle('Aposta Feita!')
                    .setDescription(`- **${interaction.user.username}** Ganhou a Aposta!\n- **${userMentioned.username}** financiou \`${coinsBet}\` moedas para você!`)

                    userDatabase.coins += coinsBet
                    await userDatabase.save()

                    userMentionedDatabase.coins -= coinsBet
                    await userMentionedDatabase.save()
                } else {
                    embed.setColor(cor).setTitle('Aposta Feita!')
                    .setDescription(`- **${userMentioned.username}** Ganhou a Aposta!\n- Você financiou \`${coinsBet}\` moedas para **${userMentioned.username}**!`)

                    userDatabase.coins -= coinsBet
                    await userDatabase.save()

                    userMentionedDatabase.coins += coinsBet
                    await userMentionedDatabase.save()
                }

                interaction.editReply({ embeds: [embed] })
            }, ms('5s'))
        })

        collector.on('end', () => {
            if (!accepted) {
                embed.setColor(cor).setTitle('Aposta Acancelada!')
                .setDescription(`- ${userMentioned} não aceitou a aposta!`)

                interaction.editReply({ embeds: [embed], components: [] })
            }
        })

    } catch (error) {
        console.error(error)
        database.sendErrorMessage(interaction, 'apostar')
    }
  }
}