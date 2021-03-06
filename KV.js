async function f_connstring() {
    const KeyVault = require('azure-keyvault');
    const { AuthenticationContext } = require('adal-node')
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const vaultUrl = process.env.VAULT_URL ;
    const vaultName = process.env.VAULT_NAME ;
    const vaultKey = process.env.VAULT_KEY ;

    var secretAuthenticator = function (challenge, callback) {

        var context = new AuthenticationContext(challenge.authorization);
        return context.acquireTokenWithClientCredentials(
            challenge.resource,
            clientId,
            clientSecret,
            function (err, tokenResponse) {
                if (err) throw err;

                var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
                return callback(null, authorizationValue);
            });
    };

    var credentials = new KeyVault.KeyVaultCredentials(secretAuthenticator);
    var client = new KeyVault.KeyVaultClient(credentials);

    var result = await client.getSecret(vaultUrl, vaultName, vaultKey);
        

    return result.value.toString();
    //console.log(result.value);
}
module.exports.f_connstring = f_connstring;

async function f_redistring() {
    const KeyVault = require('azure-keyvault');
    const { AuthenticationContext } = require('adal-node')
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const vaultUrl = process.env.VAULT_URL ;
    const vaultName = process.env.VAULT_REDISNAME ;
    const vaultKey = process.env.VAULT_REDISKEY ;



    var secretAuthenticator = function (challenge, callback) {

        var context = new AuthenticationContext(challenge.authorization);
        return context.acquireTokenWithClientCredentials(
            challenge.resource,
            clientId,
            clientSecret,
            function (err, tokenResponse) {
                if (err) throw err;

                var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
                return callback(null, authorizationValue);
            });
    };

    var credentials = new KeyVault.KeyVaultCredentials(secretAuthenticator);
    var client = new KeyVault.KeyVaultClient(credentials);
    var result = await client.getSecret(vaultUrl, vaultName, vaultKey);
        

    return result.value.toString();
}
module.exports.f_redistring = f_redistring;