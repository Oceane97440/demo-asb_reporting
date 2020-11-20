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
	} 
);