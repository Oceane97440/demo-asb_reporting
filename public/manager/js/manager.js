/*var config = {
    baseurl: "http://localhost:3001"
};
*/

$(document).ready(function () {

    var dt = new Date();

    var date = new Date();
    date.setDate(date.getDate() + 15);
    date.setUTCHours(23);
    date.setUTCSeconds(59);
    date_end = date
        .toJSON()
        .slice(0, 16);

    $('input[type=datetime-local]#date_start').val(
        new Date().toJSON().slice(0, 16)
    );
    $('input[type=datetime-local]#date_end').val(date_end);

    $('.table_sort').DataTable({
        "order": [
            [0, "desc"]
        ],
        "lengthMenu": [
            [
                20, 50, 100, -1
            ],
            [
                20, 50, 100, "Tous"
            ]
        ],
        stateSave: true,
        language: {
            processing: "Traitement en cours...",
            search: "Rechercher&nbsp;:",
            lengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
            info: "Affichage de l'&eacute;lement _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eac" +
                "ute;ments",
            infoEmpty: "Affichage de l'&eacute;lement 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
            infoFiltered: "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
            infoPostFix: "",
            loadingRecords: "Chargement en cours...",
            zeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
            emptyTable: "Aucune donnée disponible dans le tableau",
            paginate: {
                first: "Premier",
                previous: "Pr&eacute;c&eacute;dent",
                next: "Suivant",
                last: "Dernier"
            },
            aria: {
                sortAscending: ": activer pour trier la colonne par ordre croissant",
                sortDescending: ": activer pour trier la colonne par ordre décroissant"
            }
        }
    });

    // Lien ajax

    $('.ajax-link').click(function () {
        //  var link = $(this).attr('href');
        alert("lol");
        return false;
    })

    // Créer un toast
    function toastWidget(title, time, message, url = false, target = false) {

        if (!url) {
            url = "javascript:location.reload()";
        }
        if (!target) {
            target = ' target="_blank"';
        }
        var toastHtml = '<div class="toast" aria-live="assertive" aria-atomic="true" style="z-index:999' +
            '9;top:12px;right:12px;position:fixed">';
        toastHtml += '<div class="toast-header">'
        toastHtml += '<strong class="mr-auto"><i class="fa fa-grav"></i> ' + title + '</strong>'
        toastHtml += '<small>' + time + '</small>'
        toastHtml += '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast">'
        toastHtml += '<span aria-hidden="true">&times;</span>'
        toastHtml += '</button>'
        toastHtml += '</div>'
        toastHtml += '<div class="toast-body">'
        toastHtml += '<div class="toast-message"><a href="' + url + '" ' + target + '>' +
            message + '</a></div>'
        toastHtml += '</div>'
        toastHtml += '</div>'

        $("#toast-widget").append(toastHtml);

        $(".toast").toast({
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "md-toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": 300,
            "hideDuration": 1000,
            "timeOut": 5000,
            "extendedTimeOut": 1000,
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        });
        $(".toast").toast('show');
    }

    /*
    $.getJSON(config.baseurl + '/automate/reports', function (data) {

        $.each(data, function (key, campaign) {
            var CurrentDate = (new Date().getTime() / 1000);
            console.log(
                key + " -> " + campaign.campaign_crypt + ' - ' + campaign.timestamp_expiration +
                ' ---- ' + CurrentDate
            )

            if (campaign.timestamp_expiration < CurrentDate) {
                $.ajax({
                    type: 'GET',
                    url: config.baseurl + '/r/report/' + campaign.campaign_crypt,
                    dataType: 'html',
                    success: function (data) {
                        console.log('Url : ' + config.baseurl + '/r/report/' + campaign.campaign_crypt)
                        toastWidget(
                            'Génération d\'un rapport',
                            '',
                            'Le rapport <strong>' + campaign.campaign_name +
                                    '</strong> a bien été généré',
                            config.baseurl + '/r/' + campaign.campaign_crypt
                        );
                    },
                    error: function () {
                        // swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu
                        // aboutir. R\351essayer ult\351rieurement.", "warning");
                    },
                    timeout: 300000
                });
                return false;
            }

        });

    });
    */

    // Automatisations des éléments
    function automateAction(automate) {
        switch (automate) {
            case "campaign-update":
                // Récupére les insertions
                $.ajax({
                    type: 'GET',
                    url: config.baseurl + '/automate/campaign',
                    dataType: 'json',
                    data: 'campaign_id=' + campaign_id,
                    success: function (data) {
                        toastWidget('Mise à jour de la campagne', '', data.message);
                        automateAction('campaign-insertions');
                        //  automateAction('campaign-epilot');
                        // automateAction('campaign-report');*/
                    },
                    error: function () {
                        swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu aboutir. R\351essayer ult\351rieurement.", "warning");
                    },
                    timeout: 300000
                });
                break;
                /*    case "campaign-report":
                        // Récupére les insertions
                        $.ajax({
                            type: 'GET',
                            url: config.baseurl + '/automate/campaign/report',
                            dataType: 'json',
                            data: 'campaign_id=' + campaign_id,
                            success: function (data) {
                                toastWidget('Mise à jour du rapport', '', data.message);
                                // automateAction('campaign-report');
                            },
                            error: function () {
                                swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu aboutir. R\351essayer ult\351rieurement.", "warning");
                            },
                            timeout: 300000
                        });
                        break;
                        */
            case "campaign-insertions":
                // Récupére les insertions
                $.ajax({
                    type: 'GET',
                    url: config.baseurl + '/automate/campaigns/insertions',
                    dataType: 'json',
                    data: 'campaign_id=' + campaign_id,
                    success: function (data) {
                        toastWidget('Mise à jour des insertions', '', data.message);
                        automateAction('campaign-creatives');
                    },
                    error: function () {
                        swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu aboutir. R\351essayer ult\351rieurement.", "warning");
                    },
                    timeout: 300000
                });
                break;
                /* case "campaign-insertions-epilot":
                     // Récupére les insertions d'epilot
                     $.ajax({
                         type: 'GET',
                         url: config.baseurl + '/automate/epilot/insertions',
                         dataType: 'json',
                         data: 'campaign_id=' + campaign_id,
                         success: function (data) {
                             toastWidget('Mise à jour des insertions', '', data.message);
                             automateAction('campaign-creatives');
                         },
                         error: function () {
                             swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu aboutir. R\351essayer ult\351rieurement.", "warning");
                         },
                         timeout: 300000
                     });
                     break;*/
            case "campaign-creatives":
                // $('div.alert-automate').attr('data-automate');
                // var automateData = $('div.alert-automate').attr('data-automate');
                // if(automateData == "campaign-creatives") {  alert('campaign-creatives');  }

                // Récupére les creatives
                $.ajax({
                    type: 'GET',
                    url: config.baseurl + '/automate/campaigns/creatives',
                    dataType: 'json',
                    data: 'campaign_id=' + campaign_id,
                    success: function (data) {
                        toastWidget('Mise à jour des créatives', '', data.message);
                    },
                    error: function () {
                        // swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu
                        // aboutir. R\351essayer ult\351rieurement.", "warning");
                    },
                    timeout: 300000
                });
                break;
                /*   case "campaign-epilot":
                // Réinitialise les données d'Epilot
                $.ajax({
                    type: 'GET',
                    url: config.baseurl + '/automate/campaign/epilot/',
                    dataType: 'json',
                    success: function (data) {
                        toastWidget('Mise à jour des campagnes Epilot', '', data.message);
                    },
                    error: function () {
                        // swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu
                        // aboutir. R\351essayer ult\351rieurement.", "warning");
                    },
                    timeout: 300000
                });
                break;
*/
            case "advertiser-campaigns":
                // Récupére les campagnes des annonceurs console.log(
                // config.baseurl+'automate/advertisers/campaigns?advertiser='+id)
                $.ajax({
                    type: 'GET',
                    url: config.baseurl + '/automate/advertisers/campaigns',
                    dataType: 'json',
                    data: 'advertiser_id=' + advertiser_id,
                    success: function (data) {
                        toastWidget('Mise à jour des campagnes', '', data.message);
                    },
                    error: function () {
                        // swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu
                        // aboutir. R\351essayer ult\351rieurement.", "warning");
                    },
                    timeout: 300000
                });
                break;
        }
    }

    // Charge les éléments en ajax
    var campaign_id = $('div.card').attr('data-campaign_id');
    var advertiser_id = $('div.card').attr('data-advertiser_id');
    var automateData = $('div.alert-automate').attr('data-automate');

    if (campaign_id || advertiser_id) {
        //   automateAction(automateData);

        var IDsAdsLoad = document.querySelectorAll("div[data-automate]");
        if (IDsAdsLoad.length > 0) {
            [].forEach.call(IDsAdsLoad, function (advertiseLoad) {
                //  alert(advertiseLoad.dataset.automate)
                automateAction(advertiseLoad.dataset.automate);
            });
        }

    }

    $('.btn-automate').click(function () {
        var btnAutomate = $(this).attr('data-automate-btn');
        automateAction(btnAutomate);
        return false;
    })

});