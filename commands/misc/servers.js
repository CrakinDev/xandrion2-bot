module.exports = {
    commands: ['servers'],
    minArgs: 0,
    maxArgs: 0,
    callback: (client, message, arguments, text) => {
        client.guilds.cache.forEach((guild) => {
            message.channel.send(`${guild.name} has a total of ${guild.memberCount} members`)
        })
    },
}