const mongoose = require('mongoose')

const discordGuardianSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    bungieAcct: {
        type: String,
        required: false
    },
    characterIds: {
        type: Array,
        required: false
    }
})

module.exports = mongoose.model('discord-guardians', discordGuardianSchema)