document.getElementById("myDIV").style.display = "none";


function myFunction() {

    var x = document.getElementById("format").value;

    
    console.log(x)

    if (x=="HABILLAGE"|| x=="MASTHEAD" || x=="GRAND ANGLE") {
        
        document.getElementById("myDIV").style.display = "block";
        alert("Coché la case pour élargir ou non la proposition")

    }else{

        document.getElementById("myDIV").style.display = "none";
        document.getElementById("alert").style.display = "none";



    }
    
}