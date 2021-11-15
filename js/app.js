// DOM elements
const spinner = document.getElementById('loader');
const selector = document.getElementById('selector');
const resultsList = document.getElementById('results-list');

let hoveredId = null;
let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

function addInteraction() {
    let overlayName = "bounds-fill-layer"
    map.on('click', "bounds-fill-layer", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        resultsList.innerText = coordinates.toString();
    });

    // Show data on hover
    map.on('mousemove', "bounds-fill-layer", (e) => {
        if (e.features.length > 0) {
            if (hoveredId) {
                map.setFeatureState(
                    {source: 'bounds', id: hoveredId},
                    {hover: false}
                );
            }
            hoveredId = e.features[0].properties.LAD19NM;
            let title = "Local Authority: ";
            let areaName = e.features[0].properties.LAD19NM;

            map.setFeatureState(
                {source: 'bounds', id: hoveredId},
                {hover: true}
            );

            const text = `<strong>${title} ${areaName}</strong>`;

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
                .setLngLat(e.lngLat)
                .setHTML(text)
                .addTo(map);
        }
    });

    // Remove tooltips on mouseleave
    map.on('mouseleave', "bounds-fill-layer", () => {
        if (hoveredId) {
            map.setFeatureState(
                {source: 'bounds', id: hoveredId},
                {hover: false}
            );
        }
        hoveredId = null;

        popup.remove();
    });
}

// INITIALISE MAP
const openDataTiles = "./data/osStyle.json"
const vectorTileAPI = `https://api.os.uk/maps/vector/v1/vts/resources/styles?key=${key}`
const map = new mapboxgl.Map({
    container: 'map',
    style: vectorTileAPI,
    transformRequest: url => {
        if (url.indexOf("?") > 0) {
            url += '&srs=3857';
        } else {
            url += '?srs=3857';
        }
        return {
            url: url
        }
    },
    // style: openDataTiles,
    center: [-1.2471735, 50.8625412],
    zoom: 12,
    maxZoom: 22,
    minZoom: 1
});

// Add interaction and show that the map has now loaded
map.on('load', () => {
    // addInteraction();
    spinner.style.display = 'none';
    map.addSource('bounds', {
        type: 'geojson',
        // TODO Change 'data' field to source (can be url)
        data: './bounds.geojson'
    });
    map.addLayer({
        'id': 'bounds-fill-layer',
        'type': 'fill',
        'source': 'bounds',
        'paint': {
            "fill-color": "hsla(113, 73%, 36%, 0.55)",
            "fill-outline-color": "rgb(27 ,27 ,29)",
            "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                1,
                0.5
            ]
        }
    });

    // map.addSource('OSBounds', {
    //     type: 'style',
    //     url: `https://api.os.uk/maps/vector/v1/vts/boundaries/?key=${key}`
    // });
    // map.addLayer({
    //     'id': 'OSBounds-layer',
    //     'type': 'bounds',
    //     'source': 'OSBounds',
    //     // 'source-layer': 'contour',
    //     // 'layout': {
    //     //     'line-join': 'round',
    //     //     'line-cap': 'round'
    //     // },
    //     'paint': {
    //         "fill-color": "hsla(113, 73%, 36%, 0.55)",
    //         "fill-outline-color": "rgb(27 ,27 ,29)",
    //     }
    // });
});

// Toggle the forefront polygon coordinates screen
function toggleResults() {
    resultsList.style.display = resultsList.style.display === "block" ? "none" : "block";
}