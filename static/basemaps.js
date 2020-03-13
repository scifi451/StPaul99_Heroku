// Define variables for our tile layers
/*
mapbox.streets
mapbox.light
mapbox.dark
mapbox.satellite
mapbox.streets-satellite
mapbox.wheatpaste
mapbox.streets-basic
mapbox.comic
mapbox.outdoors
mapbox.run-bike-hike
mapbox.pencil
mapbox.pirates
mapbox.emerald
mapbox.high-contrast
*/

// Method to create a layer
function createLayer(name) {
  return L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox." + name,
    accessToken: API_KEY
  });
}

// Only one base layer can be shown at a time
var baseMaps = {
  "Streets": createLayer("streets"),
  "Light": createLayer("light"),
  "Dark": createLayer("dark"),
  "Satellite": createLayer("satellite"),
  "Streets Satellite": createLayer("streets-satellite"),
  "Wheatpaste": createLayer("wheatpaste"),
  "Streets Basic": createLayer("streets-basic"),
  "Comic": createLayer("comic"),
  "Outdoors": createLayer("outdoors"),
  "Run Bike Hike": createLayer("run-bike-hike"),
  "Pencil": createLayer("pencil"),
  "Pirates": createLayer("pirates"),
  "Emerald": createLayer("emerald"),
  "High Contrast": createLayer("high-contrast")
};