

exports.campaignEpilotSchema = function (data) {

    const formEpilotShcema = {
        advertiser_id: {
            custom: {
                options: value => {
                    return ModelAdvertisers.findOne({
                        where : { advertiser_id: value }
                    }).then(advertiser => {
                        if (advertiser.length === 0) {
                            return Promise.reject('L\'annonceur n\'existe pas')
                        }
                    })
                }
            }
        },   
        campaign_epilot_name: {
            notEmpty: true,
            errorMessage: "Saisir le nom de la campagne"
        },
        campaign_epilot_start_date: {
            notEmpty: true,
            errorMessage: "Saisir la date de début de la campagne"
        },
        campaign_epilot_end_date: {
            notEmpty: true,
            errorMessage: "Saisir la date de fin de la campagne"
        },
        format_id: {
            custom: {
                options: value => {
                    return ModelFormats.findOne({
                        where : { format_id: value } 
                    }).then(format => {
                        if (format.length === 0) {
                            return Promise.reject('Le format n\'existe pas')
                        }
                    })
                }
            }
        },
        campaign_epilot_volume: {
            isInt: true,
            errorMessage: "Saisir le volume de diffusion pour ce format"
        }   
    }

    return formEpilotShcema;

}

