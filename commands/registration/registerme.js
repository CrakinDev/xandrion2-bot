//const config = require('../../config.json')
const BungieLib = require( 'bungie-net-api' );

const mongo = require('../../mongo')
const discordGuardianSchema = require("../../schemas/discord-guardian-schema")

const cache = {}
const msgDuration = 10

module.exports = {
    commands: ['registerme'],
    expectedArgs: '<username> <platform>',
    permissionError: 'You need permissions to run this command',
    minArgs: 2,
    maxArgs: 2,
    callback: async (client, message, arguments, text) => {
        const memberId = message.member.id

        let username = arguments[0]
        let platform = arguments[1]

        const bungieApi = new BungieLib({"key" : process.env.BUNGIE_KEY, "clientId" : process.env.BUNGIE_CLIENT_ID, "clientSecret" : process.env.BUNGIE_CLIENT_SECRET})

        // Check if data already exists in current instance cache.
        let cacheData = cache[memberId]     // { memberId: [username, platform, bungieAcct] }
        if(!cacheData)
        {
            if(arguments[1] === "1" || arguments[1].toLowerCase() === 'xbox' || arguments[0].toLowerCase() === 'xbl')
            {
                platform = bungieApi.Destiny2.Enums.bungieMembershipType.TIGERXBOX
            }
            else if(arguments[1] === "2" || arguments[1].toLowerCase() === 'playstation' || arguments[0].toLowerCase() === 'psn')
            {
                platform = bungieApi.Destiny2.Enums.bungieMembershipType.TIGERPSN
            }
            else if(arguments[1] === "3" || arguments[1].toLowerCase() === 'steam' || arguments[0].toLowerCase() === 'pc')
            {
                platform = bungieApi.Destiny2.Enums.bungieMembershipType.TIGERSTEAM
            }
            else if(arguments[1] === "5" || arguments[1].toLowerCase() === 'stadia' || arguments[0].toLowerCase() === 'google')
            {
                platform = bungieApi.Destiny2.Enums.bungieMembershipType.TIGERSTADIA
            }

            // Bungie API Call
            await bungieApi.Destiny2.searchPlayer( username, platform ).then(async (acctData) => {
                console.log(acctData.Response[0])               

                // If Bungie Response is valid
                if(acctData.ErrorCode === 1)
                {
                    const bMembershipId = acctData.Response[0].membershipId
                    await bungieApi.Destiny2.getProfile( bMembershipId, platform ).then(async (charData) => { 
                        //console.log(charData)
                        if(charData.ErrorCode === 1)
                        {
                            cache[memberId] = cacheData = [username, platform, bMembershipId]

                            // Mongo Write
                            await mongo().then(async (mongoose) => {
                                try
                                {
                                    await discordGuardianSchema.findOneAndUpdate(
                                        {
                                            discordId: memberId
                                        },
                                        {
                                            discordId: memberId,
                                            platform: cacheData[1],
                                            name: cacheData[0],
                                            bungieAcct: cacheData[2],
                                            characterIds: charData.Response.profile.data.characterIds
                                        },
                                        {
                                            upsert: true
                                        }
                                    )
                                    message.delete()
                                    message
                                    .reply(`Account "${cacheData[0]}" on platform "${cacheData[1]}" with Bungie.net Account ID ${cacheData[2]} has been registered.`)
                                    .then((message) => {
                                        setTimeout(() => {
                                            message.delete()
                                          }, 1000 * msgDuration)
                                    })
                                }
                                finally
                                {
                                    mongoose.connection.close()
                                }
                            })
                        }
                        else
                        {
                            message.delete()
                            message
                            .reply(`Error from Bungie.Net API: ${acctData.ErrorStatus}`)
                            .then((message) => {
                                setTimeout(() => {
                                    message.delete()
                                  }, 1000 * msgDuration)
                            })
                        }
                    })
                }
                else
                {
                    message.delete()
                    message
                    .reply(`Error from Bungie.Net API: ${acctData.ErrorStatus}`)
                    .then((message) => {
                        setTimeout(() => {
                            message.delete()
                          }, 1000 * msgDuration)
                    })
                }
            })
        }
        else
        {
            message.delete()
            message
            .reply(`Account "${cacheData[0]}" on platform "${cacheData[1]}" with Bungie.net Account ID ${cacheData[2]} is already registered.`)
            .then((message) => {
                setTimeout(() => {
                    message.delete()
                  }, 1000 * msgDuration)
            })
        }
    },
}