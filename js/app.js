// DOM elements
const spinner = document.getElementById('loader');
const selector = document.getElementById('selector');
const resultsList = document.getElementById('results-list');

let selectedOverlay = "Local_Authority_Districts__De-afhpgd";
let hoveredId = null;

// INITIALISE MAP
// mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuZHdhbCIsImEiOiJja2JodjE3bnUwOTNvMnNwdmVpdWU2cXoxIn0.Zwhbvr7YGa2TAE4iNpV6aA';
const map = new mapboxgl.Map({
    container: 'map',
    style: './data/osStyle.json',
    center: [-1.2471735, 50.8625412],
    zoom: 12,
    maxZoom: 22,
    minZoom: 7
});

// Add interaction and show that the map has now loaded
map.on('load', () => {
    spinner.style.display = 'none';
});

// Toggle the forefront polygon coordinates screen
function toggleResults() {
    resultsList.style.display = resultsList.style.display === "block" ? "none" : "block";
}