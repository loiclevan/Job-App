/**
 * Created by levan on 25/10/2015.
 */
var map;
var geocoder;
var locale;
var query;
var infowindow;
var jobNummertje = 0;
var markers = [];


//Map meteen inladen
function initMap() {
    var myOptions = {
        center: {lat: 51.053468, lng: 3.73038},
        zoom: 9,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"),
        myOptions);
    infowindow = new google.maps.InfoWindow();
}
//Bij enter na intypen stad ook de functie aanroepen.
$('document').ready(function(){
    $('#l').keypress(function(e){
        if(e.which == 13){//Enter key pressed
            generateXMLq();
        }
    });
});

//Bij klik op searchbutton --> locatie in "locale" steken en linkerbalk tonen + starten van ophalen van jobs
function generateXMLq(){
    locale = document.getElementById("l").value;
    document.getElementById("control").style.display = "block";
    getXML();
}

//Bij klik op searchbutton --> zoekopdracht in "query" steken en linkerbalk tonen + starten van ophalen van jobs
function generateXMLqByJob(){
    query = document.getElementById("q").value;
    document.getElementById("control").style.display = "block";
    getXMLByJob();
}

//ophalen jobs by location
function getXML(){
    var xmlRQ = new XMLHttpRequest();
    xmlRQ.open("GET","getxml.php?l="+locale, true);
    xmlRQ.send();
    xmlRQ.onreadystatechange=function(){
        if (xmlRQ.readyState==4 && xmlRQ.status==200)
        {
            var res = xmlRQ.responseText;
            var parser=new DOMParser();
            var xmlDoc=parser.parseFromString(res,"text/xml");
            parseXML(xmlDoc);
        }
    };
    MaakLijstLeeg();
    MaakTitelLeeg();
}

//ophalen jobs by job
function getXMLByJob(){
    var xmlRQ = new XMLHttpRequest();
    xmlRQ.open("GET","getxml.php?q="+query, true);
    xmlRQ.send();
    xmlRQ.onreadystatechange=function(){
        if (xmlRQ.readyState==4 && xmlRQ.status==200)
        {
            var res = xmlRQ.responseText;
            var parser=new DOMParser();
            var xmlDoc=parser.parseFromString(res,"text/xml");
            parseXML(xmlDoc);
        }
    };
    MaakLijstLeeg();
    MaakTitelLeeg();
}

function parseXML(data){
    var results = data.getElementsByTagName("result");
    console.log(results);
    //titel boven jobs weergeven
    var item = document.getElementById("control");
    var titeltje = document.createElement('h2');
    titeltje.innerHTML = "Beschikbare jobs in de regio: "+"</br>";
    titeltje.className = "titeltje";
    titeltje.style.marginBottom = "30px";
    titeltje.style.fontVariant = "small-caps";
    titeltje.style.fontSize = "20px";
    item.appendChild(titeltje);

    for(var i=0; i<results.length ;i++){
        plot(results[i],i);
        jobNummertje += 1;
    }
    center();
}


/* Map centreren rond de huidige stad */
function center() {
    geocoder.geocode({'address': locale}, function(results,status){
        if(status == google.maps.GeocoderStatus.OK){
            map.setCenter(results[0].geometry.location);
            map.setZoom(11);
            map.panBy(300, 0)
        }
        else
            alert('Action was not successful for the following reason: ' + status);
    });
}

//objecten maken van alle jobs
function plot(jobInfo,z){
    var deets = {
        "lat":jobInfo.getElementsByTagName("latitude")[0].childNodes[0].nodeValue,
        "long":jobInfo.getElementsByTagName("longitude")[0].childNodes[0].nodeValue,
        "jobtitle":jobInfo.getElementsByTagName("jobtitle")[0].childNodes[0].nodeValue,
        "company": jobInfo.getElementsByTagName("company")[0].childNodes[0].nodeValue,
        "formloc":jobInfo.getElementsByTagName("formattedLocation")[0].childNodes[0].nodeValue,
        "url": jobInfo.getElementsByTagName("url")[0].childNodes[0].nodeValue,
        "zvalue": z,
        "nummertje": jobNummertje
    };
    jobNummertje = deets.nummertje;

    VoegJobToeAanLijst(deets);
    //Klik op jobinfo --> marker op de map
    var temp = jobNummertje;
    $('#jobnr'+temp).click(function(e){
        console.log(deets);
        clearMarkers();
        center();
        addMarkers(deets);

        // Wegschrijven in localstorage welke job laatst geklikt werd.
        if(typeof(Storage) !== "undefined") {
            localStorage.job = $('#jobnr'+temp+' #jobDivInfo').html();
            //var str = document.getElementsByTagName("</br>");
            //var res = str.replace("</br>", "    ");
        } else {
            console.log("No web storage support.");
        }
    });
}

//Eerst lijst leegmaken van vorige zoekopdracht
function MaakLijstLeeg(){
    $(".jobke").remove();
}

//Titel leegmaken anders meerdere titels
function MaakTitelLeeg(){
    $(".titeltje").remove();
}

/* Lijst links aanmaken van beschikbare jobs */
function VoegJobToeAanLijst(job){
    var item = document.getElementById("control");
    item.style.borderTop = "1px solid #7ACCC8 ";
    var div = document.createElement('div');
    div.style.float = "left";
    div.style.width = "230px";
    div.style.height = "150px";
    div.style.backgroundColor = "#7ACCC8";
    div.style.margin = "25px 5px";
    div.style.borderRadius = "3px";
    div.id = "jobnr"+jobNummertje;
    div.className = "jobke";
    div.innerHTML = "<h4>Job Informatie:</h4>" + "<p id='jobDivInfo'>"+job.jobtitle + " - " + job.company
    + "</br>" + "<i>" + job.formloc + "</i></p>";
    item.appendChild(div);
}

//markers op de map plaatsen
function addMarkers(info){
    var coor = new google.maps.LatLng(info["lat"],info["long"]);
    var iconImage = {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue.png'
    };

    var marker = new google.maps.Marker({
        icon: iconImage,
        position: coor,
        animation: google.maps.Animation.DROP,
        title: info["jobtitle"],
        map: map,
        zIndex: info["z"]
    });
    markers.push(marker);
    var jobInfo = '<div id="inhoud">'+
        '<h1><a href="'+info["url"]+'" target="_blank">'
         +info["jobtitle"]+'</a> - '+info["company"]+'</h1>'+
        '<p class="jobLocatie">'+info["formloc"]+
        '</p>';


    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setOptions({
            content: jobInfo,
            position: coor,
            zIndex: info["z"]
        });

        infowindow.open(map,marker);
    });
}
//Alle markers van de map halen, maar in de array behouden
function clearMarkers(){
    setMapOnAll(null);
}
//Alle markers in de array op de map zetten --> in elke stad dat er een job werd bekeken.
function setMapOnAll(map){
    for(var i=0;i < markers.length;i++){
        markers[i].setMap(map);
    }
}

/* BUTTON CLICK CURRENT LOCATION */
// Locatie ophalen en lat+long omzetten in STAD
function getLocation(){
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) {
                    var result = results[0];
                    var stad = result.address_components[2].long_name;
                    locale = stad;
                    document.getElementById("control").style.display = "block";
                    getXML();
                }
            })
        });
    }
    else {
        alert("Your browser doesn't support geolocation");
    }
}

