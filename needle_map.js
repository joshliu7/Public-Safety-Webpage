d3.csv('data.csv').then(data2 => {
    // empty list of crime locations
    geoJson2 = [];
    data2.forEach(function(d) {
      if (d.Description === 'Needle Pickup') {
          const geoJSONFeature2 = {
              "type": "Feature",
              "properties": { // could be used to style points
                "offenseCode": +d.OFFENSE_CODE,
                "info": d.Description,
                "popup": `Date and Time Occurred: ${String(d.open_dt)}`
              },
          "geometry": {
                  "type": "Point",
                  "coordinates": [ +d.Long, +d.Lat ] // long and lat for each crime
              }
          };
      geoJson2.push(geoJSONFeature2); // adding it to the list of all locations to plot
      }
    });
  // L = Leaflet name space, pass it the id of our container
    // Define URL for fetching map tiles, and cite source
    map2 = L.map("needle_map"),
        streetLayer  = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        osmAttrs  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  
    // creating the street layer
    const osmTiles2 = new L.TileLayer(streetLayer, {
        minZoom: 13,
        attribution: osmAttrs
    });
  
    // Center view on chester square
    const massAndShawmut = new L.LatLng(42.3374647,-71.078591);
  
    map2.setView(massAndShawmut, 15); // initial zoom level so all data visible
    map2.addLayer(osmTiles2);  // add the open street map layer
  
  
    var geojsonMarkerOptions2 = {
      radius: 3,
      fillColor: '#f00',
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.333
    };
  
    // adding points to the map, store the layer group
    L.geoJson(geoJson2, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions2);
    }
    }).bindPopup(function (layer) {
    return layer.feature.properties.popup;
    }).addTo(map2);
  });