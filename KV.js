async function f_getsecrets() {
    
    const KeyVault = require('azure-keyvault');
    const { AuthenticationContext } = require('adal-node')
    var clientId = process.env.CLIENT_ID;
    var clientSecret = process.env.CLIENT_SECRET;
    var secretUrl = process.env.SECRET_URL ;
    var vaultName = process.env.VAULT_NAME ;
    var vaultKey = process.env.VAULT_KEY ;   
           
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
        

    return result.value.toString();
    //console.log(result.value);
}
module.exports.f_getsecrets = f_getsecrets;
