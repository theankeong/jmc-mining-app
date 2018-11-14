async function f_connstring() {
    const KeyVault = require('azure-keyvault');
    const { AuthenticationContext } = require('adal-node')
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const vaultUrl = process.env.VAULT_URL ;
    const vaultName = process.env.VAULT_NAME ;
    const vaultKey = process.env.VAULT_KEY ;
/*
const KeyVault = require('azure-keyvault');
const { AuthenticationContext } = require('adal-node')
const clientId = "d90c76b1-4238-46ad-b470-871eb53391fe";
const clientSecret = "ZY3LZWFMamdyA5Au7DI8SS58IYtCpd1QWmx434FvCg4=";
const vaultUrl = "https://myc4tskv.vault.azure.net";
const vaultName = "myc4tscosmosdb";
const vaultKey = "cc9492c5c5b54222be2008cc86c39f14";
*/
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

/*
const KeyVault = require('azure-keyvault');
const { AuthenticationContext } = require('adal-node')
const clientId = "d90c76b1-4238-46ad-b470-871eb53391fe";
const clientSecret = "ZY3LZWFMamdyA5Au7DI8SS58IYtCpd1QWmx434FvCg4=";
const vaultUrl = "https://myc4tskv.vault.azure.net";
const vaultName = "myc4tsredis";
const vaultKey = "b7ed7d4d24a34b8a8ee962463a11c438";
*/

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