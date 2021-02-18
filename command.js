const { prefix } = require('./config.json')

module.exports = (client, aliases, callback) => {
    // If the received alias is of type string, convert to array to comply
    if(typeof aliases === 'string')
    {
        aliases = [aliases]
    }

    client.on('message', message => {
        const { content } = message;

        aliases.forEach(alias => {
            const command = `${prefix}${alias}`

            if(content.startsWith(`${command} `) || content === command)
            {
                console.log(`Running the command ${command}`)
                callback(message)
            }
        });
    })
}