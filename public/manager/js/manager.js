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





});