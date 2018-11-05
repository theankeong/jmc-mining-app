async function f_getsecrets() {
    
    const KeyVault = require('azure-keyvault');
    const apiAi = require('apiai');
    const { AuthenticationContext } = require('adal-node')
    
    var result2 = '';

    
    module.exports = function(app, server) {

    const clientId = apiAI(Constants.clientId);
    const clientSecret = apiAI(Constants.clientSecret);
    const secretUrl = apiAI(Constants.secretUrl);
    const vaultName = apiAI(Constants.vaultName);
    const vaultKey = apiAI(Constants.vaultKey);
}
    
    
    
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

    
    var result = await client.getSecret(secretUrl, vaultName, vaultKey);
        

    return result.value;
    //console.log(result.value);
}
module.exports.f_getsecrets = f_getsecrets;
