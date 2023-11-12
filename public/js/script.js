var mymap = L.map('leafletMap').setView([48.9, 6.036], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30
}).addTo(mymap);
var markers = L.markerClusterGroup();

var map = L.map('heatMap').setView([48.9, 6.2], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30
}).addTo(map);

var heat;
let myChart;
let myDonutChart;

const loadingElement = document.getElementById('loading');
const loadingElement2 = document.getElementById('loading2');

const ctx = document.getElementById('myChart').getContext('2d');
const donutChartCtx = document.getElementById('donutChart').getContext('2d');

myDonutChart = new Chart(donutChartCtx, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(255, 99, 71, 0.9)',
                'rgba(65, 105, 225, 0.9)',
                'rgba(60, 179, 113, 0.9)',
                'rgba(255, 165, 0, 0.9)',
                'rgba(186, 85, 211, 0.9)',
                'rgba(255, 215, 0, 0.9)',
                'rgba(70, 130, 180, 0.9)',
                'rgba(0, 128, 0, 0.9)',
                'rgba(255, 192, 203, 0.9)',
                'rgba(128, 0, 128, 0.9)',
                'rgba(210, 105, 30, 0.9)',
                'rgba(0, 128, 128, 0.9)',
                'rgba(255, 206, 86, 0.9)',
                'rgba(75, 192, 192, 0.9)'
            ],
            borderColor: [
                'rgba(255, 99, 71, 1)',
                'rgba(65, 105, 225, 1)',
                'rgba(60, 179, 113, 1)',
                'rgba(255, 165, 0, 1)',
                'rgba(186, 85, 211, 1)',
                'rgba(255, 215, 0, 1)',
                'rgba(70, 130, 180, 1)',
                'rgba(0, 128, 0, 1)',
                'rgba(255, 192, 203, 1)',
                'rgba(128, 0, 128, 1)',
                'rgba(210, 105, 30, 1)',
                'rgba(0, 128, 128, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        legend: {
            display: true,
            position: 'bottom'
        }
    }
});

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
    // Remodeler les données pour Chart.js
    const labels = data.map(item => item.type);
    const values = data.map(item => item.nombre);

    myDonutChart.data.labels = labels;
    myDonutChart.data.datasets[0].data = values;
    myDonutChart.update();
})
.catch(error => {
console.error('Erreur : ' + error);
});

/*
*/
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

heat = L.heatLayer(heatData, {radius: 25, gradient: {
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
/*
*/

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('myonoffswitch');
    //const dataDisplay = document.getElementById('dataDisplay');

    toggleButton.addEventListener('change', function () {
        if (toggleButton.checked) {
            if (markers) {
                mymap.removeLayer(markers);
                markers = L.markerClusterGroup();
            }
            if (heat) {
                map.removeLayer(heat);
            }
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

                    heat = L.heatLayer(heatData, {radius: 25, gradient: {
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
                //dataDisplay.textContent = "Données de l'option 1";
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
                    // Remodeler les données pour Chart.js
                    const labels = data.map(item => item.type);
                    const values = data.map(item => item.nombre);
                
                    myDonutChart.data.labels = labels;
                    myDonutChart.data.datasets[0].data = values;
                    myDonutChart.update();
                })
                .catch(error => {
                console.error('Erreur : ' + error);
                });
        } else {
            if (markers) {
                mymap.removeLayer(markers);
                markers = L.markerClusterGroup();
            }
            if (heat) {
                map.removeLayer(heat);
            }
            loadingElement.style.display = 'block';
            loadingElement2.style.display = 'block';
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
                    //const heatData = data.map(point => [point.lat, point.lon, point.nuitees]);
                    //const messages = {
                    //    0: "non",
                    //    1: "oui"
                    //};
                    data.forEach(coord => {
                        var marker = L.marker([coord.lat, coord.lon]);
                        var popupContent = `<b>desc :</b> ${coord.descr ? coord.descr : 'non renseigné'}<br>`;
                        popupContent += `<b>type : </b> ${coord.type ? coord.type : 'non renseigné'}<br>`;
                        popupContent += `<b>sstype : </b> ${coord.sstype ? coord.sstype : 'non renseigné'}<br>`;
                        popupContent += `<b>libcom : </b> ${coord.libcom ? coord.libcom : 'non renseigné'}<br>`;
                        popupContent += `<b>libdept : </b> ${coord.libdept ? coord.libdept : 'non renseigné'}<br>`;
                        popupContent += `<b>insee : </b> ${coord.insee ? coord.insee : 'non renseigné'}<br>`;
                        marker.bindPopup(popupContent); 
                        markers.addLayer(marker);
                    });
                    mymap.addLayer(markers);
                    var heatData = data.map(coord => [coord.lat, coord.lon]);
                    //heat = L.heatLayer(heatData, { radius: 20 }).addTo(map);
                    heat = L.heatLayer(heatData, {
                        radius: 20,
                        blur: 15,
                        maxZoom: 17,
                        max: 0.8,
                        gradient: {
                            0.4: 'blue',
                            0.6: 'cyan',
                            0.7: 'yellow',
                            0.8: 'orange',
                            1.0: 'red'
                        }
                    }).addTo(map);
                    //var heatData = [];

                    /*data.forEach(function(item) {
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
                    }}).addTo(map);*/

                    loadingElement.style.display = 'none';
                    loadingElement2.style.display = 'none';
                })
                .catch(error => {
                    console.error('Erreur : ' + error);
                    loadingElement.style.display = 'none';
                    loadingElement2.style.display = 'none';
                });
            //dataDisplay.textContent = "Données de l'option 2";
            fetch('/recuperer-resultat?queryName=result4', {
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
                // Remodeler les données pour Chart.js
                const labels = data.map(item => item.sstype);
                const values = data.map(item => item.nombre);
            
                myDonutChart.data.labels = labels;
                myDonutChart.data.datasets[0].data = values;
                myDonutChart.update();
            })
            .catch(error => {
            console.error('Erreur : ' + error);
            });
        }
            });
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