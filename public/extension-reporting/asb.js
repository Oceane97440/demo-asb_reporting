$(document).ready(function () {
  // var smartadserver_domain = "https://manage.smartadserver.com/";
 // chrome.action.setIcon({ 'path' : 'icon-default.png'});

  const picturesErrors = ["https://i.giphy.com/media/gd09Y2Ptu7gsiPVUrv/giphy.webp",
    "https://i.giphy.com/media/gd09Y2Ptu7gsiPVUrv/giphy.webp",
    "https://i.giphy.com/media/nVTa8D8zJUc2A/200w.webp",
    "https://i.giphy.com/media/8L0Pky6C83SzkzU55a/200w.webp",
    "https://i.giphy.com/media/1jajMAVf2vN9KxoFfw/200w.webp",
    "https://i.giphy.com/media/dILrAu24mU729pxPYN/200.webp",
    "https://i.giphy.com/media/1M9fmo1WAFVK0/200w.webp",
    "https://i.giphy.com/media/xUn3CkCUIGFaW8iIj6/200w.webp",
    "https://i.giphy.com/media/XNX9uw7fykn5e/200.webp",
    "https://i.giphy.com/media/26BRq84rhISRcFVUQ/200w.webp",
    "https://i.giphy.com/media/zcVOyJBHYZvX2/200w.webp",
    "https://i.giphy.com/media/3o6gE8ckqfTuPL3i5a/200w.webp",
    "https://i.giphy.com/media/l2Sq0SUqJtszHlgU8/200.webp",
    "https://i.giphy.com/media/3o7aD3BJA8vIGVaMw0/200.webp",
    "https://i.giphy.com/media/zCpYQh5YVhdI1rVYpE/200.webp",
    "https://i.giphy.com/media/3BL45MJDZABqg/100.webp",
    "https://i.giphy.com/media/rs1er4JfkiRtm/200w.webp",
    "https://media3.giphy.com/media/BmMU3LOfNMMeI/200w.webp",
    "https://media3.giphy.com/media/8w68TkeqzDnLa/200.webp",
    "https://media2.giphy.com/media/1344d72iskFraM/100.webp",
    "https://media4.giphy.com/media/3o7aCTPPm4OHfRLSH6/200.webp",
    "https://media2.giphy.com/media/SiK3lvoO331jA02qh7/200w.webp",
    "https://media2.giphy.com/media/AglyppTq7xWfe/giphy.gif",
    "https://media2.giphy.com/media/ftqLysT45BJMagKFuk/200.webp",
    "https://media0.giphy.com/media/23BST5FQOc8k8/giphy.gif",
    "https://media3.giphy.com/media/1iTIu7WtSfPqMDbW/200w.webp"
  ];

  const random = Math.floor(Math.random() * picturesErrors.length);

  // Vérifie et active l'onglet
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    var hostUrl = tabs[0].url;
   
    var hostASB = 'https://reporting.antennesb.fr/';

    const hostRegex = '(https://manage.smartadserver.com|'+hostASB+'manager)';

    const hostSmartUrlRegex = 'https://manage.smartadserver.com';
    const hostSmartCategory = '([a-zA-Z]+)=([0-9]+)';
    const hostSmartUrlValid = hostUrl.match(hostSmartUrlRegex);
    const hostSmartCategoryValid = hostUrl.matchAll(hostSmartCategory);
    const hostAsbUrlRegex = hostASB+'manager';
    const hostAsbCategory = '([a-zA-Z]+)/([0-9]+)';
    const hostAsbUrlValid = hostUrl.match(hostAsbUrlRegex);
    const hostAsbCategoryValid = hostUrl.matchAll(hostAsbCategory);

    // Si le domaine valide
    if (hostSmartUrlValid || hostAsbUrlValid) {

      // SMARTADSERVER
      if (hostSmartUrlValid) {
        $('body').addClass('asb');
        const arraySmart = [...hostUrl.matchAll(hostSmartCategory)];

        var strCollection = '';

        var length = arraySmart.length;

        if (length > 0) {
          for (var i = 0; i < length; i++) {
            var name = arraySmart[i][1];
            var id = arraySmart[i][2];

            console.log(arraySmart)

            switch (name.toLowerCase()) {
              case 'campagneid':
                $('#card-smart').append('<a href="'+hostASB+'automate/campaign?campaign_id=' + id + '&extension=true" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">visibility</i></span> Visualiser la campagne</a>');
                $('#card-smart').append('<a href="'+hostASB+'automate/campaign/report?campaign_id=' + id + '&extension=true" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">update</i></span> G&eacute;n&eacute;rer un rapport</a>');
                $('#card-smart').append('<a href="'+hostASB+'manager/insertions/create" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">update</i></span> Ajouter des insertions</a>');

                break;
              case 'annonceurid':
                $('#card-smart').append('<a href="'+hostASB+'manager/advertisers/' + id + '&extension=true" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">store</i></span> Visualiser l\'annonceur</a>');
                $('#card-smart').append('<a href="'+hostASB+'manager/advertisers/' + id + '&extension=true" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">sync</i></span> MAJ des campagnes</a>');
                break;
              case 'insertionid':
                $('#card-smart').append('<a href="'+hostASB+'automate/insertion?insertion_id=' + id + '&extension=true" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">view_module</i></span> Visualiser l\'insertion</a>');
            }
          }
        } else {
          $('#card-smart').append('<div class="center-align"> <img src="' + picturesErrors[random] + '" width="250px" /> </div>');
        }

      }

      // ASB
      if (hostAsbUrlValid) {
        const arrayASB = [...hostUrl.matchAll(hostAsbCategory)];

        $('body').addClass('smartadserver');

        var strCollection = '';

        var length = arrayASB.length;
        if (length > 0) {
          for (var i = 0; i < length; i++) {
            var name = arrayASB[i][1];
            var id = arrayASB[i][2];

            switch (name.toLowerCase()) {
              case 'campaigns':
                $('#card-smart').append('<a href="https://manage.smartadserver.com/gestion/smartprog2.asp?CampagneID=' + id + '" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">visibility</i></span> Acc&egrave;der &agrave; la campagne</a>');
                break;
              case 'advertisers':
                $('#card-smart').append('<a href="https://manage.smartadserver.com/gestion/smartprog2.asp?AnnonceurID=' + id + '" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">store</i></span> Acc&egrave;der &agrave; l\'annonceur</a>');
                break;
              case 'insertions':
                $('#card-smart').append('<a href="https://manage.smartadserver.com/gestion/smartprog3.asp?InsertionID=' + id + '" target="_blank" class="collection-item"> <span class="badge"><i class="small material-icons">view_module</i></span> Acc&egrave;der &agrave; l\'insertion</a>');
                break;
            }
          }
        } else {
          $('#card-smart').append('<div class="center-align"> <img src="' + picturesErrors[random] + '" width="250px" /> </div>');
        }

      }
      
    } else {
      $('#card-smart').append('<div class="center-align"> <img src="' + picturesErrors[random] + '" width="250px" /> </div>');
    }

  });

});