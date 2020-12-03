



document.getElementById("myDIV").style.display = "none";


function myFunction() {

    var x = document.getElementById("format").value;

    
    //console.log(x)

    if (x=="HABILLAGE"|| x=="MASTHEAD" || x=="GRAND ANGLE") {
        
        document.getElementById("myDIV").style.display = "block";
        alert("Cocher la case pour élargir ou non la proposition  " + x )

    }else{

        document.getElementById("myDIV").style.display = "none";
        document.getElementById("alert").style.display = "none";



    }

    return x
    
}

function coche() {

    var cocher = document.getElementById("myCheck").checked;

   // document.getElementById("demo").innerHTML = x;

   console.log(cocher)

    document.getElementById("myCheck").value = cocher;


  }
