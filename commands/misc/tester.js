module.exports = {
    commands: ['tester', 'guineapig', 'guneapig', 'guinepig'],
    permissionError: 'You need permissions to run this command',
    minArgs: 0,
    maxArgs: 0,
    callback: (client, message, arguments, text) => {
        const { guild, member } = message
        const role = guild.roles.cache.find(role => role.name === 'Xantester')
        let chan = guild.channels.cache.get('811829956908286002')          // Main Server
        if(!chan) chan = guild.channels.cache.get('322122208837369856')    // Dev Server
        if(!chan) return

        member.roles.add(role)
        message.reply(`Welcome little Guinea Pig! See the ${chan.toString()} channel.`)
    },
}