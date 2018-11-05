async function f_getsecrets() {
    const KeyVault = require('azure-keyvault');
    const { AuthenticationContext } = require('adal-node')
    var clientId = process.env.clientId;
    var clientSecret = process.env.clientSecret;
    var result2 = '';

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

    var result = await client.getSecret(process.env.secretUrl, process.env.vaultName, process.env.vaultKey);
        

    return result.value;
    //console.log(result.value);
}
module.exports.f_getsecrets = f_getsecrets;
