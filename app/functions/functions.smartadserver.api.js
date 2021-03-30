const dbApi = require("../config/config.api");

exports.config = function (method, offset = 0, limit = 100) {

    switch (method) {
        case 'advertisers':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/advertisers/';
            break;
        case 'campaigns':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/campaigns/';
            break;
        default:

            break;
    }

    var config = {
        method: 'GET',
        url: configApiUrl,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        auth: {
            username: dbApi.SMART_login,
            password: dbApi.SMART_password
        },
        params: {
            limit : limit, 
            offset : offset         
        }
    };

    return config;
}
