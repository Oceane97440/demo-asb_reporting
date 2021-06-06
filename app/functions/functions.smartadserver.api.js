const dbApi = require("../config/config.api");
const ModelInsertions = require("../models/models.insertions");

exports.config = function (method, params = '') {

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
        case 'campaignsInsertions':
            campaign_id = params.campaign_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/campaigns/'+campaign_id+'/insertions/';
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
        case 'insertions_templates':
            insertion_id = params.insertion_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions/' +
                    insertion_id + '/insertiontemplates';
            break;
        case 'insertions_status':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions_status';
            break;
        case 'insertions_priorities':
                var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertionpriorities';
                break;   
        case 'creatives':
            insertion_id = params.insertion_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions/' +
                    insertion_id + '/creatives';
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
/*
        //condition config
        params: {
            limit: limit,
            offset: offset
           // isArchived: "both"
        }*/
    };

    if(params.limit) { config['params']['limit'] = params.limit;}
    if(params.offset) { config['params']['offset'] = params.offset;}
    if(params.isArchived) { config['params']['isArchived'] = params.isArchived;}

    return config;
}