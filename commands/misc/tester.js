module.exports = {
    commands: ['tester', 'guineapig', 'guneapig', 'guinepig'],
    permissionError: 'You need permissions to run this command',
    minArgs: 0,
    maxArgs: 0,
    callback: async (client, message, arguments, text) => {
        const { guild, member } = message
        const roleAdd = guild.roles.cache.find(role => role.name === 'Xantester')
        let chan = await client.channels.fetch('811829956908286002')          // Main Server
        if(!chan) chan = await client.channels.fetch('322122208837369856')    // Dev Server
        if(!chan) return

        member.roles.add(roleAdd)
        message.reply(`Welcome little Guinea Pig! See the ${chan.toString()} channel.`)
    },
}