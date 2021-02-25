const mongoose = require('mongoose')

const discordGuardianSchema = mongoose.Schema({
    discordId: {
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
    },
    discordTag: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false
    },
    guilds: {
        type: Array,
        required: false
    }
})

module.exports = mongoose.model('discord-users', discordGuardianSchema)