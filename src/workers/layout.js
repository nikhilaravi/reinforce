importScripts("https://d3js.org/d3-collection.v1.min.js")
importScripts("https://d3js.org/d3-dispatch.v1.min.js")
importScripts("https://d3js.org/d3-quadtree.v1.min.js")
importScripts("https://d3js.org/d3-timer.v1.min.js")
importScripts("https://d3js.org/d3-force.v1.min.js")

var width, height, nodes, links, 
  force = d3.forceSimulation()

onmessage = function(event) {
  if(event.data.type === 'initialize') {
    width = event.data.width
    height = event.data.height

    nodes = event.data.nodes
    links = event.data.links

    force.nodes(nodes)
      .force("link", d3.forceLink().id(function(d) { return d.id}))
      .force("charge", d3.forceManyBody().strength(-10).distanceMax(200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("vertical", d3.forceY().strength(0.01))
      .force("horizontal", d3.forceX().strength(0.01))
      .velocityDecay(0.6)
  } else {
    links = JSON.parse(event.data.links)
    force.force("link").links(links)
    force.alphaTarget(0.1).restart()
    postMessage({ nodes: nodes, links: links })
  }
}