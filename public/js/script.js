var mymap = L.map('leafletMap').setView([48.9, 6.036], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30
}).addTo(mymap);
var markers = L.markerClusterGroup();

var map = L.map('heatMap').setView([48.9, 6.2], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30
}).addTo(map);

const loadingElement = document.getElementById('loading');
const loadingElement2 = document.getElementById('loading2');

loadingElement.style.display = 'block';
loadingElement2.style.display = 'block';
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
        //const heatData = data.map(point => [point.lat, point.lon, point.nuitees]);
        const messages = {
            0: "non",
            1: "oui"
        };
        data.forEach(coord => {
            var marker = L.marker([coord.lat, coord.lon]);
            var popupContent = `<b>propriete :</b> ${coord.type ? coord.type : 'non renseigné'}<br>`;
            popupContent += `<b>type : </b> ${coord.type ? coord.type : 'non renseigné'}<br>`;
            popupContent += `<b>nuitees : </b> ${coord.nuitees ? coord.nuitees : 'non renseigné'}<br>`;
            popupContent += `<b>occup : </b> ${coord.occup ? coord.occup : 'non renseigné'}<br>`;
            let message = messages[coord.oeno["data"][0]] || "non renseigné";
            popupContent += `<b>oenologique : </b> ${message}<br>`;
            message = messages[coord.insolite["data"][0]] || "non renseigné";
            popupContent += `<b>insolite : </b> ${message}<br>`;
            marker.bindPopup(popupContent); 
            markers.addLayer(marker);
        });
        mymap.addLayer(markers);

        var heatData = [];

        data.forEach(function(item) {
            for (var i = 0; i < item.nuitees; i++) {
            heatData.push([item.lat, item.lon]);
            }
        });

        L.heatLayer(heatData, {radius: 25, gradient: {
            0.0: 'navy',
            0.3: 'blue',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
        }}).addTo(map);
        loadingElement.style.display = 'none';
        loadingElement2.style.display = 'none';
    })
    .catch(error => {
        console.error('Erreur : ' + error);
        loadingElement.style.display = 'none';
        loadingElement2.style.display = 'none';
    });

    const statusElement = document.getElementById('status');
    const eventSource = new EventSource('/database-status');

    eventSource.onmessage = (event) => {
        const status = event.data;
        statusElement.textContent = `Database Status: ${status}`;
        if (status === 'disconnected') {
            statusElement.style.color = 'red';
        } else {
            statusElement.style.color = 'green';
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error with SSE:', error);
        eventSource.close();
    };

    // Fermer la connexion SSE lorsque la page est fermée ou quittée
    window.addEventListener('beforeunload', () => {
        eventSource.close();
    });