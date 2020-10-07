$(document).ready(
	function() {
		$('.table').DataTable();
		alert(Date.now());
		$('#card-forecast input#date_d').val(Date.now());
	} 
);