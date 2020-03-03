
//*********** Start function declarations ***********/
// 1. create a function to parse date into month-year
function parseDate (date)
{
    var datePart = date.split('/');
    var mon = datePart[0].substring(0,2);
    var year = datePart[2].substring(0,2);
    return year.concat('-',mon);
};

// 2. create a funtion that sorts the keys by year, month
function sortObj(unsortedObj) {
  var sortedObj = Object.keys(unsortedObj)
  .sort()
  .reduce((acc, key) => ({
      ...acc, [key]: unsortedObj[key]
  }), {})
  return sortedObj;
};

// 3. create a function that returns the months array as months M1, M2, M3, etc.
function monthFormat(date){
  var months =[];
  date.forEach( function(each, index){
    // console.log(`index ${index+1} ${each}` );
    months.push('M'.concat(index+1));
  });
  return months;
};

//4.  Create a function that displays the Chartist chart

function createChartist(data)
{

  var response = data;
  var stopCount = {};
  for (i=0;i < response.length; i++)
  {
      var currentDate = parseDate(response[i].Date);
      if (currentDate in stopCount){
          stopCount[currentDate] +=1;
      } 
      else {
          stopCount[currentDate]=1;
      }
  
  };
  // sort the array of stops using the function aboe d3.json
  sortedObj = sortObj(stopCount);
  console.log(sortedObj);

  // create an array of keys 
  keys = Object.keys(sortedObj);  
  
  // convert the dates into the format M1..M24 using the funtion above d3.json
  var months = monthFormat(keys);
  console.log(months);
  
  // convert values into an array 
  values = Object.values(sortedObj);


  // >>>> create a "Chartist"  line graph
  var chart = new Chartist.Line('#chart2', {
    labels: months,
    series: [values],

  }, 
    {
    low: 0,
    showLine: false,
    // axisX: {
    //   showLabel: true,
    //   offset: 10
    // },
    // axisY: {
    //   showLabel: true,
    //   offset: 10
    // },
    // width: '800px',
    // height: '200px',
      
  });
  
  // >>>> Chartist aninamted time series chart code starts here...
  // Let's put a sequence number aside so we can use it in the event callbacks
  var seq = 0;

  // Once the chart is fully created we reset the sequence
  chart.on('created', function() {
    seq = 0;
  });
  
  // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
  chart.on('draw', function(data) {
    if(data.type === 'point') {
      // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
      data.element.animate({
        opacity: {
          // The delay when we like to start the animation
          begin: seq++ * 80,
          // Duration of the animation
          dur: 500,
          // The value where the animation should start
          from: 0,
          // The value where it should end
          to: 1
        },
        x1: {
          begin: seq++ * 80,
          dur: 500,
          from: data.x - 100,
          to: data.x,
          // You can specify an easing function name or use easing functions from Chartist.Svg.Easing directly
          easing: Chartist.Svg.Easing.easeOutQuart
        }
      });
    }
  });
  
  // For the sake of the example we update the chart every time it's created with a delay of 8 seconds
  chart.on('created', function() {
    if(window.__anim0987432598723) {
      clearTimeout(window.__anim0987432598723);
      window.__anim0987432598723 = null;
    }
    window.__anim0987432598723 = setTimeout(chart.update.bind(chart), 8000);
  });
  
  
    // >>>> Chartlist animated time series ends here 
    
};

// 5. function that returns an array of occurances by a catetory
function rateByCategory(data, item) {
    
  var rate = {};

  for (i=0; i < data.length; i++) {
      var category = data[i][item];
      if (category in rate) {
          
          rate[category] +=1;
      }
      else {
          rate[category] =1;
      }
  }
  return rate;
};
// 6. Create a function that displays the Plotly data.

function createPlotly(data, layout) {

  Plotly.newPlot('plot', data, layout)

};

/******************************************************* */
// All setup and Functions needed to create the map
/******************************************************* */
// Grab the grid line data
const stPaulPrecincts = "static/Saint_Paul_Police_Grid.geojson";
const stPaulDistricts = "static/District_Council_Shapefile_Map.geojson";

// Grab the traffic data
const trafficdataPath = "/trafficdata";
const startLocation = [44.95, -93.09];

// define the overlays
var overlays = {
    "TrafficStops":     {"name" : "TrafficStops","label" : "Traffic Stops", "geojson": "", "legend": L.control({ position: "topleft" })},
    "White":            {"name" : "White", "label" : "Race: White", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Black":            {"name" : "Black", "label" : "Race: Black", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Asian":            {"name" : "Asian", "label" : "Race: Asian", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Latino":           {"name" : "Latino", "label" : "Race: Latino", "geojson": "", "legend": L.control({ position: "topleft" })},
    "NativeAmerican":   {"name" : "NativeAmerican", "label" : "Race: Native American", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Other":            {"name" : "Other", "label" : "Race: Other", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Female":           {"name" : "Female", "label" : "Gender: Female", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Male":             {"name" : "Male", "label" : "Gender: Male", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Searched":         {"name" : "Searched", "label" : "Searched", "geojson": "", "legend": L.control({ position: "topleft" })},
    "Pins":             {"name" : "Pins", "label" : "Traffic Stop Locations", "geojson": "", "legend": L.control({ position: "bottomleft" })}
};

// Variable for tracking number of stops within a grid number
// will need to add this count to the geo json for the choropleth
var countsByGrid = {
    "TrafficStops": {},
    "White": {},
    "Black": {},
    "Asian": {},
    "Latino": {},
    "NativeAmerican": {},
    "Other": {},
    "Female": {},
    "Male": {},
    "Searched": {}
};

/******************************************************* */
// Define functions for the Map
/******************************************************** */

// funtion to get choropleth color
// adapted from:  https://leafletjs.com/examples/choropleth/
function getColor(count) 
{
    return count > 1000 ? '#800026' :
           count > 500  ? '#BD0026' :
           count > 200  ? '#E31A1C' :
           count > 100  ? '#FC4E2A' :
           count > 50   ? '#FD8D3C' :
           count > 20   ? '#FEB24C' :
           count > 10   ? '#FED976' :
                          '#FFEDA0';
}

// function to set style for choropleth
// adapted from: https://leafletjs.com/examples/choropleth/
function style(feature) {
    return {
        fillColor: getColor(feature.properties.stops),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// function to convert location to an array of lattidue and longitude
function lat_lon(location)
{
    var lat_lon = location.split(',');
    latitude = lat_lon[0].substring(1, lat_lon[0].length);
    longitude = lat_lon[1].substring(0, lat_lon[1].length-1 );
    return {lat: latitude, lon: longitude};
};

// Function to calculate stops by gridnum
function calculateStopsByGrid(data)
{
    for (i=0; i<data.length; i++)
    {
        // Convert to Int to remove .0 then back to string
        // and increment or start count accordingly
        var currentGrid = parseInt(data[i].Grid).toString();
        if (currentGrid in countsByGrid.TrafficStops)
            countsByGrid.TrafficStops[currentGrid] += 1;
        else
            countsByGrid.TrafficStops[currentGrid] = 1;

        // increment for race
        switch (data[i].Race)
        {
            case ("White"):
            {
                if (currentGrid in countsByGrid.White)
                    countsByGrid.White[currentGrid] += 1;
                else
                    countsByGrid.White [currentGrid] = 1;
                break;
            }
            case ("Black"):
            {
                if (currentGrid in countsByGrid.Black)
                    countsByGrid.Black[currentGrid] += 1;
                else
                    countsByGrid.Black[currentGrid] = 1;
                break;
            }
            case ("Asian"):
            {
                if (currentGrid in countsByGrid.Asian)
                    countsByGrid.Asian[currentGrid] += 1;
                else
                    countsByGrid.Asian[currentGrid] = 1;
                break;
            }
            case ("Latino"):
            {
                if (currentGrid in countsByGrid.Latino)
                    countsByGrid.Latino[currentGrid] += 1;
                else
                    countsByGrid.Latino[currentGrid] = 1;
                break;
            }
            case ("Native American"):
            {
                if (currentGrid in countsByGrid.NativeAmerican)
                    countsByGrid.NativeAmerican[currentGrid] += 1;
                else
                    countsByGrid.NativeAmerican[currentGrid] = 1;
                break;
            }
            default: // Other
            {
                if (currentGrid in countsByGrid.Other)
                    countsByGrid.Other[currentGrid] += 1;
                else
                    countsByGrid.Other[currentGrid] = 1;
                break;
            }
        }

        // increment for gender
        switch (data[i].Gender)
        {
            case ("Female"):
            {
                if (currentGrid in countsByGrid.Female)
                    countsByGrid.Female[currentGrid] += 1;
                else
                    countsByGrid.Female[currentGrid] = 1;
                break;
            }
            default: // Male
            {
                if (currentGrid in countsByGrid.Male)
                    countsByGrid.Male[currentGrid] += 1;
                else
                    countsByGrid.Male[currentGrid] = 1;
                break;
            }
        }

        if (data[i].VehicleSearched === "Yes" || data[i].DriverSearched === "Yes")
        {
            if (currentGrid in countsByGrid.Searched)
                countsByGrid.Searched[currentGrid] += 1;
            else
                countsByGrid.Searched[currentGrid] = 1;

        }
    }
}

// Add properties and counts to the geojson file
function addCountsToGeojson(data)
{
    // Loop through the geojson file to add the property stop count
    for (c=0; c<data.features.length; c++)
    {
        // Create temp variables
        let gridNum = data.features[c].properties.gridnum;
        let properties = data.features[c].properties;

        // NOTE:  The geojson file has an error in gridnum that we are correcting here
        if (gridNum === "367")
            gridNum = "267";

        // Check first if the grid is valid, if so assign the count otherwise set to 0
        properties.TrafficStops = (gridNum in countsByGrid.TrafficStops) ? countsByGrid.TrafficStops[gridNum] : 0;
        properties.White = (gridNum in countsByGrid.White) ? countsByGrid.White[gridNum] : 0;
        properties.Black = (gridNum in countsByGrid.Black) ? countsByGrid.Black[gridNum] : 0;
        properties.Asian = (gridNum in countsByGrid.Asian) ? countsByGrid.Asian[gridNum] : 0;
        properties.Latino = (gridNum in countsByGrid.Latino) ? countsByGrid.Latino[gridNum] : 0;
        properties.NativeAmerican = (gridNum in countsByGrid.NativeAmerican) ? countsByGrid.NativeAmerican[gridNum] : 0;
        properties.Other = (gridNum in countsByGrid.Other) ? countsByGrid.Other[gridNum] : 0;
        properties.Female = (gridNum in countsByGrid.Female) ? countsByGrid.Female[gridNum] : 0;
        properties.Male = (gridNum in countsByGrid.Male) ? countsByGrid.Male[gridNum] : 0;
        properties.Searched = (gridNum in countsByGrid.Searched) ? countsByGrid.Searched[gridNum] : 0;
    }
}

// Function to create a choropleth
function createChoropleth(currentLayer, data)
{
    return L.choropleth(data, 
    {
        // Define what  property in the features to use
        valueProperty: currentLayer.name,

        // Set color scale
        scale: ["#E2E7F5", "#071696"],

        // Number of breaks in step range
        steps: 10,

        // q for quartile, e for equidistant, k for k-means
        mode: "q",
        style: {
            // Border color
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8
        },

        // Binding a pop-up to each layer
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h6>District: " + feature.properties.dist + "</h6><hr>Grid Number:  " 
            + feature.properties.gridnum + "<div>" + currentLayer.label + ":  " + feature.properties[currentLayer.name] + "</div>"
            + "<div>" + "Total Stops in Grid:" + ":  " + feature.properties.TrafficStops + "</div>"
            + "<div>Percent of Grid = " + (100 * feature.properties[currentLayer.name] / feature.properties.TrafficStops).toFixed(0) + "\%</div>");
        }
    }).addTo(overlayMaps[currentLayer.name]);
}


// Function to create a legend
function createLegend(geojson, label, legend) 
{
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojson.options.limits;
        var colors = geojson.options.colors;
        var labels = [];

        // Add min & max
        var legendInfo = "<div></div>";

        div.innerHTML = legendInfo;

        labels.push("<li style=" 
        + "list-style-type:none"
        + ";text-align:center;"
        + "\">" + "<h5><font color=\"black\">" + label + "</font></h5></li>");

        limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] 
            + ";list-style-type:none"
            + ";text-align:center;"
            + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };
}

// Function to create an icon
function createIcon(type, iColor, mColor, form)
{
    return L.ExtraMarkers.icon({
        icon: type,
        iconColor: iColor,
        markerColor: mColor,
        shape: form
    }); 
}

// Function to create Choropleth overlays
function createChoroplethOverlays(data)
{
    for (var key in overlays)
    {
        // NOTE:  The Pins Layer has its own legend
        if (key != "Pins")
        {
            let currentLayer = overlays[key];
            currentLayer.geojson = createChoropleth(currentLayer, data);
            createLegend(currentLayer.geojson, currentLayer.label, currentLayer.legend);
        }
    }
}

// Function to create the pins for each stop
function createPins(response)
{
    // Create a marker cluster group
    var markers = L.markerClusterGroup();
    
    // Loop through data
    for (var i = 0; i < response.length; i++) 
    {
        let searched = "No";

        // Set the data location property to a variable
        var location = lat_lon(response[i].Location);

        // Check for location property
        if (location) 
        {
            let selectedIcon, iconType, iconColor;

            // If there was a search, we will use an alert icon, otherwise male or female sign
            if (response[i].DriverSearched === "Yes" || response[i].VehicleSearched === "Yes")
            {
                iconType = "ion-alert";
                iconColor = "red";
                searched = "Yes";
            }
            else
            {
                iconType = response[i].Gender === "Female" ? "ion-female" : "ion-male";
                iconColor = "white";
                searched = "No";
            }

            switch (response[i].Race)
            {
                case ("White"): selectedIcon = createIcon(iconType, iconColor, "pink", "square"); break;
                case ("Black"): selectedIcon = createIcon(iconType, iconColor, "blue", "square"); break;
                case ("Latino"): selectedIcon = createIcon(iconType, iconColor, "purple", "square"); break;
                case ("Native American"): selectedIcon = createIcon(iconType, iconColor, "yellow", "square"); break;
                case ("Asian"): selectedIcon = createIcon(iconType, iconColor, "green", "square"); break;
                default: selectedIcon = createIcon(iconType, iconColor, "orange", "square"); break;
            }
    
            // Now add the marker at the proper location and create the popup
            markers.addLayer(L.marker([location.lat, location.lon], {icon: selectedIcon})
                .bindPopup("<div><b>" /*+ "Reason: "*/ +  response[i].Reason + "</b></div><hr>"
                    + "<div>" + response[i].Race + " " + response[i].Gender + "</div>"
                    + "<div>Ticket Issued: " +  response[i].Citation + "</div>"
                    + "<div>Driver and/or Vehicle Searched:  " + searched + "</div>"
                    + "<div>Date:  " + response[i].Date + "</div>"
                    + "<div>Grid Number:  " + response[i].Grid + "</div>"
            ));
        }
    }

    // Add our marker cluster layer to the map  
    markers.addTo(overlayMaps.Pins);
}

// Create Pin Legend
function createPinLegend(legend)
{
    legend.onAdd = function() 
    {
        var div = L.DomUtil.create("div", "pin legend");
        var pinLabels = [];

        // Add min & max
        var legendInfoPin = "<div></div>";

        div.innerHTML = legendInfoPin;

        // Blue: 1371BA, Orange: F18C20, Pink: C0539E, Purple: 5C396D, Green: 06924A, Yellow: F4BB39 
        let liStyle1 = "<li style=\"background-color: ";
        let liStyle2a = ";list-style-type:none;text-align:center;\"><font color=\"white\">";
        let liStyle2b = "white;list-style-type:none;text-align:center;\"><font color=\"black\"><span class=\"ion-male\">";
        let liStyle3a = "</font></li>";
        let liStyle3b = "</span></font></li>";

        pinLabels.push("<li style=list-style-type:none;text-align:center;\">" + "<h5><font color=\"black\">Icon Legend</font></h5></li>");
        pinLabels.push(liStyle1 + "#C0539E" + liStyle2a + "White" + liStyle3a);
        pinLabels.push(liStyle1 + "#1371BA" + liStyle2a + "Black" + liStyle3a);
        pinLabels.push(liStyle1 + "#5C396D" + liStyle2a + "Latino" + liStyle3a);
        pinLabels.push(liStyle1 + "#06924A" + liStyle2a + "Asian" + liStyle3a);
        pinLabels.push(liStyle1 + "#F18C20" + liStyle2a + "Other" + liStyle3a);
        pinLabels.push(liStyle1 + "#F4BB39" + liStyle2a + "Native American" + liStyle3a);

        pinLabels.push(liStyle1 + liStyle2b + "   Male" + liStyle3b);
        pinLabels.push(liStyle1 + liStyle2b + "   Female" + liStyle3b);
        pinLabels.push(liStyle1 + liStyle2b + "   Searched" + liStyle3b);

        div.innerHTML += "<ul>" + pinLabels.join("") + "</ul>";
        return div;
    };
}

// Function to create the geojson outline of regions
function createGeojsonOverlay(data, overlay, outlineColor)
{
    L.geoJson(data, 
    {
        // Style each feature (in this case a neighborhood)
        style: function(feature) 
        {
        return {
            color: outlineColor,
            fillOpacity: 0.0,
            weight: 2.0
        };
        }
    }).addTo(overlay);
}

/****************************************************** */
// Start Map Creation
/****************************************************** */

// Create a dictionary of overlays
var overlayMaps = {
    "Precincts":        L.layerGroup(),
    "Districts":        L.layerGroup(),
    "Pins":             L.layerGroup(),
    "TrafficStops":     L.layerGroup(),
    "Districts":        L.layerGroup(),
    "White":            L.layerGroup(),
    "Black":            L.layerGroup(),
    "Asian":            L.layerGroup(),
    "Latino":           L.layerGroup(),
    "NativeAmerican":   L.layerGroup(),
    "Other":            L.layerGroup(),
    "Female":           L.layerGroup(),
    "Male":             L.layerGroup(),
    "Searched":         L.layerGroup()
};

// Create map object
var stPaulMap = L.map("map", {
    center: startLocation,
    zoom: 12,
    layers: [baseMaps.Outdoors, overlayMaps.TrafficStops]
  });

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(stPaulMap); 


//**************************************************/
//***   Main d3 processing section                    */
//*************************************************/
d3.json('trafficdata').then(function(data) {
    console.log(data);
    // Subset the date by Reason, DriverSearched, Vehicle Searched
    var Equipment = data.filter(it => it.Reason.includes('Equipment Violation'));
    var Investigate = data.filter(it => it.Reason.includes('Investigative Stop'));
    var Moving = data.filter(it => it.Reason.includes('Moving Violation'));
    var Call = data.filter(it => it.Reason.includes('911 Call / Citizen Reported'));

    var DriverSearched = data.filter(it => it.DriverSearched.includes('Yes'));
    var VehicleSearched = data.filter(it => it.VehicleSearched.includes ('Yes'));

    var SelectedOption = d3.select("#selDataset").property("value");
    // Assign the value of the dropdown menu option to a variable
    console.log('SelectedOption ',SelectedOption );

    // set the option variable
    if (SelectedOption == "race"){
      var option = "Race";
      console.log("Race selected")
    } else if (SelectedOption =="gender"){
      var option = "Gender";
      console.log("Gender selected")
    }
    // Get counts of Reason, DriverSearced, VehicleSearced by Gender
    var countbyEquipment= rateByCategory(Equipment, option);
    var countbyInvestigate = rateByCategory(Investigate,option);
    var countbyMoving = rateByCategory(Moving,option);
    var countbyCall = rateByCategory(Call,option);
    var countbyDriverSearched = rateByCategory(DriverSearched, option);
    var countbyVehicleSearched = rateByCategory(VehicleSearched, option);


  
    //set up plotly traces
    var trace1 ={
        x: Object.keys(countbyEquipment),
        y: Object.values(countbyEquipment),
        name: 'Stop reason: Equipment Vilolation',
        type: 'bar',
        xaxis: 'x1'
    };

    var trace2 = {
        x: Object.keys(countbyInvestigate),
        y: Object.values(countbyInvestigate),
        name: 'Stop reason: Investigative Stop',
        type: 'bar',
        xaxis: 'x1'
    };
    var trace3 = {
        x: Object.keys(countbyMoving),
        y: Object.values(countbyMoving),
        name: 'Stop reason: Moving Violation',
        type: 'bar',
        xaxis: 'x1'
    };
    var trace4 = {
        x: Object.keys(countbyCall),
        y: Object.values(countbyCall),
        name: 'Stop reason: 911 Call/Citizen Reported',
        type: 'bar',
        xaxis: 'x1'
    };

    var trace5 = {
        x: Object.keys(countbyDriverSearched),
        y: Object.values(countbyDriverSearched),
        name: 'Driver Searched',
        type: 'bar',
        xaxis:'x2'
    };
    var trace6 = {
        x: Object.keys(countbyVehicleSearched),
        y: Object.values(countbyVehicleSearched),
        name: 'Vehicle Searched',
        type: 'bar',
        xaxis: 'x2'
    };

    var plotData =[trace1, trace2, trace3, trace4, trace5, trace6];

    // setup the layout
    var layout = {
          //  height: 600,
          //  width: 800,
            barmode: 'stack',
              xaxis: {
                domain: [0, 0.50],
                anchor: 'x1',
                automargin: true, 
                title: {
                  text: "Reason for Stops",
                  standoff: 30
                } 
              },
              xaxis2: {
                domain: [0.50, 1.0],
                anchor: 'x2',
                automargin: true, 
                title: {
                  text: "Driver/Vehicle Searched",
                  standoff: 30
                } 
              }
      };
    // create the Plotly bar chart
    createPlotly(plotData,layout);
    
    // create the Chartist animted chart
    createChartist(data);

      // Calculate how many stops in each grid
      calculateStopsByGrid(data);

      // Create the pins that represent each stop
      createPins(data);
  
      // Grabbing our GeoJSON data..
      d3.json(stPaulPrecincts).then(function(distData, err) 
      {
          // cut to error function if problem comes up in code
          if (err) throw err;
  
          // For each Precinct Grid, add the filtered traffic stops
          // IF the property does not exist, add it
          addCountsToGeojson(distData);
  
          // Create new Choropleth overlays
          createChoroplethOverlays(distData);
  
          // Add the Traffic Stop totals as the default legend
          overlays.TrafficStops.legend.addTo(stPaulMap);
  
          // Creating a geoJSON layer with the retrieved data
          createGeojsonOverlay(distData, overlayMaps.Precincts, "orange");
  
          // Set up the pin legend
          createPinLegend(overlays.Pins.legend);
      });

    // set up an event listener on the selDataset dropdown menu
    d3.select("#selDataset").on("change", function(){
      var SelectedOption = d3.select("#selDataset").property("value");
      // Assign the value of the dropdown menu option to a variable
      console.log('SelectedOption ',SelectedOption );

      // set the option variable
      if (SelectedOption == "race"){
        var option = "Race";
        console.log("Race selected")
      } else if (SelectedOption =="gender"){
        var option = "Gender";
        console.log("Gender selected")
      }
      // Get counts of Reason, DriverSearced, VehicleSearced by Gender
      var countbyEquipment= rateByCategory(Equipment, option);
      var countbyInvestigate = rateByCategory(Investigate,option);
      var countbyMoving = rateByCategory(Moving,option);
      var countbyCall = rateByCategory(Call,option);
      var countbyDriverSearched = rateByCategory(DriverSearched, option);
      var countbyVehicleSearched = rateByCategory(VehicleSearched, option);


      //update plotly traces
      var trace1 ={
          x: Object.keys(countbyEquipment),
          y: Object.values(countbyEquipment),
          name: 'Stop reason: Equipment Vilolation',
          type: 'bar',
          xaxis: 'x1'
      };

      var trace2 = {
          x: Object.keys(countbyInvestigate),
          y: Object.values(countbyInvestigate),
          name: 'Stop reason: Investigative Stop',
          type: 'bar',
          xaxis: 'x1'
      };
      var trace3 = {
          x: Object.keys(countbyMoving),
          y: Object.values(countbyMoving),
          name: 'Stop reason: Moving Violation',
          type: 'bar',
          xaxis: 'x1'
      };
      var trace4 = {
          x: Object.keys(countbyCall),
          y: Object.values(countbyCall),
          name: 'Stop reason: 911 Call/Citizen Reported',
          type: 'bar',
          xaxis: 'x1'
      };

      var trace5 = {
          x: Object.keys(countbyDriverSearched),
          y: Object.values(countbyDriverSearched),
          name: 'Driver Searched',
          type: 'bar',
          xaxis:'x2'
      };
      var trace6 = {
          x: Object.keys(countbyVehicleSearched),
          y: Object.values(countbyVehicleSearched),
          name: 'Vehicle Searched',
          type: 'bar',
          xaxis: 'x2'
      };

      var plotData =[trace1, trace2, trace3, trace4, trace5, trace6];

      // update the layout
      var layout = {
        //  height: 600,
        //  width: 800,
          barmode: 'stack',
            xaxis: {
              domain: [0, 0.50],
              anchor: 'x1',
              automargin: true, 
              title: {
                text: "Reason for Stops",
                standoff: 30
              } 
            },
            xaxis2: {
              domain: [0.50, 1.0],
              anchor: 'x2',
              automargin: true, 
              title: {
                text: "Driver/Vehicle Searched",
                standoff: 30
              } 
            }
      };
      createPlotly(plotData,layout);
  
    });

}).catch (function (error) {
  console.log(error);
});

// manage overlays

d3.json(stPaulDistricts).then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    // Creating a geoJSON layer with the retrieved data
    createGeojsonOverlay(data, overlayMaps.Districts, "green");
});

// Render the legend when an overlay is selected
stPaulMap.on('overlayadd', function (eventLayer) 
{
    if (eventLayer.name in overlays)
        overlays[eventLayer.name].legend.addTo(stPaulMap);
});

// Remove the legend when an overlay is de-selected
stPaulMap.on('overlayremove', function (eventLayer) 
{
    if (eventLayer.name in overlays)
        stPaulMap.removeControl(overlays[eventLayer.name].legend);
});



