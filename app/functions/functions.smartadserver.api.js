const dbApi = require("../config/config.api");

exports.config = function (method, offset = 0, limit = 100) {

    switch (method) {
        case 'agencies':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/agencies/';
            break;
        case 'advertisers':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/advertisers/';
            break;
        case 'campaigns':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/campaigns/';
            break;
        case 'formats':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/formats';
            break;
        case 'sites':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/sites';
            break;
        case 'templates':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/templates';
            break;
        case 'platforms':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/platforms';
            break;
        case 'deliverytypes':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/deliverytypes';
            break;
        case 'countries':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/countries';
            break;
        case 'insertions':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions';
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
            limit: limit,
            offset: offset,
           isArchived : "both"
        }
    };

    return config;
}