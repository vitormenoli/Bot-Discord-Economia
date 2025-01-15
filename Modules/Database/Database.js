const mongoose = require('mongoose')
require('colors')

class Database {
    #mongoUri

    constructor(mongoUri) {
        this.#mongoUri = mongoUri
    }

    async connect() {
        try {
            await mongoose.connect(this.#mongoUri)
            console.log(`🍃 MongoDB foi conectada!`.green)
        } catch (error) {
            console.error(`❌ Erro ao conectar ao MongoDB: ${error}`.red)
        }
    }
}

module.exports = Database