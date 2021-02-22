const BungieLib = require( 'bungie-net-api' );
const { bKey, bClientId, bClientSecret } = require('./config.json')

module.exports = () => {
    const bungieApi = new BungieLib({"key" : bKey, "clientId" : bClientId, "clientSecret" : bClientSecret})
    return bungieApi
}