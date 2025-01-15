const UserSchema = require('../Schemas/User')
const Discord = require('discord.js')

class User {
    async create(userId) {
        const user = await this.find(userId)

        if (user) {
            throw new Error(`Usuário ${user.userId} já está cadastrado.`)
        } else {
            try {
                const newUser = new UserSchema({ userId })

                await newUser.save()

                return newUser
            } catch (error) {
                throw new Error(`Erro ao criar novo usuário: ${error}`)
            }
        }
    }

    async find(userId) {
        const user = await UserSchema.findOne({ userId })

        if (user) {
            return user
        } else {
            return null
        }
    }

    sendErrorMessage(interaction, command) {
        const embed = new Discord.EmbedBuilder().setColor('Red').setTitle('Erro')
        .setDescription(`- Ocorreu um erro com o comando \`/${command}\`.\n- Por favor, tente novamente.`)

        interaction.reply({ embeds: [embed] })
    }

    sendUndefinedUserMessage(interaction, user) {
        const embed = new Discord.EmbedBuilder().setColor('Red').setTitle('Erro')

        if (user.id === interaction.user.id) {
            embed.setDescription(`- Você ainda não está cadastrado.\n- Por favor, utilize \`/cadastrar\`.`)
        } else {
            embed.setDescription(`- O usuário ${user} ainda não está cadastrado.\n- ${user.username} deve utilize \`/cadastrar\`.`)
        }

        interaction.reply({ embeds: [embed] })
    }
}

module.exports = User