var mymap = L.map('leafletMap').setView([48.686, 6.036], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30
}).addTo(mymap);
var markers = L.markerClusterGroup();

fetch('/recuperer-resultat?queryName=result1', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Réponse réseau incorrecte');
        }
        return response.json();
    })
    .then(data => {
        data.forEach(coord => {
            var marker = L.marker([coord.lat, coord.lon]);
            var popupContent = `<b>propriete :</b> ${coord.propriete}<br>`;
            popupContent += `<b>type : </b> ${coord.type}<br>`;
            if (coord.nuitees) {
                popupContent += `<b>nuitees : </b> ${coord.nuitees}<br>`;
            }
            popupContent += `<b>occup : </b> ${coord.occup}<br>`;
            marker.bindPopup(popupContent); 
            markers.addLayer(marker);
        });
        mymap.addLayer(markers);
    })
    .catch(error => {
        console.error('Erreur : ' + error);
    });





// Appel de la deuxième requête
fetch('/recuperer-resultat?queryName=result2', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
},
})
.then(response => {
    if (!response.ok) {
    throw new Error('Réponse réseau incorrecte');
    }
    return response.json();
})
.then(data => {
    // Utilisez les données récupérées depuis result2
})
.catch(error => {
    console.error('Erreur : ' + error);
});

// Appel de la troisième requête
fetch('/recuperer-resultat?queryName=result3', {
method: 'GET',
headers: {
    'Content-Type': 'application/json',
},
})
.then(response => {
    if (!response.ok) {
    throw new Error('Réponse réseau incorrecte');
    }
    return response.json();
})
.then(data => {
    // Utilisez les données récupérées depuis result3
})
.catch(error => {
    console.error('Erreur : ' + error);
});