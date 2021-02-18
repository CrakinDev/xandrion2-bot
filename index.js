const Discord = require('discord.js')
const config = require('./config.json')
const command = require('./command')
const roleClaim = require('./role-claim')

const client = new Discord.Client()
client.on('ready', () => {
    console.log('The client is ready!')

    roleClaim(client)

    command(client, ['ping', 'test'], message => {
        message.channel.send('Pong!')
    })

    command(client, 'servers', message => {
        client.guilds.cache.forEach((guild) => {
            message.channel.send(`${guild.name} has a total of ${guild.memberCount} members`)
        })
    })

    command(client, 'serverinfo', message => {
        const { guild } = message
        const { name, region, memberCount, owner, afkTimeout } = guild
        const icon = guild.iconURL()

        const embed = new Discord.MessageEmbed()
            .setTitle(`Server Info for "${name}"`)
            .setThumbnail(icon)
            .addFields(
                {
                    name: 'Region',
                    value: region
                },
                {
                    name: 'Members',
                    value: memberCount
                },
                {
                    name: 'Owner',
                    value: owner.user.tag
                },
                {
                    name: 'AFK Timeout',
                    value: afkTimeout / 60
                }
            )
        
        message.channel.send(embed)
    })



    command(client, 'status', (message) => {
        if(message.member.hasPermission('ADMINISTRATOR'))
        {
            const content = message.content.replace('!status ', '')

            client.user.setPresence({
                activity: {
                    name: content,
                    type: 0,
                },
            })
        }
    })

    // command(client, 'embed', (message) => {
    //     const logo = 'https://images.theconversation.com/files/93616/original/image-20150902-6700-t2axrz.jpg'
    //     const embed = new Discord.MessageEmbed()
    //         .setTitle('Example text embed')
    //         .setURL('https://crakin.dev')
    //         .setAuthor(message.author.username)
    //         .setImage(logo)
    //         .setThumbnail(logo)
    //         .setFooter('This is a Footer', logo)
    //         .setColor('#00AAFF')
    //         .addFields(
    //             {
    //                 name: 'Field 1',
    //                 value: 'Hello World',
    //                 inline: true,
    //             },
    //             {
    //                 name: 'Field 2',
    //                 value: 'Hello World',
    //                 inline: true,
    //             },
    //             {
    //                 name: 'Field 3',
    //                 value: 'Hello World',
    //                 inline: true,
    //             },
    //             {
    //                 name: 'Field 4',
    //                 value: 'Hello World',
    //             },
    //         )
    //     message.channel.send(embed)
    // })
})

client.login(config.token)