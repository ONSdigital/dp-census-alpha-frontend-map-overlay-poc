// DOM elements
const spinner = document.getElementById('loader');
const selector = document.getElementById('selector');
const resultsList = document.getElementById('results-list');

const layerIDs = {
    "Local_Authority_Districts__De-afhpgd": "local-authority-districts-de-afhpgd",
    "Census_Merged_Wards__December-6xhk72": "census-merged-wards-december-6xhk72",
    "Parishes__December_2019__EW_B-8nw6y1": "parishes-december-2019-ew-b-8nw6y1"
};
let selectedOverlay = "Local_Authority_Districts__De-afhpgd";
let hoveredId = null;


// Create popup class for map tooltips
let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

// Function to change which overlay to display
function changeOverlay() {
    selectedOverlay = selector.value;
    map.setLayoutProperty("local-authority-districts-de-afhpgd", 'visibility', 'none');
    map.setLayoutProperty("census-merged-wards-december-6xhk72", 'visibility', 'none');
    map.setLayoutProperty("parishes-december-2019-ew-b-8nw6y1", 'visibility', 'none');
    map.setLayoutProperty(layerIDs[selectedOverlay], 'visibility', 'visible');
    addInteraction(selectedOverlay)
}

// Function to add interaction to map
function addInteraction(overlayName) {
    map.on('click', layerIDs[overlayName], (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        resultsList.innerText = coordinates.toString();
    });

    // Show data on hover
    map.on('mousemove', layerIDs[overlayName], (e) => {
        if (e.features.length > 0) {
            if (hoveredId) {
                map.setFeatureState(
                    {source: 'composite', sourceLayer: overlayName, id: hoveredId},
                    {hover: false}
                );
            }
            hoveredId = e.features[0].id;
            let title = "";
            let areaName;
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
}

// INITIALISE MAP
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuZHdhbCIsImEiOiJja2JodjE3bnUwOTNvMnNwdmVpdWU2cXoxIn0.Zwhbvr7YGa2TAE4iNpV6aA';
const map = new mapboxgl.Map({
    container: 'map',
    style: './data/style2.json',
    center: [-1.2471735, 50.8625412],
    zoom: 12,
    maxZoom: 22,
    minZoom: 7
});

// Add interaction and show that the map has now loaded
map.on('load', () => {
    addInteraction(selectedOverlay);
    spinner.style.display = 'none';
});

// Toggle the forefront polygon coordinates screen
function toggleResults() {
    resultsList.style.display = resultsList.style.display === "block" ? "none" : "block";
}