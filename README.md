# demo-asb_reporting
Pour changer de bdd en ligne vers une bdd local il faut:
<ul>
<li>importer la bdd demo_asb_reporting dans phpmyadmin</li>
<li>changer _configdatabase -> config.database sans le _ <il> 
</ul>


14/05/2021
<ul>
<li>Ajout des formats slider, rectangle vidéo sur la page api_reports</li>
<li>Création du sidebar menu de l'admin</li>
<li>Problème sur la table "insertions" : Dans la base de données la clé étrangére pour "campaign_id" a été faite sur "_asb_campaigns" (une table qui n'existe pas) - La modification a été faite</li>
<li>Intégrer le module "moment" pour transfromer les dates</li>
<li>Ajout du script DataTables sur l'ensemble des tables "Manage"</li>
<li>Rajout des formats SLIDER et RECTANGLE VIDEO pour le reporting</li>
</ul>
