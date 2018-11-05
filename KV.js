async function f_getsecrets() {
    
    const KeyVault = require('azure-keyvault');
    const apiAi = require('apiai');
    const { AuthenticationContext } = require('adal-node')
    
    var result2 = '';

    
    var azure = require('azure');

    azure.RoleEnvironment.getConfigurationSettings(function(error, settings) {
    if (!error) {
    // You can get the value of setting "setting1" via settings['setting1']
        const clientId = settings['clientId'];
        const clientSecret = settings['clientSecret'];
        const secretUrl = settings['secretUrl'];
        const vaultName = settings['vaultName'];
        const vaultKey = settings['vaultKey'];        
    }
    });
    
      
    
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
