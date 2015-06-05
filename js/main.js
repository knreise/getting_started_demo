//expose globally to play with in console
var map;


//run code when we are ready. This is a JQuery utility.
$(document).ready(function() {

    // create a leaflet map in the div with the id="map"
    map = L.map('map');
    //control the map to center on the lat/lng and set zoom level
    map.setView([60.18053826658291, 10.28629302978515], 15);

    // Add a background tile map from Stamen design. 
    L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    }).addTo(map);

    // add a marker in the given location, attach some popup content to it and open the popup
    L.marker([60.18053826658291, 10.28629302978515]).addTo(map)
        .bindPopup('Hønefoss')
        .openPopup();

    //create a KNReiseAPI instance. We include (the optional) cartodb-properties. Allows us to later use the CartoDB API integration
    var api = new KR.API({
        cartodb: {
            apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
            user: 'knreise'
        }
    });

    //utility which allows us to use the Javascript console for testing and debugging
    window.loaddata = function() {
        console.log("loaddata");
        loadDigitaltFortaltData();
        loadKulturminneData();
        loadUTGPX();
        loadFolketelling();
    }

    //add a listener to a "single click" event in the map. See: http://leafletjs.com/reference.html#map-events for documentation
    map.on("click", function(e) {
        alert("clicked on: " + e.latlng + "\n loading data ....");

        //load different data sets. Pay attention to the async mode these are loaded. 
        loadFolketelling();
        loadUTGPX();
        loadDigitaltFortaltData();
    });

    //wrapper function for the dataset: kulturminnedata from the SPARQL service
    var loadKulturminneData = function(fylkesnr) {
        fylkesnr = fylkesnr || "6";

        //define the dataset with the respective parameters as documented: 
        //	https://github.com/knreise/KNReiseAPI/blob/master/doc.md
        //  http://knreise.github.io/KNReiseAPI/examples/api.html
        var sparql = {
            limit: 1000,
            api: 'kulturminnedataSparql',
            fylke: fylkesnr
        };

        //fetch the data from the dataset defined above
        api.getData(sparql, function(res) {
            //parse the response as standard geojson and add it to the map. The result is default markers with no interaction
            L.geoJson(res).addTo(map);
        })
    }


    //wraps a complete load of the "folketelling" dataset
    loadFolketelling = function() {
        //setup the folketelling dataset as documented: https://github.com/knreise/KNReiseAPI/blob/master/doc.md and here: http://knreise.github.io/KNReiseAPI/examples/api.html
        var folketelling = {
            api: 'folketelling',
            dataset: 'property',
            limit: 100000
        };

        //the getBbox method of the API can throw errors. We want to gracefully handle these with a try/catch 
        try {
            //get the current bbox defined by the map window and make a string-representation out of it.
            var bbox = map.getBounds().toBBoxString();

            //trigger the getBbox-method on the dataset defined earlier with the bbox defined above, 
            //and a callback function which receives the response when it is ready
            api.getBbox(folketelling, bbox, function(geoJsonObject) {
                //define a custom Leaflet style for the layer. We use this below
                var minstil = {
                    radius: 8,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 0.1,
                    fillOpacity: 0.15
                };

                //Handle the geojson-response with the Leaflet.geoJson method. 
                //this generates a layer consisting of multiple layers - each representing a single feature from the geojson-response
                L.geoJson(geoJsonObject, {
                    //this option overrides the standard way points are generated. 
                    //instead of making a standard Leaflet.Marker - we make a circleMarker which we add our predefined style to
                    //circleMarkers have generally better performance than regular graphic markers.
                    pointToLayer: function(feature, latlng) {
                        return L.circleMarker(latlng, minstil);
                    },
                    //we add a function which is run on each feature. 
                    onEachFeature: function(feature, layer) {
                        //loop through all properties (attributes) of the feature and concatenate in a HTML string
                        var popContent = "";
                        for (var k in feature.properties) {
                            var prop = feature.properties[k];
                            popContent += k + ": " + prop + "<br>";
                        }
                        //bind a popup to the layer with the content generated above.
                        layer.bindPopup(popContent);
                    }
                }).addTo(map);
            });

            //in the event of an error - catch it and alert the user
        } catch (e) {
            console.log(e);
            alert("ERROR folketelling: \n" + e);
        }

    }

    //wrap loading of the "UT.no" dataset
    var loadUTGPX = function(routeid) {
        //default to a route id if none is given. The route id can be found from the ut.no url scheme: http://ut.no/tur/2.9311/
        var routeid = routeid || '2.9311';

        //define the dataset with the respective parameters as documented: 
        //  https://github.com/knreise/KNReiseAPI/blob/master/doc.md
        //  http://knreise.github.io/KNReiseAPI/examples/api.html
        var tur = {
            api: 'utno',
            id: routeid,
            type: 'gpx'
        };

        //fetch data from the dataset defined above with a callback function which receives the response
        api.getData(tur, function(res) {
            //Parse the geojson-response which generates a standard Leaflet Layer and add it to the map.
            L.geoJson(res, {
                //we add a popup to each of the feature layers with content from a feature attributes
                onEachFeature: function(feature, layer) {
                    //generate the html-content from a feature attribute
                    var popContent = "<h1>" + feature.properties.name + "</h1>";
                    layer.bindPopup(popContent);
                }
            }).addTo(map);
        });
    }

    //example of another dataset. Follows the same principle as the rest. 
    var loadDigitaltFortaltData = function() {
        //create the dataset object
        var digitaltFortalt = {
            api: 'norvegiana',
            dataset: 'MUSIT'
        };

        var bbox = map.getBounds().toBBoxString();
        //when button is clicked, call getBbox
        api.getBbox(digitaltFortalt, bbox, function(geoJSON) {
            L.geoJson(geoJSON, {
                onEachFeature: function(feature, layer) {
                    var popContent = "";
                    for (var k in feature.properties) {
                        var prop = feature.properties[k];
                        popContent += k + ": " + prop + "<br>";
                    }
                    layer.bindPopup(popContent);
                }
            }).addTo(map).getBounds();

        });
    }

    var loadCartoDBQuery = function(sql) {
        var query = {
            api: 'cartodb',
            query: sql || 'SELECT ST_AsGeoJSON(the_geom) AS geom FROM fylker WHERE fylkesnr = \'6\''
        };

        api.getData(query, function(result) {
        	console.log(result);
			a = L.geoJson(result).addTo(map);
			console.log(a);
        });
    }
    loadCartoDBQuery();

})