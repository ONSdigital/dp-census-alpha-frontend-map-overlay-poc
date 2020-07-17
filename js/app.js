// API url
const url = [
    './data/',
    '.tsv'
];

// DOM elements
const spinner = document.getElementById('loader');
const selector = document.getElementById('selector');
const legend = document.getElementById('legend');
const units = document.getElementById('units');
const count = document.getElementById('count');
const resultsList = document.getElementById('results-list');


// Set null variables
var data = {
    'headers': [],
    'values': {},
    'totals': [],
    'perc': [],
};
var store = {};

var layerIDs = {
    "Local_Authority_Districts__De-afhpgd": "local-authority-districts-de-afhpgd",
    "Census_Merged_Wards__December-6xhk72": "census-merged-wards-december-6xhk72",
    "Parishes__December_2019__EW_B-8nw6y1": "parishes-december-2019-ew-b-8nw6y1"
};
var selectedOverlay = "Local_Authority_Districts__De-afhpgd";
let hoveredId = null;


// Create popup class for map tooltips
var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

function changeOverlay() {
    selectedOverlay = selector.value;
    map.setLayoutProperty("local-authority-districts-de-afhpgd", 'visibility', 'none');
    map.setLayoutProperty("census-merged-wards-december-6xhk72", 'visibility', 'none');
    map.setLayoutProperty("parishes-december-2019-ew-b-8nw6y1", 'visibility', 'none');
    map.setLayoutProperty(layerIDs[selectedOverlay], 'visibility', 'visible');
    console.log("set visible: " + layerIDs[selectedOverlay]);
    addInteraction(selectedOverlay)
}

//https://api.mapbox.com/v4/mapbox.enterprise-boundaries-a2-v2/tilequery/12.87,43.100.json?access_token=pk.eyJ1IjoiZGFuZHdhbCIsImEiOiJja2JodjE3bnUwOTNvMnNwdmVpdWU2cXoxIn0.Zwhbvr7YGa2TAE4iNpV6aA

// Function to add interaction to map
function addInteraction(overlayName) {
    // map.on('click', overlayName.toLowerCase(), (e) => {
    map.on('click', layerIDs[overlayName], (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        console.log("coordinates");
        console.log(coordinates);
        bodyText = {
            "type": "polygon",
            "coordinates": coordinates
        };
        // fetch('http://34.248.174.250:10000/search/parent/', {
        //     method: 'post',
        //     body: JSON.stringify(bodyText)
        // }).then(function(response) {
        //     return response.json();
        // }).then(function(data) {
        //     console.log('Created Gist:', data.html_url);
        // });
        console.log(resultsList);
        resultsList.innerText = coordinates;
    });
    // Variable for highlighting areas

    // Show data on hover
    // map.on('mousemove', overlayName.toLowerCase(), (e) => {
    map.on('mousemove', layerIDs[overlayName], (e) => {
        console.log('mouse move and features');
        if (e.features.length > 0) {
            if (hoveredId) {
                map.setFeatureState(
                    {source: 'composite', sourceLayer: overlayName, id: hoveredId},
                    {hover: false}
                );
            }
            hoveredId = e.features[0].id;
            console.log("e.features[0].properties");
            console.log(e.features[0].properties);
            let title = "";
            switch (selectedOverlay) {
                case"Local_Authority_Districts__De-afhpgd":
                    title = "Local Authority: ";
                    areaName = e.features[0].properties.lad15nm;
                    break;
                case"Census_Merged_Wards__December-6xhk72":
                    title = "Ward: ";
                    areaName = e.features[0].properties.cmwd11nm;
                    break;
                case"Parishes__December_2019__EW_B-8nw6y1":
                    title = "Parish: ";
                    areaName = e.features[0].properties.par19nm;
                    break;
            }
            map.setFeatureState(
                {source: 'composite', sourceLayer: overlayName, id: hoveredId},
                {hover: true}
            );

            let text = '<strong>' + title + areaName + '</strong>';

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
                .setLngLat(e.lngLat)
                .setHTML(text)
                .addTo(map);
        }
    });

    // Remove tooltips on mouseleave
    map.on('mouseleave', layerIDs[overlayName], () => {
        if (hoveredId) {
            map.setFeatureState(
                {source: 'composite', sourceLayer: overlayName, id: hoveredId},
                {hover: false}
            );
        }
        hoveredId = null;

        popup.remove();
    });

    // Update legend on zoom
    map.on('zoom', function () {
        //updateUnits();
    });
}

// INITIALISE MAP
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuZHdhbCIsImEiOiJja2JodjE3bnUwOTNvMnNwdmVpdWU2cXoxIn0.Zwhbvr7YGa2TAE4iNpV6aA';
var map = new mapboxgl.Map({
    container: 'map',
    style: './data/style.json',
    center: [-1.2471735, 50.8625412],
    zoom: 12,
    maxZoom: 22,
    minZoom: 7
});

// ADD LAYERS + DATA ONCE MAP IS INITIALISED
map.on('load', () => {
    addInteraction(selectedOverlay);
    spinner.style.display = 'none';
});

function toggleResults() {
    resultsList.style.display = resultsList.style.display === "block" ? "none" : "block";
}