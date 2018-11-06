async function f_getsecrets() {
    const KeyVault = require('azure-keyvault');
    const { AuthenticationContext } = require('adal-node')
    var clientId = 'd90c76b1-4238-46ad-b470-871eb53391fe';
    var clientSecret = 'ZY3LZWFMamdyA5Au7DI8SS58IYtCpd1QWmx434FvCg4=';
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

    const secretUrl = "https://myc4tskv.vault.azure.net/secrets/myc4tscosmosdb/cc9492c5c5b54222be2008cc86c39f14";
    var credentials = new KeyVault.KeyVaultCredentials(secretAuthenticator);
    var client = new KeyVault.KeyVaultClient(credentials);

    var result = await client.getSecret("https://myc4tskv.vault.azure.net", "myc4tscosmosdb", "cc9492c5c5b54222be2008cc86c39f14");
        

    return result.value.toString;
    //console.log(result.value);
}
module.exports.f_getsecrets = f_getsecrets;