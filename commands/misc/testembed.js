const Discord = require('discord.js')

module.exports = {
    commands: ['testembed'],
    expectedArgs: '<status text>',
    permissionError: 'You need admin permissions to run this command',
    minArgs: 0,
    maxArgs: 0,
    callback: (client, message, arguments, text) => {
        const logo = 'https://images.theconversation.com/files/93616/original/image-20150902-6700-t2axrz.jpg'
        const embed = new Discord.MessageEmbed()
            .setTitle('Example text embed')
            .setURL('https://crakin.dev')
            .setAuthor(message.author.username)
            .setImage(logo)
            .setThumbnail(logo)
            .setFooter('This is a Footer', logo)
            .setColor('#00AAFF')
            .addFields(
                {
                    name: 'Field 1',
                    value: 'Hello World',
                    inline: true,
                },
                {
                    name: 'Field 2',
                    value: 'Hello World',
                    inline: true,
                },
                {
                    name: 'Field 3',
                    value: 'Hello World',
                    inline: true,
                },
                {
                    name: 'Field 4',
                    value: 'Hello World',
                },
            )
        message.channel.send(embed)
    },
    permissions: ['ADMINISTRATOR'],
    requiredRoles: ['Architects']
}