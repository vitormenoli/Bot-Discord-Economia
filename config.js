require('dotenv').config()

const config = { // Dados derivados do arquivo .env
    discord: {
        token: process.env.DISCORD_BOT_TOKEN,
        color: 'Purple'
    },
    mongo_db: {
        uri: process.env.MONGODB_URI
    }
}

module.exports = config