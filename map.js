let geoJson;
let map;
let previousLayerGroup;

getMapData().then(data => {
  // empty list of crime locations
  geoJson = [];
  data.forEach(function(d) {
    const geoJSONFeature = {
        "type": "Feature",
        "properties": { // could be used to style points
          "offenseCode": +d.OFFENSE_CODE,
          "date": +d.OCCURRED_ON_DATE,
          "info": d.OFFENSE_DESCRIPTION,
          "category": d.category,
          "color": d.color,
          "popup": `Incident Description: ${d.OFFENSE_DESCRIPTION} <br>
          Category: ${d.category} <br>
          Date and Time Occurred: ${d.OCCURRED_ON_DATE}`
        },
    "geometry": {
            "type": "Point",
            "coordinates": [ +d.Long, +d.Lat ] // long and lat for each crime
        }
    };
    geoJson.push(geoJSONFeature); // adding it to the list of all locations to plot
  });
// L = Leaflet name space, pass it the id of our container
  // Define URL for fetching map tiles, and cite source
  map = L.map("map"),
      streetLayer  = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      osmAttrs  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // creating the street layer
  const osmTiles = new L.TileLayer(streetLayer, {
      minZoom: 13,
      attribution: osmAttrs
  });

  centerCrimeMap();
  map.addLayer(osmTiles);  // add the open street map layer

drawDots([])
});

function centerCrimeMap() {
  // Center view on chester square
  const massAndShawmut = new L.LatLng(42.3374647,-71.078591);
  map.setView(massAndShawmut, 15); // initial zoom level so all data visible
}


/**
*
* This function removes the current geoJson layer from the map, and adds a new one, filtering the points if
* a filter is provided.
*
*/
function drawDots(offenseCodeFilter = new Set()) {

  // remove previous layer's dots
  if (previousLayerGroup) {
    previousLayerGroup.eachLayer(layer => map.removeLayer(layer));
  }

  let new_geoJson = geoJson;
  if (offenseCodeFilter.size > 0) {
    new_geoJson = new_geoJson.filter(d => offenseCodeFilter.has(d.properties.offenseCode));
  }

  var geojsonMarkerOptions = {
      radius: 4,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.333
  };

  // adding points to the map, store the layer group
  previousLayerGroup = L.geoJson(new_geoJson, {
    pointToLayer: function (feature, latlng) {
      const dup = Object.assign({}, geojsonMarkerOptions, {fillColor: feature.properties.color});
      return L.circleMarker(latlng, dup);
    }
  }).bindPopup(function (layer) {
    return layer.feature.properties.popup;
  }).addTo(map);

}

