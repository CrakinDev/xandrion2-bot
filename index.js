const path = require('path')
const fs = require('fs')

const Discord = require('discord.js')
//const config = require('./config.json')
require('dotenv').config()
const mongo = require('./mongo')

const BungieLib = require( 'bungie-net-api' );

const roleClaim = require('./harbinger-role-claim')

const client = new Discord.Client()
client.on('ready', async () => {
    console.log('The client is ready!')

    const baseFile = 'command-base.js'
    const commandBase = require(`./commands/${baseFile}`)

    const readCommands = dir => {
        const files = fs.readdirSync(path.join(__dirname, dir))

        for(const file of files)
        {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if(stat.isDirectory())
            {
                readCommands(path.join(dir, file))
            }
            else if(file !== baseFile)
            {
                const option = require(path.join(__dirname, dir, file))
                commandBase(client, option)
            }
        }
    }

    readCommands('commands')

    //roleClaim(client)
})
client.login(process.env.DJS_TOKEN)