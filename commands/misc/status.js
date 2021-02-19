module.exports = {
    commands: ['status'],
    expectedArgs: '<status text>',
    permissionError: 'You need admin permissions to run this command',
    minArgs: 1,
    callback: (client, message, arguments, text) => {
        client.user.setPresence({
            activity: {
                name: text,
                type: 0,
            },
        })
    },
    permissions: ['ADMINISTRATOR'],
    requiredRoles: ['Architects']
}