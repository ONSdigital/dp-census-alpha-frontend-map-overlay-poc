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

// Colors and options
const colors = [
    'rgb(43, 175, 219)',
    'rgb(234, 56, 179)',
    'rgb(43, 225, 179)',
    'rgb(232, 241, 47)',
    'rgb(247, 93, 43)'
];

const options = {
    'Ethnicity': 'ethnicity',
    'Social grade': 'class',
    'Hours worked': 'hours',
    'Housing type': 'home',
    'Housing tenure': 'tenure'
};

const unitise = {
    'ethnicity': 'people',
    'class': 'people',
    'hours': 'workers',
    'home': 'homes',
    'tenure': 'homes'
};

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

function changeOverlay(selector) {
    selectedOverlay = selector.value;
    map.setLayoutProperty("local-authority-districts-de-afhpgd", 'visibility', 'none');
    map.setLayoutProperty("census-merged-wards-december-6xhk72", 'visibility', 'none');
    map.setLayoutProperty("parishes-december-2019-ew-b-8nw6y1", 'visibility', 'none');
    map.setLayoutProperty(layerIDs[selectedOverlay], 'visibility', 'visible');
    console.log("set visible: " + layerIDs[selectedOverlay])
}

//https://api.mapbox.com/v4/mapbox.enterprise-boundaries-a2-v2/tilequery/12.87,43.100.json?access_token=pk.eyJ1IjoiZGFuZHdhbCIsImEiOiJja2JodjE3bnUwOTNvMnNwdmVpdWU2cXoxIn0.Zwhbvr7YGa2TAE4iNpV6aA

// Function to turn CSV (string) into array of objects
function tsv2json(string) {
    let json = {
        'headers': [],
        'values': {},
        'totals': [],
        'perc': [],
    };
    string = string.replace(/['"]+/g, '');
    let array = string.split('\n');
    let headers = array[0].split('\t');
    headers.shift();
    json.headers = headers;
    for (i in headers) {
        json.totals.push(0);
    }
    for (var i = 1; i < array.length; i++) {
        let row = array[i].split('\t');
        if (row[1]) {
            let tot = 0;
            let counts = [];
            let breaks = [];
            for (j = 1; j < row.length; j++) {
                let val = parseInt(row[j]);
                tot += Math.round(val / 10);
                counts.push(val);
                breaks.push(tot);
                json.totals[j - 1] += val;
            }
            json.values[row[0]] = {
                'counts': counts,
                'breaks': breaks
            }
        }
    }
    let sum = 0;
    for (tot in json.totals) {
        sum += json.totals[tot];
    }
    for (tot in json.totals) {
        let perc = Math.round(100 * (json.totals[tot] / sum));
        json.perc.push(perc);
    }
    return json;
}

// Function to get data
function getData(dim) {
    spinner.style.display = 'flex';
    let dataurl = url[0] + dim + url[1];
    if (!store[dim]) {
        fetch(dataurl)
            .then((response) => {
                return response.text();
            })
            .then((tsvdata) => {
                return tsv2json(tsvdata);
            })
            .then((newdata) => {
                data = newdata;
                store[dim] = newdata;
                genLegend(data);
                clearDots();
                updateDots();
                units.innerHTML = unitise[dim];
                spinner.style.display = 'none';
                return true;
            });
    } else {
        data = store[dim];
        genLegend(data);
        clearDots();
        updateDots();
        units.innerHTML = unitise[dim];
        spinner.style.display = 'none';
    }
}

// Function to add interaction to map
function addInteraction(overlayName) {


    // map.on('click', overlayName.toLowerCase(), (e) => {
    map.on('click', layerIDs[overlayName], (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        console.log("coordinates");
        console.log(coordinates);
    })
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
            areaName = e.features[0].properties.lad15nm;
            map.setFeatureState(
                {source: 'composite', sourceLayer: overlayName, id: hoveredId},
                {hover: true}
            );

            let text = '<strong>Local Authority: ' + areaName + '</strong>';
            for (i in data.headers) {
                text += '<br><span class="dot mr-1" style="background-color:' + colors[i] + ';"></span>' + data.headers[i] + ': ' + data.values[hoveredId].counts[i];
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
                .setLngLat(e.lngLat)
                .setHTML(text)
                .addTo(map);
        }
    });

    // Remove tooltips on mouseleave
    map.on('mouseleave', overlayName.toLowerCase(), () => {
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

// Function to add legend scale
function genLegend(data) {
    let html = '';
    for (i in data.headers) {
        html += '<p class="mb-1"><span class="dot mr-1" style="background-color:' + colors[i] + ';"></span><input type="checkbox" id="legend' + i + '" checked /> <small>' + data.headers[i] + ' <span id="perc' + i + '"></span> <span class="text-secondary">(' + data.perc[i] + '%)</span></small></p>';
    }
    legend.innerHTML = html;
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
map.on('load', function () {
    addInteraction("Local_Authority_Districts__De-afhpgd");
    addInteraction("Parishes-December-2019-EW-B-8nw6y1");
    addInteraction("Census-Merged-Wards-December-6xhk72");
    spinner.style.display = 'none';
});

// Set up an event listener on the map.
map.on('sourcedata', function (e) {
    if (map.areTilesLoaded()) {
        //updateDots();
    }
});