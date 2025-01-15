const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    coins: {
        type: Number,
        default: 0
    },
    lastDaily: {
        type: Date,
        default: null
    }
})

module.exports = mongoose.model('User', UserSchema)