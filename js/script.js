var width = window.innerWidth,
    height = window.innerHeight,
    populationDomain;

var colorRange = ["#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d73027"];
var populationDomain = [0, 100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2500000, 5000000];  

// Create SVG element
var svg = d3.select("body").insert("svg", "p")
            .attr("width", width)
            .attr("height", height * 0.8)
            .attr("class", "map");

// Projection and path
var projection = d3.geoMercator()
                    .center([118.25, -5])
                    .scale(width * 1.2)
                    .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

// Asynchronous tasks, load topojson map and data
d3.queue()
  .defer(d3.json, "data/IDN.json")
  .defer(d3.csv, "data/IDN.csv")
  .await(ready);

// Callback function
function ready(error, data, population) {
  if (error) throw error;

  // Population data
  var populationData = {};

  population.forEach(function(d) { populationData[d.id] = +d.population; });

  // Color
  var populationColor = d3.scaleThreshold()
                          .domain(populationDomain)
                          .range(colorRange);

  var g = svg.append("g");

  // Draw the map
  g.selectAll("path")
    .attr("class", "city")
    .data(topojson.feature(data, data.objects.IDN).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "black")
    .attr("stroke-width", "0.2")
    .attr("fill", "white")
    .transition().duration(2000)
    .delay(function(d, i) { return i * 5; })
    .ease(d3.easeLinear)
    .attr("fill", function(d) {
      if (!d.properties.HASC_2) {
        return "lightblue";
      } else {
        return populationColor(populationData[d.properties.ID_2]);
      }
    });

  g.selectAll("path")
    .append("title")
    .text(function(d) {
      return d.properties.NAME_2 + " : " + populationData[d.properties.ID_2];
    });
}

d3.select(window).on("resize", resize);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  projection.scale(width * 1.2)
            .translate([width / 2, height / 2]);

  d3.select("svg")
    .attr("width", width)
    .attr("height", height * 0.8);

  d3.selectAll("path")
    .attr("d", path);
}