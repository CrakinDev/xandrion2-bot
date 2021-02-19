const Discord = require('discord.js')

module.exports = {
    commands: ['serverinfo'],
    minArgs: 0,
    maxArgs: 0,
    callback: (client, message, arguments, text) => {
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
    },
}