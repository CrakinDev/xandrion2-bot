const firstMessage = require('./first-message')

module.exports = client => {
    const channelID = '811829956908286002'

    const getEmoji = emojiName => client.emojis.cache.find(emoji => emoji.name === emojiName)

    const emojis = {
        steam: 'PC',
        xbox: 'Xbox',
        ps4: 'PS4',
        stadia: 'Stadia'
    }

    const reactions = []

    let emojiText = 'Add a reaction to claim a role\n\n'
    for(const key in emojis)
    {
        const emoji = getEmoji(key)
        reactions.push(emoji)

        const role = emojis[key]
        emojiText += `${emoji} = ${role}\n`
    }

    firstMessage(client, channelID, emojiText, reactions)

    const handleReaction = (reaction, user, add) => {
        if(user.id === '322121581046267906')
        {
            return
        }

        const emoji = reaction._emoji.name

        const { guild } = reaction.message
        
        const roleName = emojis[emoji]
        if(!roleName) return

        const role = guild.roles.cache.find(role => role.name === roleName)
        const member = guild.members.cache.find(member => member.id === user.id)

        if(add)
        {
            member.roles.add(role)
        }
        else member.roles.remove(role)
    }

    client.on('messageReactionAdd', (reaction, user) => {
        if(reaction.message.channel.id === channelID)
        {
            handleReaction(reaction, user, true)
        }
    })

    client.on('messageReactionRemove', (reaction, user) => {
        if(reaction.message.channel.id === channelID)
        {
            handleReaction(reaction, user, false)
        }
    })
}