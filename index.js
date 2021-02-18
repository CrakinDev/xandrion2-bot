const Discord = require('discord.js')
const config = require('./config.json')

const client = new Discord.Client()
client.on('ready', () => {
    console.log('The client is ready!')
})

client.login(config.token)