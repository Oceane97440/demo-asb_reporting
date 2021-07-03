$(document).ready(
	function() {
		
		var dt = new Date();
		
		var date = new Date();
		date.setDate(date.getDate() + 15);
		date.setUTCHours(23);
		date.setUTCSeconds(59);		
		date_end = date.toJSON().slice(0,16);
		
		$('input[type=datetime-local]#date_start').val(new Date().toJSON().slice(0,16));
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

    $('.ajax-link').click(function() { 
      //  var link = $(this).attr('href');
        alert("lol");
        return false;
    })


    // Créer un toast
    function toastWidget(title, time, message) {
       
        var toastHtml = '<div class="toast" aria-live="assertive" aria-atomic="true" style="z-index:9999;top:12px;right:12px;position:fixed">';
        toastHtml += '<div class="toast-header">'
        toastHtml += '<strong class="mr-auto"><i class="fa fa-grav"></i> '+title+'</strong>'
        toastHtml += '<small>'+time+'</small>'
        toastHtml += '<button type="button" class="ml-2 mb-1 close" data-dismiss="toast">'
        toastHtml += '<span aria-hidden="true">&times;</span>'
        toastHtml += '</button>'
        toastHtml += '</div>'
        toastHtml += '<div class="toast-body">'
        toastHtml += '<div class="toast-message"><a href="javascript:location.reload();">'+message+'</a></div>'
        toastHtml += '</div>'
        toastHtml += '</div>'

        $( "#toast-widget" ).append(toastHtml);
      
        $(".toast").toast(
            {
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
              }
        );
        $(".toast").toast('show');
    }

    // Automatisations des éléments
    function automateAction(automate) {
        switch(automate) {
            case "insertions":
                // Récupére les insertions
                $.ajax({ 
                    type: 'GET', 
                    url: config.baseurl+'automate/campaigns/insertions', 
                    dataType: 'json',
                    data : 'campaign_id=' + campaign_id,
                    success: function( data ) {                        
                        toastWidget('Mise à jour des insertions','',data.message);
                        automateAction('creatives');
                    },
                    error: function() { 
                        // swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu aboutir. R\351essayer ult\351rieurement.", "warning"); 
                    },
                    timeout: 300000 
                });
            break;
            case "creatives":
                // Récupére les creatives
                $.ajax({ 
                    type: 'GET', 
                    url: config.baseurl+'automate/campaigns/creatives', 
                    dataType: 'json',
                    data : 'campaign_id=' + campaign_id,
                    success: function( data ) {
                        toastWidget('Mise à jour des créatives','',data.message);
                    },
                    error: function() { 
                        // swal("Erreur", "La g\351n\351ration automatique du mot de passe n'a pu aboutir. R\351essayer ult\351rieurement.", "warning"); 
                    },
                    timeout: 300000 
                });
            break;

        }
    }



    var config = {
                baseurl : "http://localhost:3022/", 
                basedata : "http://localhost:3022/"
             };  

    // Charge les éléments en ajax
    var campaign_id = $('div.card').attr('data-campaign_id');
    var automate = $('div.alert').attr('data-automate');
  
    

    if(campaign_id) { 
       automateAction(automate);
    }
    

});