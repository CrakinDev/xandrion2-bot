//const config = require('../../config.json')
const prefix = process.env.PREFIX
const Discord = require('discord.js')
const BungieLib = require( 'bungie-net-api' );

const mongo = require('../../mongo')
const discordGuardianSchema = require("../../schemas/discord-guardian-schema");
const guardianActivitySchema = require('../../schemas/guardian-activity-schema');

const cache = {} // { memberId: [bungieAcctNum, [charId1, charId2, charId3]] }
const msgDuration = 10
const bungieApi = new BungieLib({"key" : process.env.BUNGIE_KEY, "clientId" : process.env.BUNGIE_CLIENT_ID, "clientSecret" : process.env.BUNGIE_CLIENT_SECRET})

module.exports = {
    commands: ['last'],
    expectedArgs: '<count> <activity>',
    permissionError: 'You need permissions to run this command',
    minArgs: 2,
    maxArgs: 2,
    callback: async (client, message, arguments, text) => {
        const memberId = message.member.id
        const actCount = arguments[0]
        const activ = arguments[1].toLowerCase()
        let activityMode = ''

        if(actCount < 1 || actCount > 10)
        {
            message.reply(`Activity count incorrect. Please specify an activity count between 1 and 10 (Ex. ${prefix}last 3 trials).`)
            return
        }

        // Validate activity argument
        if(activ == 'strikes' || activ == 'strike')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.STRIKE
        }
        else if(activ == 'nf' || activ == 'nightfall' || activ == 'ordeal')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.SCOREDNIGHTFALL
        }
        else if(activ == 'raid' || activ == 'raids')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.RAID
        }
        else if(activ == 'ib' || activ == 'ironbanner' || activ == 'iron banner')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.IRONBANNER
        }
        else if(activ == 'crucible' || activ == 'pvp')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.ALLPVP
        }
        else if(activ == 'clash')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.CLASH
        }
        else if(activ == 'control')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.CONTROL
        }
        else if(activ == 'mayhem')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.MAYHEM
        }
        else if(activ == 'supremacy')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.SUPREMACY
        }
        else if(activ == 'survival')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.SURVIVAL
        }
        else if(activ == 'countdown' || activ == 'cd')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.COUNTDOWN
        }
        else if(activ == 'rumble' || activ == 'lonewolf')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.RUMBLE
        }
        else if(activ == 'doubles' || activ == 'double')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.ALLDOUBLES
        }
        
        // SHOWDOWN data has been purged from API
        // else if(activ == 'showdown')
        // {
        //     activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.SHOWDOWN
        // }
        else if(activ == 'lockdown' || activ == 'ld')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.LOCKDOWN
        }
        else if(activ == 'scorch' || activ == 'scorched')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.SCORCHED
        }
        else if(activ == 'elim' || activ == 'elimination')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.ELIMINATION
        }
        else if(activ == 'trials' || activ == 'too')
        {
            activityMode = bungieApi.Destiny2.Enums.destinyActivityModeType.TRIALSOFOSIRIS
        }
        else if(parseInt(activ) > 0 && parseInt(active) < 85)
        {
            activityMode = activ       // TEMP!!
        }
        else
        {
            message.reply(`Activity type incorrect. Please specify a valid activity.`)
            return
        }

        // Check if account info already exists in current instance cache.
        let cacheData = cache[memberId]     
        if(!cacheData)
        {
            // Account info does not exist in cache, fetch from db instance.
            await mongo().then(async (mongoose) => {
                try
                {
                    fetchedAccountData = await discordGuardianSchema.findOne({ _id: memberId })
                    cache[memberId] = fetchedAccountData

                    // If account data is still not found, user is not registered.
                    if(!cache[memberId])
                    {
                        message.reply(`Failed to find your registered Guardian data. Please use the ${prefix}registerme command to register first.`)
                    }
                }
                finally
                {
                    mongoose.connection.close()
                }
            })
        }

        // Account data is currently/now cached.
        if(cache[memberId])
        {
            let activityPromises = []
            let allActivityData = []
            let error = false
            let errorReason = ''

            cache[memberId].characterIds.forEach((charId) => {
                activityPromises.push(bungieApi.Destiny2.getActivityHistory({ 'characterId' : charId, 'destinyMembershipId' : cache[memberId].bungieAcct, 'membershipType' : 1, 'count' : 10, 'mode' : activityMode, 'page' : 0 }))
            })
            await Promise.all(activityPromises).then((actData) => {
                try
                {
                    actData.forEach((data) => {
                        if(!data.ErrorCode === 1 || JSON.stringify(data.Response) === "{}")
                        {
                            error = true
                            errorReason = (data.ErrorCode !== 1) ? data.ErrorStatus : 'No ' + getActivityType(activityMode) + ' data available.'
                        }
                        // Combine all data into a single array to be sorted/processed
                        allActivityData = allActivityData.concat(data.Response.activities)
                    })
                    
                    // Sort data to get the latest 10 activities (10 is current application limit)
                    allActivityData.sort((a, b) => {
                        const aTime = new Date(a.period)
                        const bTime = new Date(b.period)
                        return aTime.getTime() < bTime.getTime()
                    })
                }
                catch(e)
                {
                    console.log(e)
                }                
            })
            .catch(e)
            {
                console.log(e)
            }

            // Check if any errors existed in data handling while we are between awaits.
            if(error)
            {
                message.delete()
                message
                .reply(`Error from Bungie.Net API. ${errorReason}`)
                .then((message) => {
                    setTimeout(() => {
                        message.delete()
                    }, 1000 * msgDuration)
                })
                return
            }

            await mongo().then(async (mongoose) => {
                try
                {
                    // Ensure we are only storing the last 10 activities of a type
                    // Currently just deletes all 10 stored entries and replaces it with API query result
                    await guardianActivitySchema.deleteMany(
                        {
                            accountId: cache[memberId].bungieAcct,
                            mode: activityMode
                        }
                    )
                    // Loop through 10 most recent activities fetched, if available.
                    // If a player has not played 10 activities of the type requested, parse as many as we can.
                    let activitiesArray = []
                    let activityLength = allActivityData.length
                    if(activityLength >= 10)
                    {
                        activityLength = 10
                    }
                    else
                    {
                        actCount = activityLength
                    }

                    allActivityData.slice(0, activityLength - 1).forEach(activity => {
                        // Add relevant activity data to array of objects
                        activitiesArray.push(
                            {
                                accountId: cache[memberId].bungieAcct,
                                timestamp: activity.period,
                                directorActivityHash: activity.activityDetails.directorActivityHash,
                                instanceId: activity.activityDetails.instanceId,
                                mode: activity.activityDetails.mode,
                                platform: activity.activityDetails.membershipType,
                                assists: activity.values.assists.basic.value,
                                deaths: activity.values.deaths.basic.value,
                                kills: activity.values.kills.basic.value,
                                efficiency: activity.values.efficiency.basic.value,
                                kdr: activity.values.killsDeathsRatio.basic.value,
                                kdar: activity.values.killsDeathsAssists.basic.value,
                                score: activity.values.score.basic.value,
                                activityDurationSeconds: activity.values.activityDurationSeconds.basic.value
                            })
                        }
                    )
                    
                    // Insert fetched activity data to database collection
                    await guardianActivitySchema.insertMany(activitiesArray)
                    
                    // Initialize stats object to first activity value of each stat.
                    let stats = {
                        'assists': activitiesArray[0].assists,
                        'deaths': activitiesArray[0].deaths,
                        'kills': activitiesArray[0].kills,
                        'efficiency': activitiesArray[0].efficiency,
                        'kdr': activitiesArray[0].kdr,
                        'kdar': activitiesArray[0].kdar,
                        'score': activitiesArray[0].score,
                        'duration': activitiesArray[0].activityDurationSeconds
                    }

                    // Construct response of averages for activity counts greater than 1
                    if(actCount > 1)
                    {
                        // Add up stat totals for each activity up to the specified activity count.
                        // Each stat already initialzed from first activity, start at the second.
                        for(x = 1; x < actCount; x++)
                        {
                            if(activitiesArray[x])
                            {
                                stats['assists'] += activitiesArray[x].assists
                                stats['deaths'] += activitiesArray[x].deaths
                                stats['kills'] += activitiesArray[x].kills
                                stats['efficiency'] += activitiesArray[x].efficiency
                                stats['kdr'] += activitiesArray[x].kdr
                                stats['kdar'] += activitiesArray[x].kdar
                                stats['score'] += activitiesArray[x].score
                                stats['duration'] += activitiesArray[x].activityDurationSeconds
                            }
                        }

                        // Average out each stat value (divide by activity count specified)
                        for(stat in stats)
                        {
                            stats[stat] /= actCount
                        }
                    }

                    // Use relevant data to build response
                    // Each activity has different stats, using a switch case we can present relevant stats in a Discord Embed object.
                    let embed = null
                    let activityName = getActivityType(activityMode)

                    // Construct Discord Embed message response based on parsed data.
                    embed = new Discord.MessageEmbed()
                        .setTitle(`Stat Averages - Last ${actCount} ${activityName} Activities`)
                        .setFooter(`Timestamp: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)
                        .setColor('#00AAFF')
                        .addFields(
                            {
                                name: 'Avg. Kills',
                                value: stats['kills'].toFixed(2),
                                inline: true,
                            },
                            {
                                name: 'Avg. Deaths',
                                value: stats['deaths'].toFixed(2),
                                inline: true,
                            },
                            {
                                name: 'Avg. Assists',
                                value: stats['assists'].toFixed(2),
                                inline: true,
                            },
                            {
                                name: 'K/D Ratio',
                                value: stats['kdr'].toFixed(2),
                                inline: true,
                            },
                            {
                                name: 'K/D/A Ratio',
                                value: stats['kdar'].toFixed(2),
                                inline: true,
                            },
                            {
                                name: 'Avg. Efficiency',
                                value: stats['efficiency'].toFixed(2),
                                inline: true,
                            },
                            {
                                name: 'Avg. Score',
                                value: stats['score'].toFixed(2),
                                inline: true,
                            },
                            {
                                name: 'Avg. Duration',
                                value: `${new Date(stats['duration'] * 1000).toISOString().substr(11, 8)}`,
                                inline: true,
                            },
                        )

                    // If embed was successfully constructed, send to channel.
                    if(embed)
                    {
                        message.channel.send(embed)
                    }
                    // If not, return error.
                    else
                    {
                        message.reply(`Failed to aggregate stats. Please try again later.`)
                    }
                }
                finally
                {
                    mongoose.connection.close()
                }
            })
        }
        // Guardian data (account IDs from Bungie.net) is not in cache or database. User needs to use the registerme command first.
        else
        {
            message.reply(`Failed to find your registered Guardian data. Please use the ${prefix}registerme command to register first.`)
        }
    },
}

getActivityType = (activityMode) => {
    let activityName = ''
    
    switch(activityMode)
    {
        // PVE Activities
        case bungieApi.Destiny2.Enums.destinyActivityModeType.STRIKE:
            activityName = 'Strike'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.RAID:
            activityName = 'Raid'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.ALLPVE:
            activityName = 'PvE'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.SCOREDNIGHTFALL:
            activityName = 'Nightfall'
            break
        
        // PVP Activities
        case bungieApi.Destiny2.Enums.destinyActivityModeType.ALLPVP:
            activityName = 'Crucible'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.CONTROL:
            activityName = 'Control'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.CLASH:
            activityName = 'Clash'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.ALLMAYHEM:
            activityName = 'Mayhem'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.SUPREMACY:
            activityName = 'Supremacy'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.SURVIVAL:
            activityName = 'Survival'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.COUNTDOWN:
            activityName = 'Countdown'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.RUMBLE:
            activityName = 'Rumble'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.ALLDOUBLES:
            activityName = 'Doubles'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.SHOWDOWN:
            activityName = 'Showdown'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.LOCKDOWN:
            activityName = 'Lockdown'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.SCORCHED:
            activityName = 'Scorched'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.ELIMINATION:
            activityName = 'Elimination'
            break
        
        // Specialty PVP Activities
        case bungieApi.Destiny2.Enums.destinyActivityModeType.IRONBANNER:
            activityName = 'Iron Banner'
            break
        case bungieApi.Destiny2.Enums.destinyActivityModeType.TRIALSOFOSIRIS:
            activityName = 'Trials of Osiris'
            break
    }
    return activityName
}