const dbApi = require("../config/config.api");
const ModelInsertions = require("../models/models.insertions");
/**
 * Fonction pour l'affichage des données pour le front
 * @param {string} method - string
 * @returns le resultat de la requête
 */
exports.config = function (method, params = '') {

    switch (method) {
        case 'agencies':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/agencies/';
            break;
        case 'advertisers':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/advertisers/';
            break;
        case 'advertiser':
            advertiser_id = params.advertiser_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/advertisers/' +
                advertiser_id;
            break;
        case 'advertisersCampaigns':
            advertiser_id = params.advertiser_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/advertisers/' +
                advertiser_id + '/campaigns/';
            break;
        case 'campaigns':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/campaigns/';
            break;
        case 'campaign':
            campaign_id = params.campaign_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/campaigns/' +
                campaign_id;
            break;
        case 'campaignsInsertions':
            campaign_id = params.campaign_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/campaigns/' +
                campaign_id + '/insertions/';
            break;
        case 'formats':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/formats';
            break;
        case 'sites':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/sites';
            break;
        case 'packs':
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/packs';
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
        case 'insertion':
            insertion_id = params.insertion_id;
            var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions/' + insertion_id;
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
        }
        /*
        //condition config
        params: {
            limit: limit,
            offset: offset
           // isArchived: "both"
        }*/
    };

    if (params.limit) {
        console.log('LIMIT FCT :', params.limit)
        // config.params.limit = params.limit;
        config.params = {
            'limit': params.limit,
            'offset': params.offset,
        };
    }

    if (params.offset) {
        //config['params']['offset'] = params.offset;
        config.params = {
            'limit': params.limit,
            'offset': params.offset,
        };

    }
    if (params.isArchived) {
        config.params = {
            'limit': params.limit,
            'offset': params.offset,
            'isArchived': params.isArchived
        };
    }

    // console.log(config);
    return config;
}

// Function de trie et de récupération de données

exports.sortDataReport = function (formatSearch, dataObject) {
    // Permet de faire l'addition
    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    var insertions = new Array();
    var impressions = new Array();
    var creatives = new Array();
    clicks = new Array();
    complete = new Array();
    var sites = new Array();
    var sites_rename = new Array();

    for (var jn = 0; jn < formatSearch.length; jn++) {
        key = formatSearch[jn];
        site_name = dataObject[key].site_name;
        insertion_name = dataObject[key].insertion_name;
        creative = dataObject[key].image_creative;

        insertions.push(insertion_name);
        impressions.push(parseInt(dataObject[key].impressions));
        clicks.push(parseInt(dataObject[key].clicks));
        complete.push(parseInt(dataObject[key].complete));
        sites_rename.push(site_name);

        // Récupére le nom des sites et les classes Créer les tableaux des sites
        if (site_name.match(/^\SM_LINFO.re{1}/igm)) {
            sites.push('LINFO.RE (site)');
        }
        if (site_name.match(/^\SM_LINFO-ANDROID{1}/igm)) {
            sites.push('LINFO.RE (app)');
        }
        if (site_name.match(/^\SM_LINFO-IOS{1}/igm)) {
            sites.push('LINFO.RE (app)');
        }
        if (site_name.match(/^\SM_ANTENNEREUNION{1}/igm)) {
            sites.push('ANTENNEREUNION.FR (site)');
        }
        if (site_name.match(/^\SM_DOMTOMJOB{1}/igm)) {
            sites.push('DOMTOMJOB.COM (site)');
        }
        if (site_name.match(/^\SM_IMMO974{1}/igm)) {
            sites.push('IMMO974.COM (site)');
        }
        if (site_name.match(/^\SM_RODZAFER_LP{1}/igm)) {
            sites.push('RODZAFER (site)');
        }
        if (site_name.match(/^\SM_RODZAFER_ANDROID{1}/igm)) {
            sites.push('RODZAFER (app)');
        }
        if (site_name.match(/^\SM_RODZAFER_IOS{1}/igm)) {
            sites.push('RODZAFER (app)');
        }
        if (site_name.match(/^\SM_ORANGE_REUNION{1}/igm)) {
            sites.push('ORANGE.RE (site)');
        }
        if (site_name.match(/^\SM_TF1{1}/igm)) {
            sites.push('TF1 (site)');
        }
        if (site_name.match(/^\SM_M6{1}/igm)) {
            sites.push('M6 (site)');
        }
        if (site_name.match(/^\SM_DAILYMOTION{1}/igm)) {
            sites.push('DAILYMOTION (site)');
        }
        if (site_name.match(/^\SM_RODALI{1}/igm)) {
            sites.push('RODALI (site)');
        }

        if (site_name.match(/^\N\/A{1}/i)) {
            // Si N/A
            if (insertion_name.match(/^\DOMTOMJOB{1}/igm)) {
                sites.push('DOMTOMJOB.COM (site)');
            }
            if (insertion_name.match(/^\APPLI LINFO{1}/igm)) {
                sites.push('LINFO.RE (app)');
            }
            if (insertion_name.match(/^\LINFO{1}/igm)) {
                sites.push('LINFO.RE (site)');
            }
            if (insertion_name.match(/^\ANTENNE REUNION{1}/igm)) {
                sites.push('ANTENNEREUNION.FR (site)');
            }
            if (insertion_name.match(/^\ORANGE REUNION{1}/igm)) {
                sites.push('ORANGE.RE (site)');
            }
            if (insertion_name.match(/^\RODZAFER{1}/igm)) {
                sites.push('ANTENNEREUNION.FR (site)');
            }
            if (insertion_name.match(/^\RODALI{1}/igm)) {
                sites.push('ANTENNEREUNION.FR (site)');
            }
            if (insertion_name.match(/^\IMMO974{1}/igm)) {
                sites.push('IMMO974.COM (site)');
            }
            if (insertion_name.match(/^\TF1{1}/igm)) {
                sites.push('TF1 (site)');
            }
            if (insertion_name.match(/^\M6{1}/igm)) {
                sites.push('M6 (site)');
            }
            if (insertion_name.match(/^\DAILYMOTION{1}/igm)) {
                sites.push('DAILYMOTION (site)');
            }

            sites.push('LINFO.RE (site)');
        }

        /*switch (true) {
            case (/1024x768|2048x153/igm).test(creative):
                creatives.push('Interstitiel (desktop)');

                break;
            case (/320x480|720x1280/igm).test(creative):
                creatives.push('Interstitiel (mobile)');

                break;

            case (/1536x2048/igm).test(creative):
                creatives.push('Interstitiel (tablette)');

                break;

            case (/300x600/igm).test(creative):
                creatives.push('Grand Angle (desktop)');

                break;
            case (/300x250|300x250 APPLI/igm).test(creative):
                creatives.push('Grand Angle (mobile)');

                break;


            default:
                break;
        }*/
    }

    // Gestion des sites
    if (sites && (sites.length > 0)) {

        var siteUnique = new Array();
        var siteUniqueKey = new Array();
        var siteUniqueCount = new Array();
        var siteImpressions = new Array();
        var siteViewableImpressions = new Array();
        var siteClicks = new Array();
        var siteComplete = new Array();

        for (var kn = 0; kn < sites.length; kn++) {
            key = formatSearch[kn];
            impressionsSite = parseInt(dataObject[key].impressions);
            clicksSite = parseInt(dataObject[key].clicks);
            completeSite = parseInt(dataObject[key].complete);

            var nameSite = sites[kn];

            // Rentre les impressions
            if (siteUnique[nameSite]) {
                siteUnique[nameSite].splice(siteImpressions[nameSite].length, 1, key);
            } else {
                siteUnique[nameSite] = new Array();
                siteUnique[nameSite][0] = key;
                siteUniqueCount.push(nameSite);
            }

            // Rentre les impressions
            if (siteImpressions[nameSite]) {
                siteImpressions[nameSite].splice(
                    siteImpressions[nameSite].length,
                    1,
                    impressionsSite
                );
            } else {
                siteImpressions[nameSite] = new Array();
                siteImpressions[nameSite][0] = impressionsSite;
            }

            // Rentre les Clicks
            if (siteClicks[nameSite]) {
                siteClicks[nameSite].splice(siteClicks[nameSite].length, 1, clicksSite);
            } else {
                siteClicks[nameSite] = new Array();
                siteClicks[nameSite][0] = clicksSite;
            }

            // Rentre les Complete
            if (siteComplete[nameSite]) {
                siteComplete[nameSite].splice(siteComplete[nameSite].length, 1, completeSite);
            } else {
                siteComplete[nameSite] = new Array();
                siteComplete[nameSite][0] = completeSite;
            }


        }

        //console.log(siteUnique)

        // Trie les données de sites
        if (siteUnique && (siteUniqueCount.length > 0)) {
            //console.log('siteUniqueCount.length  '+siteUniqueCount.length)


            siteList = new Object();
            for (var ln = 0; ln < siteUniqueCount.length; ln++) {
                sN = siteUniqueCount[ln];
                siteImpressionsSUM = siteImpressions[sN].reduce(reducer);
               

                siteClicksSUM = siteClicks[sN].reduce(reducer);

                siteCompleteSUM = siteComplete[sN].reduce(reducer);
                //siteViewableImpressionsSUM = siteViewableImpressions[sN].reduce(reducer);

                siteCtrSUM = parseFloat((siteClicksSUM / siteImpressionsSUM) * 100).toFixed(2);
                siteCtrComplete = parseFloat((siteCompleteSUM / siteImpressionsSUM) * 100).toFixed(
                    2
                );

                var itemSite = {
                    site: sN,
                    impressions: siteImpressionsSUM,
                    clicks: siteClicksSUM,
                    ctr: siteCtrSUM,
                    complete: siteCompleteSUM,
                    ctrComplete: siteCtrComplete,
                };
                siteList[ln] = itemSite;
                //console.log(itemSite)

                // console.log('-----------------')
            }


        }
    }
    //function qui permet de regrouper les insertions par créative
    /*
    if (creatives && (creatives.length > 0)) {


        var creativeUnique = new Array();
        var creativeUniqueCount = new Array();
        var creativeImpressions = new Array();
        var creativeClicks = new Array();
        var creativeComplete = new Array();

        for (var kn = 0; kn < creatives.length; kn++) {
            key = formatSearch[kn];
            impressionsSite = parseInt(dataObject[key].impressions);
            clicksSite = parseInt(dataObject[key].clicks);
            completeSite = parseInt(dataObject[key].complete);
            //  viewableimpressionsSite = parseInt(dataObject[key].viewable_impressions);

            var nameSite = creatives[kn];

            // Rentre les impressions
            if (creativeUnique[nameSite]) {
                creativeUnique[nameSite].splice(creativeImpressions[nameSite].length, 1, key);
            } else {
                creativeUnique[nameSite] = new Array();
                creativeUnique[nameSite][0] = key;
                creativeUniqueCount.push(nameSite);
            }

            // Rentre les impressions
            if (creativeImpressions[nameSite]) {
                creativeImpressions[nameSite].splice(
                    creativeImpressions[nameSite].length,
                    1,
                    impressionsSite
                );
            } else {
                creativeImpressions[nameSite] = new Array();
                creativeImpressions[nameSite][0] = impressionsSite;
            }

            // Rentre les Clicks
            if (creativeClicks[nameSite]) {
                creativeClicks[nameSite].splice(creativeClicks[nameSite].length, 1, clicksSite);
            } else {
                creativeClicks[nameSite] = new Array();
                creativeClicks[nameSite][0] = clicksSite;
            }

            // Rentre les Complete
            if (creativeComplete[nameSite]) {
                creativeComplete[nameSite].splice(creativeComplete[nameSite].length, 1, completeSite);
            } else {
                creativeComplete[nameSite] = new Array();
                creativeComplete[nameSite][0] = completeSite;
            }

        }

        //console.log(creativeUnique)

        // Trie les données de creatives
        if (creativeUnique && (creativeUniqueCount.length > 0)) {
            //console.log('creativeUniqueCount.length  '+creativeUniqueCount.length)


            creativeList = new Object();
            for (var ln = 0; ln < creativeUniqueCount.length; ln++) {
                sN = creativeUniqueCount[ln];
                creativeImpressionsSUM = creativeImpressions[sN].reduce(reducer);
                creativeClicksSUM = creativeClicks[sN].reduce(reducer);
                creativeCompleteSUM = creativeComplete[sN].reduce(reducer);
                creativeCtrSUM = parseFloat((creativeClicksSUM / creativeImpressionsSUM) * 100).toFixed(2);
                creativeCtrComplete = parseFloat((creativeCompleteSUM / creativeImpressionsSUM) * 100).toFixed(
                    2
                );

                var itemCreatives = {
                    creative: sN,
                    impressions: creativeImpressionsSUM,
                    clicks: creativeClicksSUM,
                    ctr: creativeCtrSUM,
                    complete: creativeCompleteSUM,
                    ctrComplete: creativeCtrComplete,
                    // viewable_impressions: creativeViewableImpressionsSUM
                };
                creativeList[ln] = itemCreatives;

                // console.log('-----------------')
            }


        }
    }*/


    //  console.log('-----------------')
    // Fais le calcul
    impressionsSUM = impressions.reduce(reducer);
    clicksSUM = clicks.reduce(reducer);
    ctrSUM = eval((clicksSUM / impressionsSUM) * 100).toFixed(2);
    completeSUM = complete.reduce(reducer);

    ctrComplete = eval((completeSUM / impressionsSUM) * 100).toFixed(2);

    resultDateReport = {
        formatKey: formatSearch,
        siteList: siteList,
        //  creativeList:creativeList,
        impressions: impressions.reduce(reducer),
        clicks: clicks.reduce(reducer),
        ctr: ctrSUM,
        complete: completeSUM,
        ctrComplete: ctrComplete,

    };


    return resultDateReport;
}